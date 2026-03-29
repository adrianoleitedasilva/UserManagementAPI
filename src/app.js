require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// ─── Segurança ───────────────────────────────────────────────────────────────
app.use(helmet()); // define headers HTTP de segurança
app.use(cors());   // habilita CORS para todas as origens (ajuste em produção)

// ─── Parse de body ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logging de requisições ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API no ar',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Rotas ───────────────────────────────────────────────────────────────────
app.use('/users', userRoutes);

// ─── Middlewares de erro (sempre por último) ─────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
