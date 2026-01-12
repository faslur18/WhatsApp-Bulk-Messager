import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  getCampaignAnalytics,
} from '../controllers/campaignController.js';

const router = express.Router();

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.get('/:campaignId/analytics', getCampaignAnalytics);

export default router;
