require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BAGGORT API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route introuvable' });
});

// Erreurs globales
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`BAGGORT API démarrée sur http://localhost:${PORT}`);
});

module.exports = { app, io };