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
    reviewData.authenticityScore = aiAnalysis.authenticityScore;
    reviewData.isAIGenerated = aiAnalysis.isAIGenerated;

    reviewData.linguisticAnalysis = {
      sentenceVariety: Math.round(aiAnalysis.localAnalysis.linguistic.complexityMetrics.lexicalDiversity * 100),
      emotionalAuthenticity: Math.min(100, Math.abs(aiAnalysis.localAnalysis.sentiment.score) * 20 + 50),
      specificDetails: Math.min(100, aiAnalysis.localAnalysis.linguistic.semanticFeatures.namedEntities.length * 10 + 40),
      vocabularyComplexity: Math.round(aiAnalysis.localAnalysis.linguistic.complexityMetrics.morphologicalComplexity * 100),
      grammarScore: Math.min(100, aiAnalysis.localAnalysis.linguistic.complexityMetrics.readabilityScore)
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


// Get all reviews with AI analysis data
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

// REAL-TIME AI analysis endpoint for testing
router.post('/analyze-live', async (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('🔍 Performing live AI analysis...');
    
    const aiAnalysis = await aiAnalyzer.analyzeReviewWithHuggingFace(content);
    
    res.json({
      success: true,
      analysis: aiAnalysis,
      summary: {
        authenticityScore: aiAnalysis.authenticityScore,
        isAIGenerated: aiAnalysis.isAIGenerated,
        confidence: aiAnalysis.huggingFaceResults ? 'High (HuggingFace)' : 'Medium (Local)',
        riskLevel: aiAnalysis.authenticityScore < 40 ? 'High' : 
                  aiAnalysis.authenticityScore < 70 ? 'Medium' : 'Low'
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

// Vote on review authenticity (unchanged)
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

module.exports = router;
