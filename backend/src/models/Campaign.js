import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  templateName: {
    type: String,
    required: true,
  },
  templateLanguage: {
    type: String,
    default: 'en',
  },
  targetTags: [{
    type: String,
  }],
  totalContacts: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'in_progress', 'completed', 'failed'],
    default: 'draft',
  },
  scheduledAt: {
    type: Date,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  stats: {
    queued: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Index for faster queries
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });

export default mongoose.model('Campaign', campaignSchema);
