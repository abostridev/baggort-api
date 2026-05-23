const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] ${status} - ${message}`);
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;