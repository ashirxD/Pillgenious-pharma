const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/password');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Pre-save hook to hash password when modified
// Instance method to compare password (uses utility)
UserSchema.methods.comparePassword = function (candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
