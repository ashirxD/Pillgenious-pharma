const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
   price: {
    type: Number,
    required: true,
    min: 0
   },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
 

    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Refunded'
      ],
      default: 'Pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Online Payment'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
      index: true
    },
    transactionId: {
      type: String
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: true
      },
      
    }
  }
);

// Generate unique order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Calculate totals before saving
OrderSchema.pre('save', function(next) {
  // Calculate subtotal from items if not set
  if (!this.subtotal) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
  
  // Calculate total
  this.total = this.subtotal + this.tax + this.deliveryFee - this.discount;
  
  next();
});

// Method to update order status
OrderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note
  });
  
  // Update specific dates based on status
  if (newStatus === 'Delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'Cancelled') {
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

// Method to cancel order
OrderSchema.methods.cancel = function(reason) {
  this.status = 'Cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.statusHistory.push({
    status: 'Cancelled',
    timestamp: new Date(),
    note: reason
  });
  
  return this.save();
};

// Method to process refund
OrderSchema.methods.refund = function(amount) {
  this.status = 'Refunded';
  this.paymentStatus = 'Refunded';
  this.refundedAt = new Date();
  this.refundAmount = amount || this.total;
  this.statusHistory.push({
    status: 'Refunded',
    timestamp: new Date(),
    note: `Refund of ${this.refundAmount} processed`
  });
  
  return this.save();
};

// Check if order can be cancelled
OrderSchema.methods.canCancel = function() {
  return ['Pending', 'Confirmed', 'Processing'].includes(this.status);
};

// Indexes for better query performance
OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model('Order', OrderSchema);

