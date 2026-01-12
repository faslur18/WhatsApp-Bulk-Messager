import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import MessageLog from '../models/MessageLog.js';
import { queueBulkMessages } from '../services/queueService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create and send a new campaign
 */
export const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      templateName,
      templateLanguage = 'en',
      targetTags = [],
      variables = [],
    } = req.body;

    // Validate required fields
    if (!name || !templateName) {
      return res.status(400).json({
        success: false,
        message: 'Campaign name and template name are required',
      });
    }

    // Get target contacts
    const query = { isActive: true };
    if (targetTags.length > 0) {
      query.tags = { $in: targetTags };
    }

    const contacts = await Contact.find(query);

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No contacts found matching the criteria',
      });
    }

    // Create campaign
    const campaign = await Campaign.create({
      name,
      description,
      templateName,
      templateLanguage,
      targetTags,
      totalContacts: contacts.length,
      status: 'in_progress',
      startedAt: new Date(),
      stats: {
        queued: contacts.length,
      },
    });

    // Create message logs and queue messages
    const messageLogs = [];
    const queueData = [];

    for (const contact of contacts) {
      const messageLog = await MessageLog.create({
        campaignId: campaign._id,
        contactId: contact._id,
        phoneNumber: contact.formatPhoneNumber(),
        templateName,
        templateLanguage,
        variables,
        status: 'queued',
      });

      messageLogs.push(messageLog);

      queueData.push({
        messageLogId: messageLog._id,
        phoneNumber: contact.formatPhoneNumber(),
        templateName,
        languageCode: templateLanguage,
        variables,
        campaignId: campaign._id,
      });
    }

    // Queue all messages
    await queueBulkMessages(queueData);

    res.status(201).json({
      success: true,
      message: `Campaign created and ${contacts.length} messages queued`,
      data: {
        campaign,
        totalMessages: contacts.length,
      },
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign',
      error: error.message,
    });
  }
};

/**
 * Get all campaigns
 */
export const getCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const campaigns = await Campaign.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Campaign.countDocuments();

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns',
      error: error.message,
    });
  }
};

/**
 * Get campaign by ID with detailed stats
 */
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Get message logs for this campaign
    const messageLogs = await MessageLog.find({ campaignId: campaign._id })
      .populate('contactId', 'name phoneNumber')
      .sort({ createdAt: -1 });

    // Calculate real-time stats
    const stats = {
      queued: messageLogs.filter(m => m.status === 'queued').length,
      sending: messageLogs.filter(m => m.status === 'sending').length,
      sent: messageLogs.filter(m => m.status === 'sent').length,
      delivered: messageLogs.filter(m => m.status === 'delivered').length,
      read: messageLogs.filter(m => m.status === 'read').length,
      failed: messageLogs.filter(m => m.status === 'failed').length,
    };

    // Update campaign stats
    campaign.stats = stats;
    
    // Check if campaign is completed
    if (stats.queued === 0 && stats.sending === 0 && campaign.status === 'in_progress') {
      campaign.status = 'completed';
      campaign.completedAt = new Date();
    }
    
    await campaign.save();

    res.json({
      success: true,
      data: {
        campaign,
        messageLogs,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign',
      error: error.message,
    });
  }
};

/**
 * Get campaign analytics
 */
export const getCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Get message logs with status breakdown
    const messageLogs = await MessageLog.find({ campaignId });

    // Calculate analytics
    const analytics = {
      total: campaign.totalContacts,
      sent: campaign.stats.sent,
      delivered: campaign.stats.delivered,
      read: campaign.stats.read,
      failed: campaign.stats.failed,
      deliveryRate: campaign.totalContacts > 0 
        ? ((campaign.stats.delivered / campaign.totalContacts) * 100).toFixed(2) 
        : 0,
      readRate: campaign.stats.delivered > 0 
        ? ((campaign.stats.read / campaign.stats.delivered) * 100).toFixed(2) 
        : 0,
      failureRate: campaign.totalContacts > 0 
        ? ((campaign.stats.failed / campaign.totalContacts) * 100).toFixed(2) 
        : 0,
    };

    // Get failed messages with error details
    const failedMessages = messageLogs
      .filter(m => m.status === 'failed')
      .map(m => ({
        phoneNumber: m.phoneNumber,
        errorCode: m.errorCode,
        errorMessage: m.errorMessage,
        failedAt: m.failedAt,
      }));

    res.json({
      success: true,
      data: {
        campaign: {
          id: campaign._id,
          name: campaign.name,
          createdAt: campaign.createdAt,
          status: campaign.status,
        },
        analytics,
        failedMessages: failedMessages.slice(0, 50), // Limit to first 50
      },
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign analytics',
      error: error.message,
    });
  }
};
