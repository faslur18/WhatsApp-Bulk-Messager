import express from 'express';
import {
  getTemplates,
  generateShareLink,
  verifyWebhook,
  handleWebhook,
} from '../controllers/whatsappController.js';

const router = express.Router();

router.get('/templates', getTemplates);
router.post('/share-link', generateShareLink);

// Webhook routes
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleWebhook);

export default router;
