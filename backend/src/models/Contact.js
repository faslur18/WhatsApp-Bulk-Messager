import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
// contactSchema.index({ phoneNumber: 1 }); // Already indexed by unique: true
contactSchema.index({ tags: 1 });
contactSchema.index({ isActive: 1 });

// Method to format phone number
contactSchema.methods.formatPhoneNumber = function() {
  let phone = this.phoneNumber.replace(/\s+/g, ''); // Remove spaces
  
  // Add country code if not present (assuming India +91)
  if (!phone.startsWith('+')) {
    if (phone.startsWith('91')) {
      phone = '+' + phone;
    } else {
      phone = '+91' + phone;
    }
  }
  
  return phone;
};

// Static method to sanitize phone number before saving
contactSchema.statics.sanitizePhoneNumber = function(phone) {
  let sanitized = phone.replace(/\s+/g, '').replace(/-/g, ''); // Remove spaces and dashes
  
  // Add country code if not present
  if (!sanitized.startsWith('+')) {
    if (sanitized.startsWith('91')) {
      sanitized = '+' + sanitized;
    } else {
      sanitized = '+91' + sanitized;
    }
  }
  
  return sanitized;
};

export default mongoose.model('Contact', contactSchema);
