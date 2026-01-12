import mongoose from 'mongoose';

const messageLogSchema = new mongoose.Schema({
  campaignId: {
    type: String,
    required: true,
    index: true,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  templateName: {
    type: String,
    required: true,
  },
  templateLanguage: {
    type: String,
    default: 'en',
  },
  variables: [{
    type: String,
  }],
  messageId: {
    type: String, // WhatsApp message ID
    index: true,
  },
  status: {
    type: String,
    enum: ['queued', 'sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'queued',
  },
  errorCode: {
    type: String,
  },
  errorMessage: {
    type: String,
  },
  sentAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  readAt: {
    type: Date,
  },
  failedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
messageLogSchema.index({ campaignId: 1, status: 1 });
messageLogSchema.index({ createdAt: -1 });
messageLogSchema.index({ status: 1 });

// Method to update status
messageLogSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  const timestamp = new Date();
  
  switch(status) {
    case 'sent':
      this.sentAt = timestamp;
      break;
    case 'delivered':
      this.deliveredAt = timestamp;
      break;
    case 'read':
      this.readAt = timestamp;
      break;
    case 'failed':
      this.failedAt = timestamp;
      if (additionalData.errorCode) this.errorCode = additionalData.errorCode;
      if (additionalData.errorMessage) this.errorMessage = additionalData.errorMessage;
      break;
  }
  
  return this.save();
};

export default mongoose.model('MessageLog', messageLogSchema);
