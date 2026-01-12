import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bulk',
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // WhatsApp Cloud API
  whatsapp: {
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    apiUrl: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v18.0'}`,
  },
  
  // Webhook
  webhook: {
    verifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
  },
  
  // Queue Configuration
  queue: {
    messageDelay: 2000, // 2 seconds between messages
    maxRetries: 3,
  },
  
  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

// Validate required environment variables
export const validateConfig = () => {
  const required = [
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_ACCESS_TOKEN',
    'WEBHOOK_VERIFY_TOKEN',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Some features may not work correctly. Please configure your .env file.');
  }
  
  return missing.length === 0;
};
