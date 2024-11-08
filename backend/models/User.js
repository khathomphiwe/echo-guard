const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    trim: true
  },
  otpExpiry: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  encryptionKey: {
    type: String,
    required: true,
    unique: true
  },
  biometricData: {
    type: String
  },
  voicePrint: {
    type: String 
  }
}, {
  timestamps: true
});

userSchema.pre('save', function(next) {
  if (this.otp) {
    this.otp = String(this.otp);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
