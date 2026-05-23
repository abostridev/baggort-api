const {
  register,
  login,
  verifyOTP,
  uploadDocument,
} = require('./auth.service');
const {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
} = require('./auth.validation');
const authMiddleware = require('../../middlewares/auth');
const { upload, uploadToCloudinary } = require('../../middlewares/upload');

const registerController = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details.map(d => d.message).join(', '),
      });
    }
    const result = await register(value);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    const result = await login(value);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const verifyOTPController = async (req, res, next) => {
  try {
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    const result = await verifyOTP(value);
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const uploadDocumentController = [
  authMiddleware,
  upload.single('document'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Aucun fichier reçu',
        });
      }

      const { type } = req.body;
      const validTypes = ['id_card', 'license', 'vehicle_card', 'insurance', 'photo'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type de document invalide',
        });
      }

      // Upload vers Cloudinary
      const folder = `baggort/drivers/${req.user.id}`;
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, folder);

      const doc = await uploadDocument({
        userId: req.user.id,
        type,
        fileUrl: cloudinaryResult.secure_url,
      });

      res.status(201).json({
        success: true,
        message: 'Document uploadé avec succès',
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  },
];

const { refreshAccessToken, logout } = require('./auth.service');

const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token manquant',
      });
    }

    const result = await refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const logoutController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await logout(refreshToken);
    }
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerController,
  loginController,
  verifyOTPController,
  uploadDocumentController,
  refreshTokenController,
  logoutController,
};