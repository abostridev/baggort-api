const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTP } = require('../../utils/whatsapp');
const {
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
} = require('./auth.queries');

const generateOTPCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = () => {
  // Token aléatoire cryptographiquement sûr
  return crypto.randomBytes(64).toString('hex');
};

const register = async ({ name, phone, role }) => {
  const existing = await findUserByPhone(phone);
  if (existing) {
    const err = new Error('Ce numéro est déjà enregistré');
    err.status = 409;
    throw err;
  }

  const user = await createUser({ name, phone, role });

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await saveOTP({ phone, code, expiresAt });
  await sendOTP(phone, code);

  return {
    message: `Compte créé. Un code a été envoyé au ${phone}`,
    phone,
    role: user.role,
  };
};

const login = async ({ phone }) => {
  const user = await findUserByPhone(phone);
  if (!user) {
    const err = new Error('Numéro non reconnu. Inscris-toi d\'abord.');
    err.status = 404;
    throw err;
  }

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await saveOTP({ phone, code, expiresAt });
  await sendOTP(phone, code);

  return {
    message: `Code envoyé au ${phone}`,
    phone,
  };
};

const verifyOTP = async ({ phone, code }) => {
  const otp = await findValidOTP({ phone, code });
  if (!otp) {
    const err = new Error('Code invalide ou expiré');
    err.status = 401;
    throw err;
  }

  await markOTPUsed(otp.id);
  const user = await markUserVerified(phone);

  // Génère les deux tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Sauvegarde le refresh token en base
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await saveRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: refreshExpiresAt,
  });

  return {
    user,
    accessToken,
    refreshToken,
    expiresIn: '24h',
  };
};

const refreshAccessToken = async (refreshToken) => {
  const tokenData = await findRefreshToken(refreshToken);
  if (!tokenData) {
    const err = new Error('Session expirée, reconnecte-toi');
    err.status = 401;
    throw err;
  }

  const user = {
    id: tokenData.user_id,
    name: tokenData.name,
    phone: tokenData.phone,
    role: tokenData.role,
    is_verified: tokenData.is_verified,
  };

  const newAccessToken = generateAccessToken(user);

  return {
    accessToken: newAccessToken,
    expiresIn: '24h',
  };
};

const logout = async (refreshToken) => {
  await deleteRefreshToken(refreshToken);
};

const uploadDocument = async ({ userId, type, fileUrl }) => {
  const doc = await saveDriverDocument({ userId, type, fileUrl });
  return doc;
};

module.exports = {
  register,
  login,
  verifyOTP,
  refreshAccessToken,
  logout,
  uploadDocument,
};