const pool = require('../../config/database');

const findUserByPhone = async (phone) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE phone = $1 AND is_active = TRUE',
    [phone]
  );
  return result.rows[0] || null;
};

const createUser = async ({ name, phone, role }) => {
  const result = await pool.query(
    `INSERT INTO users (name, phone, role)
     VALUES ($1, $2, $3)
     RETURNING id, name, phone, role, is_verified, created_at`,
    [name, phone, role]
  );
  return result.rows[0];
};

const saveOTP = async ({ phone, code, expiresAt }) => {
  // On supprime les anciens OTP du même numéro avant d'en créer un nouveau
  await pool.query('DELETE FROM otp_codes WHERE phone = $1', [phone]);
  const result = await pool.query(
    `INSERT INTO otp_codes (phone, code, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [phone, code, expiresAt]
  );
  return result.rows[0];
};

const findValidOTP = async ({ phone, code }) => {
  const result = await pool.query(
    `SELECT * FROM otp_codes
     WHERE phone = $1
       AND code = $2
       AND used = FALSE
       AND expires_at > NOW()`,
    [phone, code]
  );
  return result.rows[0] || null;
};

const markOTPUsed = async (id) => {
  await pool.query('UPDATE otp_codes SET used = TRUE WHERE id = $1', [id]);
};

const markUserVerified = async (phone) => {
  const result = await pool.query(
    `UPDATE users SET is_verified = TRUE, updated_at = NOW()
     WHERE phone = $1
     RETURNING id, name, phone, role, is_verified`,
    [phone]
  );
  return result.rows[0];
};

const saveDriverDocument = async ({ userId, type, fileUrl }) => {
  const result = await pool.query(
    `INSERT INTO driver_documents (user_id, type, file_url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, type, fileUrl]
  );
  return result.rows[0];
};

const saveRefreshToken = async ({ userId, token, expiresAt }) => {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, token, expiresAt]
  );
  return result.rows[0];
};

const findRefreshToken = async (token) => {
  const result = await pool.query(
    `SELECT rt.*, u.id as user_id, u.name, u.phone, u.role, u.is_verified
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = $1
       AND rt.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
};

const deleteRefreshToken = async (token) => {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

const deleteAllUserRefreshTokens = async (userId) => {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

module.exports = {
  findUserByPhone,
  createUser,
  saveOTP,
  findValidOTP,
  markOTPUsed,
  markUserVerified,
  saveDriverDocument,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
};