require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Route de santé — pour vérifier que l'API tourne
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BAGGORT API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`BAGGORT API démarrée sur http://localhost:${PORT}`);
});

module.exports = { app, io };