const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerController,
  loginController,
  verifyOTPController,
  uploadDocumentController,
  refreshTokenController,
  logoutController,
} = require('./auth.controller');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Trop de tentatives, réessaie dans 15 minutes',
  },
});

router.post('/register',         authLimiter, registerController);
router.post('/login',            authLimiter, loginController);
router.post('/verify-otp',       authLimiter, verifyOTPController);
router.post('/refresh',          refreshTokenController);
router.post('/logout',           logoutController);
router.post('/upload-document',  uploadDocumentController);

module.exports = router;