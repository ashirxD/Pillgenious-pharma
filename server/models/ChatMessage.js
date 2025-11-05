const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
ChatMessageSchema.index({ user: 1, createdAt: -1 });
ChatMessageSchema.index({ user: 1, role: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

