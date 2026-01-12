import whatsappService from '../services/whatsappService.js';
import MessageLog from '../models/MessageLog.js';
import Campaign from '../models/Campaign.js';

/**
 * Get all message templates from WhatsApp
 */
export const getTemplates = async (req, res) => {
  try {
    const result = await whatsappService.getTemplates();

    if (result.success) {
      // Filter only approved templates
      const approvedTemplates = result.templates.filter(
        t => t.status === 'APPROVED'
      );

      res.json({
        success: true,
        data: approvedTemplates,
        total: approvedTemplates.length,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch templates',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message,
    });
  }
};

/**
 * Generate WhatsApp share link for manual group sending
 */
export const generateShareLink = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    const shareLink = whatsappService.generateShareLink(message);

    res.json({
      success: true,
      data: {
        shareLink,
        message,
      },
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating share link',
      error: error.message,
    });
  }
};

/**
 * Webhook verification endpoint
 */
export const verifyWebhook = (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const result = whatsappService.verifyWebhook(mode, token, challenge);

    if (result) {
      console.log('✅ Webhook verified successfully');
      res.status(200).send(result);
    } else {
      console.error('❌ Webhook verification failed');
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('Error verifying webhook:', error);
    res.sendStatus(500);
  }
};

/**
 * Webhook handler for WhatsApp status updates
 */
export const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;

    // Acknowledge receipt immediately
    res.sendStatus(200);

    // Parse the webhook payload
    const updates = whatsappService.parseWebhookPayload(payload);

    if (updates.length > 0) {
      console.log(`📬 Received ${updates.length} status updates`);

      // Process each update
      for (const update of updates) {
        try {
          const messageLog = await MessageLog.findOne({ messageId: update.messageId });

          if (messageLog) {
            const oldStatus = messageLog.status;

            // Update status based on webhook
            await messageLog.updateStatus(update.status, {
              errorCode: update.errors?.[0]?.code,
              errorMessage: update.errors?.[0]?.message,
            });

            console.log(`📊 Updated message ${update.messageId}: ${oldStatus} → ${update.status}`);

            // Update campaign stats
            if (oldStatus !== update.status) {
              const campaign = await Campaign.findById(messageLog.campaignId);
              if (campaign) {
                // Decrement old status count
                if (campaign.stats[oldStatus] > 0) {
                  campaign.stats[oldStatus]--;
                }
                // Increment new status count
                campaign.stats[update.status] = (campaign.stats[update.status] || 0) + 1;
                await campaign.save();
              }
            }
          }
        } catch (error) {
          console.error(`Error processing update for message ${update.messageId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    // Still return 200 to prevent WhatsApp from retrying
    res.sendStatus(200);
  }
};
