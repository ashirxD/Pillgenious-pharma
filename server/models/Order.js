const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: false, // Auto-generated in pre-save hook
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
    items: [{
      drugId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug',
        required: true
      },
      drugName: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      subtotal: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      }
    },
    stripePaymentIntentId: {
      type: String
    },
    statusHistory: [{
      status: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: {
        type: String,
        default: ''
      }
    }],
    deliveredAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    cancellationReason: {
      type: String
    },
    refundedAt: {
      type: Date
    },
    refundAmount: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Generate unique order number
OrderSchema.pre('save', async function(next) {
  // Always generate orderNumber if it doesn't exist (for new documents)
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Calculate totals before saving
OrderSchema.pre('save', function(next) {
  // Calculate subtotal from items if not set and items exist
  if (!this.subtotal && this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.subtotal || (item.price * item.quantity)), 0);
  }
  
  // Calculate total if not set
  if (!this.total) {
    const subtotal = this.subtotal || 0;
    const tax = this.tax || 0;
    const deliveryFee = this.deliveryFee || 0;
    const discount = this.discount || 0;
    this.total = subtotal + tax + deliveryFee - discount;
  }
  
  // Initialize status history if new order
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [{
      status: this.status || 'Pending',
      timestamp: new Date(),
      note: 'Order created'
    }];
  }
  
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

