const mongoose = require('mongoose');
const LinguisticAnalyzer = require('../utils/linguisticAnalyzer');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  reviewer: {  // Use 'reviewer' consistently (not 'user')
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
    isAIGenerated: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Active', 'Flagged', 'Removed'],
      default: 'Active'
    },
    flagCount: {
      type: Number,
      default: 0
    },
    reportCount: {
      type: Number,
      default: 0
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
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
  },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  aiAnalysisData: {
    type: Object,
    default: {}
  },

  // Enhanced Review Authentication
  purchaseVerified: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },

  // Enhanced Linguistic Fingerprinting
  enhancedFingerprint: {
    // Basic metrics
    characterCount: Number,
    wordCount: Number,
    sentenceCount: Number,
    avgWordsPerSentence: Number,
    avgCharsPerWord: Number,
    
    // Advanced features
    vocabularyRichness: Number,
    commonWordsRatio: Number,
    sentimentScore: Number,
    punctuationDensity: Number,
    capitalizationRatio: Number,
    repetitionScore: Number,
    spamIndicators: Number,
    
    // Behavioral metrics
    writingSpeed: Number,
    revisionsCount: Number,
    sessionDuration: Number,
    imageCount: Number,
    
    // Temporal patterns
    dayOfWeek: Number,
    hourOfDay: Number,
    
    // Unique identifiers
    textHash: String,
    fingerprintId: String
  },

  // Enhanced Authenticity Analysis
  enhancedAuthenticity: {
    authenticityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    flags: [String],
    reasons: [String],
    analysis: {
      textQuality: Number,
      sentimentAnalysis: Number,
      behavioralConsistency: Number,
      temporalPatterns: Number,
      userConsistency: Number
    }
  },

  // Behavioral Tracking
  behaviorMetrics: {
    writingTime: Number, // Time taken to write review in ms
    textLength: Number,
    revisionsCount: Number,
    imageCount: Number,
    sessionDuration: Number,
    ipAddress: String,
    userAgent: String,
    deviceFingerprint: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate linguistic fingerprint and authenticity analysis
reviewSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isNew) {
    try {
      const analyzer = new LinguisticAnalyzer();
      
      // Generate linguistic fingerprint
      const fingerprint = analyzer.generateLinguisticFingerprint(
        this.content, 
        this.behaviorMetrics || {}
      );
      
      this.enhancedFingerprint = fingerprint;
      
      // Calculate authenticity score
      const userHistory = {}; // TODO: Fetch user's review history
      const orderData = {
        purchaseVerified: this.purchaseVerified || false,
        orderTrustScore: 50 // TODO: Fetch from order data
      };
      
      const authenticityResult = analyzer.calculateAuthenticityScore(
        fingerprint,
        userHistory,
        orderData
      );
      
      this.enhancedAuthenticity = authenticityResult;
      
      // Update main authenticity score for backward compatibility
      this.authenticityScore = authenticityResult.authenticityScore;
    } catch (error) {
      console.error('Linguistic analysis error:', error);
      // Continue saving even if analysis fails
      this.authenticityScore = 50; // Default score
    }
  }
  
  next();
});

// Create compound index on product and reviewer (allow multiple reviews per user-product pair)
// Temporarily disabled to fix duplicate key error
// reviewSchema.index({ product: 1, reviewer: 1 });

// Add index for fingerprint analysis
reviewSchema.index({ 'enhancedFingerprint.textHash': 1 });
reviewSchema.index({ 'enhancedFingerprint.fingerprintId': 1 });
reviewSchema.index({ 'enhancedAuthenticity.riskLevel': 1 });

module.exports = mongoose.model('Review', reviewSchema);
