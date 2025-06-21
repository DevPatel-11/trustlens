const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: [String],
  authenticityScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Listed', 'Sold', 'Flagged', 'Under Review'],
    default: 'Listed'
  },
  metadata: {
    imageAnalysis: Object,
    listingBehavior: Object,
    priceAnalysis: Object
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
// NEW: Inventory by location
  quantity: {
    type: Number,
    required: true,
   min: 0
},
  totalSold: {
    type: Number,
    default: 0
  },
  totalReturned: {
    type: Number,
    default: 0
  },
  returnRate: {
    type: Number,
    default: 0,
    set: function(v) {
      return Number(v.toFixed(2)); // Store as 12.34 instead of 12.34567
    }
  },
  // NEW: Admin audit trail
  adminLogs: [{
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: String,
      default: 'admin'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  // NEW: Fraud detection fields
  fraudFlagged: {
    type: Boolean,
    default: false
  },
  fraudTimestamp: {
    type: Date
  },
  fraudReason: {
    type: String
  }
}, {
  timestamps: true,
});

// Virtual for real-time return rate calculation
productSchema.virtual('currentReturnRate').get(function() {
  if (this.totalSold === 0) return 0;
  return (this.totalReturned / this.totalSold) * 100;
});

// Pre-save hook to update stored return rate
productSchema.pre('save', function(next) {
  if (this.totalSold > 0) {
    this.returnRate = (this.totalReturned / this.totalSold) * 100;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);