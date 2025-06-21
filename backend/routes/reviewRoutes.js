const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const RealAIAnalyzer = require('../utils/realAIAnalyzer');
const EnhancedReviewAuth = require('../utils/enhancedReviewAuth');

// Initialize the real AI analyzer
const aiAnalyzer = new RealAIAnalyzer();

// Create a new review with enhanced AI authenticity analysis
router.post('/', async (req, res) => {
  try {
    const reviewData = req.body;

    const aiAnalysis = await aiAnalyzer.analyzeReviewWithHuggingFace(reviewData.content);
    reviewData.authenticityScore = Math.max(0, Math.min(100, aiAnalysis.authenticityScore || 0));
    reviewData.isAIGenerated = aiAnalysis.isAIGenerated;

    const complexity = aiAnalysis?.localAnalysis?.linguistic?.complexityMetrics || {};
    const sentiment = aiAnalysis?.localAnalysis?.sentiment || {};
    const namedEntities = aiAnalysis?.localAnalysis?.linguistic?.semanticFeatures?.namedEntities || [];

    reviewData.linguisticAnalysis = {
      sentenceVariety: Math.max(0, Math.min(100, Math.round(complexity.lexicalDiversity * 100 || 0))),
      emotionalAuthenticity: Math.max(0, Math.min(100, Math.abs(sentiment.score || 0) * 20 + 50)),
      specificDetails: Math.max(0, Math.min(100, namedEntities.length * 10 + 40)),
      vocabularyComplexity: Math.max(0, Math.min(100, Math.round(complexity.morphologicalComplexity * 100 || 0))),
      grammarScore: Math.max(0, Math.min(100, complexity.readabilityScore || 0))
    };

    reviewData.aiAnalysisData = {
      huggingFaceResults: aiAnalysis.huggingFaceResults,
      detailedAnalysis: aiAnalysis.detailedAnalysis,
      riskFactors: aiAnalysis.isAIGenerated ? ['ai_generated_content'] : []
    };

    const review = new Review(reviewData);
    await review.save();

    const authRecord = await EnhancedReviewAuth.authenticateReview(review._id, {
      ipAddress: req.ip,
      deviceFingerprint: req.headers['user-agent'],
      browserInfo: req.headers['user-agent'],
      sessionData: { timestamp: new Date() }
    });

    res.status(201).json({
      ...review.toObject(),
      aiAnalysisResults: aiAnalysis,
      enhancedAuthentication: {
        authenticationId: authRecord._id,
        overallScore: authRecord.overallAuthenticationScore,
        status: authRecord.finalDecision.status
      }
    });
  } catch (err) {
    console.error('Review post error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name price')
      .populate('reviewer', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews by product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('reviewer', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Real-time AI analysis (for testing)
router.post('/analyze-live', async (req, res) => {
  try {
    const { content } = req.body;
    const aiAnalysis = await aiAnalyzer.analyzeReviewWithHuggingFace(content);

    res.json({
      success: true,
      analysis: aiAnalysis,
      summary: {
        authenticityScore: aiAnalysis.authenticityScore,
        isAIGenerated: aiAnalysis.isAIGenerated,
        confidence: aiAnalysis.huggingFaceResults ? 'High (HuggingFace)' : 'Medium (Local)',
        riskLevel:
          aiAnalysis.authenticityScore < 40
            ? 'High'
            : aiAnalysis.authenticityScore < 70
            ? 'Medium'
            : 'Low'
      }
    });
  } catch (error) {
    console.error('Live analysis error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      fallback: 'Using local analysis only'
    });
  }
});

// Vote on review authenticity
router.post('/:id/vote', async (req, res) => {
  try {
    const { voteType } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.communityValidation.totalVotes += 1;
    if (voteType === 'authentic') {
      review.communityValidation.authenticVotes += 1;
    } else {
      review.communityValidation.flaggedVotes += 1;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update review by ID
router.put('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Flag a review (for testing communityValidation updates)
router.post('/:id/flag', async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    // Update communityValidation fields
    review.communityValidation.flagCount += 1;
    review.communityValidation.reportCount += 1;
    review.communityValidation.lastUpdated = new Date();
    
    // If flagged multiple times, change status
    if (review.communityValidation.flagCount >= 3) {
      review.communityValidation.status = 'Flagged';
      review.status = 'Flagged';
    }
    
    await review.save();
    
    res.json({
      success: true,
      message: `Review flagged. Total flags: ${review.communityValidation.flagCount}`,
      communityValidation: review.communityValidation,
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add helpful vote to a review
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    review.communityValidation.helpfulVotes += 1;
    review.communityValidation.lastUpdated = new Date();
    
    await review.save();
    
    res.json({
      success: true,
      message: `Helpful vote added. Total: ${review.communityValidation.helpfulVotes}`,
      communityValidation: review.communityValidation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
