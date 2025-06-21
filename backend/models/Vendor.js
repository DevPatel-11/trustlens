const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  operationType: {
    type: String,
    enum: ['warehouse', 'office', 'pickup', 'returns', 'other'],
    required: true
  },
  street: { type: String, required: true },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String },
  phone:   { type: String, required:true },
}, { _id: false });

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  companyEmail: {
    type: String,
    required: true,
    unique: true
  },
  password:       { type: String, required: true }, 
  contactPerson: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }
  },
  addresses: {
    type: [addressSchema],
    validate: [arr => arr.length > 0, 'At least one address is required.']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalReturns: {
    type: Number,
    default: 0
  },
  overallReturnRate: {
    type: Number,
    default: 0,
    set: function(v) {
      return Number(v.toFixed(2));
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);