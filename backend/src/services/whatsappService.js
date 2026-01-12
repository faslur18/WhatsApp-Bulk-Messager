import axios from 'axios';
import { config } from '../config/config.js';

class WhatsAppService {
  constructor() {
    this.baseURL = config.whatsapp.apiUrl;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.accessToken = config.whatsapp.accessToken;
  }

  /**
   * Send a template message to a single recipient
   * @param {string} to - Recipient phone number (with country code)
   * @param {string} templateName - Name of the approved template
   * @param {string} languageCode - Language code (default: 'en')
   * @param {Array} variables - Array of variable values for the template
   * @returns {Promise<Object>} Response from WhatsApp API
   */
  async sendTemplateMessage(to, templateName, languageCode = 'en', variables = []) {
    try {
      const url = `${this.baseURL}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };

      // Add components if variables are provided
      if (variables && variables.length > 0) {
        payload.template.components = [
          {
            type: 'body',
            parameters: variables.map(value => ({
              type: 'text',
              text: value,
            })),
          },
        ];
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data,
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.error?.message || error.message,
          details: error.response?.data,
        },
      };
    }
  }

  /**
   * Get list of message templates
   * @returns {Promise<Array>} List of templates
   */
  async getTemplates() {
    try {
      const url = `${this.baseURL}/${config.whatsapp.businessAccountId}/message_templates`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          limit: 100,
        },
      });

      return {
        success: true,
        templates: response.data.data,
      };
    } catch (error) {
      console.error('Error fetching templates:', error.response?.data || error.message);
      
      return {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.error?.message || error.message,
        },
      };
    }
  }

  /**
   * Verify webhook signature (for security)
   * @param {string} mode - Webhook mode
   * @param {string} token - Verify token
   * @param {string} challenge - Challenge string
   * @returns {string|null} Challenge if valid, null otherwise
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === config.webhook.verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Parse webhook payload to extract message status updates
   * @param {Object} payload - Webhook payload from WhatsApp
   * @returns {Array} Array of status updates
   */
  parseWebhookPayload(payload) {
    const updates = [];

    try {
      if (payload.entry) {
        for (const entry of payload.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.value?.statuses) {
                for (const status of change.value.statuses) {
                  updates.push({
                    messageId: status.id,
                    status: status.status, // sent, delivered, read, failed
                    timestamp: status.timestamp,
                    recipientId: status.recipient_id,
                    errors: status.errors,
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
    }

    return updates;
  }

  /**
   * Generate a WhatsApp share link for manual group sharing
   * @param {string} message - Pre-filled message text
   * @returns {string} WhatsApp share URL
   */
  generateShareLink(message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  }
}

export default new WhatsAppService();
