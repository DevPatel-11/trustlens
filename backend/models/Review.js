// const mongoose = require('mongoose');

// const reviewSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   reviewer: {  // Use 'reviewer' consistently (not 'user')
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   rating: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 5
//   },
//   content: {
//     type: String,
//     required: true,
//     minlength: 10,
//     maxlength: 2000
//   },
//   authenticityScore: {
//     type: Number,
//     min: 0,
//     max: 100,
//     default: 50
//   },
//   linguisticAnalysis: {
//     sentenceVariety: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 50
//     },
//     emotionalAuthenticity: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 50
//     },
//     specificDetails: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 50
//     },
//     vocabularyComplexity: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 50
//     },
//     grammarScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 50
//     }
//   },
//   communityValidation: {
//     totalVotes: {
//       type: Number,
//       default: 0
//     },
//     authenticVotes: {
//       type: Number,
//       default: 0
//     },
//     flaggedVotes: {
//       type: Number,
//       default: 0
//     }
//   },
//   isAIGenerated: {
//     type: Boolean,
//     default: false
//   },
//   status: {
//     type: String,
//     enum: ['Active', 'Flagged', 'Removed'],
//     default: 'Active'
//   },
//   aiAnalysisData: {
//     type: Object,
//     default: {}
//   }
// }, {
//   timestamps: true
// });

// // Create compound index on product and reviewer (not user)
// reviewSchema.index({ product: 1, reviewer: 1 }, { unique: true });

// module.exports = mongoose.model('Review', reviewSchema);
const mongoose = require('mongoose');
const Product = require('./Product');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  authenticityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  linguisticAnalysis: {
    sentenceVariety: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    emotionalAuthenticity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    specificDetails: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    vocabularyComplexity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    grammarScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  communityValidation: {
    totalVotes: {
      type: Number,
      default: 0
    },
    authenticVotes: {
      type: Number,
      default: 0
    },
    flaggedVotes: {
      type: Number,
      default: 0
    }
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Flagged', 'Removed'],
    default: 'Active'
  },
  aiAnalysisData: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

reviewSchema.index({ product: 1, reviewer: 1 }, { unique: true });


async function updateProductReviewStats(productId) {
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId, status: 'Active' } },
    {
      $group: {
        _id: '$product',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      reviewCount: stats[0].count,
      averageRating: parseFloat(stats[0].avgRating.toFixed(2))
    });
  } else {
    // No reviews, reset to zero
    await Product.findByIdAndUpdate(productId, {
      reviewCount: 0,
      averageRating: 0
    });
  }
}

// After a review is created or updated
reviewSchema.post('save', function(doc, next) {
  updateProductReviewStats(doc.product)
    .then(() => next())
    .catch(err => next(err));
});

// When a review is deleted via doc.remove()
reviewSchema.post('remove', function(doc, next) {
  updateProductReviewStats(doc.product)
    .then(() => next())
    .catch(err => next(err));
});

// When you call findOneAndDelete or findOneAndRemove
reviewSchema.post('findOneAndDelete', function(doc, next) {
  if (doc) {
    updateProductReviewStats(doc.product)
      .then(() => next())
      .catch(err => next(err));
  } else next();
});

// Similarly, if you ever inactivate a review by updating its status to 'Removed' or 'Flagged',
// you may also want to hook into findOneAndUpdate to re‑compute stats:
reviewSchema.post('findOneAndUpdate', function(doc, next) {
  if (doc) {
    updateProductReviewStats(doc.product)
      .then(() => next())
      .catch(err => next(err));
  } else next();
});

module.exports = mongoose.model('Review', reviewSchema);