const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Security & core middleware
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/purchases', require('./routes/purchase.routes'));
app.use('/api/sales', require('./routes/sale.routes'));
app.use('/api/inventory-logs', require('./routes/inventoryLog.routes'));

// Additional route groups will be mounted here in later phases

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
