const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const RealAIAnalyzer = require('../utils/realAIAnalyzer');
const EnhancedReviewAuth = require('../utils/enhancedReviewAuth');
const LinguisticAnalyzer = require('../utils/linguisticAnalyzer');

// Initialize the real AI analyzer and linguistic analyzer
const aiAnalyzer = new RealAIAnalyzer();
const linguisticAnalyzer = new LinguisticAnalyzer();

// Create a new review with enhanced AI authenticity analysis and linguistic fingerprinting
router.post('/', async (req, res) => {
  try {
    const reviewData = req.body;
    
    console.log('🤖 Starting real AI analysis and linguistic fingerprinting for review...');
    
    // Extract behavioral metrics and IP data
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Add behavioral tracking data
    if (reviewData.behaviorMetrics) {
      reviewData.behaviorMetrics.ipAddress = ipAddress;
      reviewData.behaviorMetrics.userAgent = userAgent;
      reviewData.behaviorMetrics.deviceFingerprint = req.get('X-Device-Fingerprint') || 'unknown';
    }
    
    // Generate linguistic fingerprint
    console.log('🔍 Generating linguistic fingerprint...');
    const fingerprint = linguisticAnalyzer.generateLinguisticFingerprint(
      reviewData.content, 
      reviewData.behaviorMetrics || {}
    );
    
    // Calculate enhanced authenticity score
    const userHistory = {}; // TODO: Fetch user's review history
    const orderData = {
      purchaseVerified: reviewData.purchaseVerified || false,
      orderTrustScore: 50 // TODO: Fetch from order data
    };
    
    const authenticityResult = linguisticAnalyzer.calculateAuthenticityScore(
      fingerprint,
      userHistory,
      orderData
    );
    
    // Add enhanced data to review (but don't let it block the save)
    if (fingerprint && authenticityResult) {
      reviewData.enhancedFingerprint = fingerprint;
      reviewData.enhancedAuthenticity = authenticityResult;
    }
    reviewData.behaviorMetrics = reviewData.behaviorMetrics || {};
    reviewData.purchaseVerified = reviewData.purchaseVerified || false;
    
    // Use REAL HuggingFace AI analysis (with fallback)
    let aiAnalysis;
    try {
      aiAnalysis = await aiAnalyzer.analyzeReviewWithHuggingFace(reviewData.content);
    } catch (hfError) {
      console.log('HuggingFace API unavailable, using local analysis only');
      // Fallback to local analysis
      aiAnalysis = {
        authenticityScore: authenticityResult?.authenticityScore || 75,
        isAIGenerated: false,
        huggingFaceResults: null,
        localAnalysis: { sentiment: { score: 0 } },
        detailedAnalysis: { textLength: reviewData.content.length, complexity: 'medium' }
      };
    }
    
    // Update review data with real AI results
    reviewData.authenticityScore = aiAnalysis.authenticityScore;
    reviewData.isAIGenerated = aiAnalysis.isAIGenerated;
    
    // Store detailed linguistic analysis
    reviewData.linguisticAnalysis = {
      sentenceVariety: Math.round(aiAnalysis.localAnalysis.linguistic.complexityMetrics.lexicalDiversity * 100),
      emotionalAuthenticity: Math.min(100, Math.abs(aiAnalysis.localAnalysis.sentiment.score) * 20 + 50),
      specificDetails: Math.min(100, aiAnalysis.localAnalysis.linguistic.semanticFeatures.namedEntities.length * 10 + 40),
      vocabularyComplexity: Math.round(aiAnalysis.localAnalysis.linguistic.complexityMetrics.morphologicalComplexity * 100),
      grammarScore: Math.min(100, aiAnalysis.localAnalysis.linguistic.complexityMetrics.readabilityScore)
    };
    
    // Store HuggingFace results for advanced analysis
    reviewData.aiAnalysisData = {
      huggingFaceResults: aiAnalysis.huggingFaceResults,
      detailedAnalysis: aiAnalysis.detailedAnalysis,
      riskFactors: aiAnalysis.isAIGenerated ? ['ai_generated_content'] : []
    };
    
    const review = new Review(reviewData);
    
    let savedReview;
    let isUpdate = false;
    try {
      savedReview = await review.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        // Handle duplicate key error by updating existing review
        console.log('🔄 Duplicate review detected, updating existing review...');
        savedReview = await Review.findOneAndUpdate(
          { product: reviewData.product, reviewer: reviewData.reviewer },
          reviewData,
          { new: true, upsert: true }
        );
        isUpdate = true;
        console.log('✅ Review updated successfully');
      } else {
        throw saveError;
      }
    }
    
    console.log(`✅ AI Analysis Complete - Authenticity: ${aiAnalysis.authenticityScore}%, AI Generated: ${aiAnalysis.isAIGenerated}`);
    console.log(`🔍 Linguistic Analysis Complete - Enhanced Authenticity: ${authenticityResult.authenticityScore}%, Risk: ${authenticityResult.riskLevel}`);
    
    // Start enhanced authentication process
    try {
      console.log('🔍 Starting enhanced authentication...');
      const sourceData = {
        ipAddress: req.ip || 'unknown',
        deviceFingerprint: req.headers['user-agent'] || 'unknown',
        browserInfo: req.headers['user-agent'] || 'unknown',
        sessionData: { timestamp: new Date() }
      };
      
      const authRecord = await EnhancedReviewAuth.authenticateReview(savedReview._id, sourceData);
      
      res.status(201).json({
        ...savedReview.toObject(),
        isUpdate: isUpdate,
        message: isUpdate ? 'Review updated successfully' : 'Review submitted successfully',
        aiAnalysisResults: aiAnalysis,
        linguisticFingerprint: {
          fingerprintId: fingerprint.fingerprintId,
          authenticityScore: authenticityResult.authenticityScore,
          riskLevel: authenticityResult.riskLevel,
          flags: authenticityResult.flags,
          analysis: authenticityResult.analysis
        },
        enhancedAuthentication: {
          authenticationId: authRecord._id,
          overallScore: authRecord.overallAuthenticationScore,
          status: authRecord.finalDecision.status,
          workflowStage: authRecord.verificationWorkflow.currentStage,
          fraudIndicators: authRecord.fraudIndicators.length
        }
      });
    } catch (authError) {
      console.error('Enhanced authentication failed:', authError);
      // Return review even if enhanced auth fails
      res.status(201).json({
        ...savedReview.toObject(),
        isUpdate: isUpdate,
        message: isUpdate ? 'Review updated successfully' : 'Review submitted successfully',
        aiAnalysisResults: aiAnalysis,
        linguisticFingerprint: {
          fingerprintId: fingerprint.fingerprintId,
          authenticityScore: authenticityResult.authenticityScore,
          riskLevel: authenticityResult.riskLevel,
          flags: authenticityResult.flags,
          analysis: authenticityResult.analysis
        },
        enhancedAuthentication: { error: 'Authentication failed', fallback: true }
      });
    }
  } catch (error) {
    console.error('Error in AI review analysis:', error);
    res.status(400).json({ message: error.message });
  }
});


// Get all reviews with AI analysis data
// Get reviews by product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('reviewer', 'username email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews by product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews - Get all reviews (admin dashboard)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name category')
      .populate('reviewer', 'username email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
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
