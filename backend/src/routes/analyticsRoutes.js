import express from 'express';
import MessageLog from '../models/MessageLog.js';
import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import { getQueueStats } from '../services/queueService.js';

const router = express.Router();

/**
 * Get overall analytics summary
 */
router.get('/summary', async (req, res) => {
  try {
    const [
      totalContacts,
      totalCampaigns,
      activeCampaigns,
      totalMessages,
      queueStats,
    ] = await Promise.all([
      Contact.countDocuments({ isActive: true }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'in_progress' }),
      MessageLog.countDocuments(),
      getQueueStats(),
    ]);

    // Get message status breakdown
    const statusBreakdown = await MessageLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      queued: 0,
      sending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    statusBreakdown.forEach(item => {
      stats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        totalContacts,
        totalCampaigns,
        activeCampaigns,
        totalMessages,
        messageStats: stats,
        queueStats,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics summary',
      error: error.message,
    });
  }
});

/**
 * Get message logs with filters
 */
router.get('/logs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      campaignId,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (campaignId) {
      query.campaignId = campaignId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await MessageLog.find(query)
      .populate('contactId', 'name phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await MessageLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching message logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message logs',
      error: error.message,
    });
  }
});

/**
 * Get queue status
 */
router.get('/queue', async (req, res) => {
  try {
    const stats = await getQueueStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue stats',
      error: error.message,
    });
  }
});

export default router;
