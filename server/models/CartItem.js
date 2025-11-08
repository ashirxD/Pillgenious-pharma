const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    drug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug',
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 1, // 1 = in cart
      index: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure one cart item per user-drug combination
CartItemSchema.index({ user: 1, drug: 1 }, { unique: true });

// Index for querying cart items by user and status
CartItemSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('CartItem', CartItemSchema);

