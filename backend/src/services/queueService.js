import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/config.js';
import whatsappService from './whatsappService.js';
import MessageLog from '../models/MessageLog.js';
import Campaign from '../models/Campaign.js';

// Create Redis connection
const connection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
});

// Create message queue
export const messageQueue = new Queue('whatsapp-messages', {
  connection,
  defaultJobOptions: {
    attempts: config.queue.maxRetries,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 seconds
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
    },
  },
});

// Create worker to process messages
export const messageWorker = new Worker(
  'whatsapp-messages',
  async (job) => {
    const { 
      messageLogId, 
      phoneNumber, 
      templateName, 
      languageCode, 
      variables, 
      campaignId 
    } = job.data;

    try {
      console.log(`📤 Sending message to ${phoneNumber}...`);

      // Update status to sending
      const messageLog = await MessageLog.findById(messageLogId);
      if (!messageLog) {
        throw new Error('Message log not found');
      }
      
      messageLog.status = 'sending';
      await messageLog.save();

      // Send the message via WhatsApp API
      const result = await whatsappService.sendTemplateMessage(
        phoneNumber,
        templateName,
        languageCode,
        variables
      );

      if (result.success) {
        // Update message log with success
        messageLog.messageId = result.messageId;
        await messageLog.updateStatus('sent');

        // Update campaign stats
        await Campaign.findByIdAndUpdate(campaignId, {
          $inc: { 'stats.sent': 1 },
        });

        console.log(`✅ Message sent successfully to ${phoneNumber}`);
        
        return { success: true, messageId: result.messageId };
      } else {
        // Handle failure
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error(`❌ Failed to send message to ${phoneNumber}:`, error.message);

      // Update message log with failure
      const messageLog = await MessageLog.findById(messageLogId);
      if (messageLog) {
        await messageLog.updateStatus('failed', {
          errorCode: error.code || 'SEND_FAILED',
          errorMessage: error.message,
        });
      }

      // Update campaign stats
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { 'stats.failed': 1 },
      });

      throw error; // Re-throw to trigger retry mechanism
    }
  },
  {
    connection,
    limiter: {
      max: 30, // Maximum 30 messages
      duration: 60000, // per minute (Meta's rate limit)
    },
    concurrency: 1, // Process one message at a time
  }
);

// Event listeners for monitoring
messageWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

messageWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

messageWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

/**
 * Add a message to the queue
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} Job information
 */
export const queueMessage = async (messageData) => {
  const job = await messageQueue.add(
    'send-message',
    messageData,
    {
      delay: config.queue.messageDelay, // Delay between messages
    }
  );

  return {
    jobId: job.id,
    messageLogId: messageData.messageLogId,
  };
};

/**
 * Add multiple messages to the queue
 * @param {Array} messagesData - Array of message data
 * @returns {Promise<Array>} Array of job information
 */
export const queueBulkMessages = async (messagesData) => {
  const jobs = messagesData.map((data, index) => ({
    name: 'send-message',
    data,
    opts: {
      delay: config.queue.messageDelay * index, // Stagger the messages
    },
  }));

  const addedJobs = await messageQueue.addBulk(jobs);
  
  return addedJobs.map((job, index) => ({
    jobId: job.id,
    messageLogId: messagesData[index].messageLogId,
  }));
};

/**
 * Get queue statistics
 * @returns {Promise<Object>} Queue stats
 */
export const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    messageQueue.getWaitingCount(),
    messageQueue.getActiveCount(),
    messageQueue.getCompletedCount(),
    messageQueue.getFailedCount(),
    messageQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await messageWorker.close();
  await messageQueue.close();
  await connection.quit();
});

export default {
  messageQueue,
  messageWorker,
  queueMessage,
  queueBulkMessages,
  getQueueStats,
};
