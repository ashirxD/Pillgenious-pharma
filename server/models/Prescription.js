const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema(
  {
    drugs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug',
      required: true
    }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    prescriptionTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    prescriptionDate: {
      type: Date,
      required: true,
      default: Date.now
    },


    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active'
    },
    prescriptionNumber: {
      type: String,
      unique: true
    },

  },
  { timestamps: true }
);

// Generate unique prescription number before saving
PrescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.prescriptionNumber = `RX-${timestamp}-${random}`;
  }
  next();
});

// Indexes for better query performance
PrescriptionSchema.index({ creator: 1, prescriptionDate: -1 });
PrescriptionSchema.index({ prescriptionTo: 1, status: 1 });
PrescriptionSchema.index({ drugs: 1 });
PrescriptionSchema.index({ prescriptionNumber: 1 });

// Method to mark prescription as paid
PrescriptionSchema.methods.markAsPaid = function() {
  this.isPaid = true;
  return this.save();
};

// Method to check if prescription is valid
PrescriptionSchema.methods.isValid = function() {
  if (!this.validUntil) return true;
  return this.validUntil > new Date();
};

module.exports = mongoose.model('Prescription', PrescriptionSchema);

