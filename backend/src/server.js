import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config/config.js';
import { connectDB } from './config/database.js';

// Import routes
import contactRoutes from './routes/contactRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Initialize queue service (starts the worker)
import './services/queueService.js';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // CORS
app.use(morgan(config.env === 'development' ? 'dev' : 'combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// API Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Bulk Sender API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Other errors
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Validate configuration
    validateConfig();

    // Connect to database
    await connectDB();

    // Start listening
    app.listen(config.port, () => {
      console.log('='.repeat(50));
      console.log('🚀 WhatsApp Bulk Sender API Server');
      console.log('='.repeat(50));
      console.log(`📡 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`🔗 API URL: http://localhost:${config.port}`);
      console.log(`💚 Health Check: http://localhost:${config.port}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
