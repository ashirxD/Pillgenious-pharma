const mongoose = require('mongoose');

const DrugSchema = new mongoose.Schema(
  {
    drugName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    sideEffects: {
      type: [String],
      required: true,
      default: []
    },
    type: {
      type: String,
      required: true,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Ointment', 'Other'],
      default: 'Tablet'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    // Additional useful fields
    category: {
      type: String,
      enum: [
        'Pain Relief',
        'Antibiotics',
        'Digestive',
        'Allergy',
        'Diabetes',
        'Cardiovascular',
        'Respiratory',
        'Vitamins & Supplements',
        'Mental Health',
        'Other'
      ]
    },
    manufacturer: {
      type: String
    },
    description: {
      type: String
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    },
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    images: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
DrugSchema.index({ drugName: 'text', description: 'text' });
DrugSchema.index({ category: 1 });
DrugSchema.index({ price: 1 });

// Update stock status based on quantity
DrugSchema.pre('save', function(next) {
  if (this.stockQuantity === 0) {
    this.stockStatus = 'Out of Stock';
  } else if (this.stockQuantity < 10) {
    this.stockStatus = 'Low Stock';
  } else {
    this.stockStatus = 'In Stock';
  }
  next();
});

// Method to update stock
DrugSchema.methods.updateStock = function(quantity) {
  this.stockQuantity += quantity;
  return this.save();
};

module.exports = mongoose.model('Drug', DrugSchema);

