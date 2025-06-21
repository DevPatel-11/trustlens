const express = require('express');
const router = express.Router();
const ReviewAuthentication = require('../models/ReviewAuthentication');
const EnhancedReviewAuth = require('../utils/enhancedReviewAuth');
const Review = require('../models/Review');

// Import socket handler for real-time updates
let socketHandler = null;
const setSocketHandler = (handler) => {
  socketHandler = handler;
};

router.setSocketHandler = setSocketHandler;

// Start enhanced authentication for a review
router.post('/authenticate/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const sourceData = req.body;
    
    console.log('🔍 Starting enhanced review authentication...');
    
    const authRecord = await EnhancedReviewAuth.authenticateReview(reviewId, sourceData);
    
    res.json({
      success: true,
      authenticationId: authRecord._id,
      authenticityScore: authRecord.overallAuthenticationScore,
      status: authRecord.finalDecision.status,
      workflowStage: authRecord.verificationWorkflow.currentStage,
      fraudIndicators: authRecord.fraudIndicators.length,
      message: 'Enhanced authentication completed'
    });
  } catch (error) {
    console.error('Enhanced authentication error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get authentication details for a review
router.get('/details/:reviewId', async (req, res) => {
  try {
    const authRecord = await ReviewAuthentication.findOne({ 
      reviewId: req.params.reviewId 
    }).populate('reviewId');
    
    if (!authRecord) {
      return res.status(404).json({ message: 'Authentication record not found' });
    }
    
    res.json(authRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get authentication summary
router.get('/summary/:reviewId', async (req, res) => {
  try {
    const summary = await EnhancedReviewAuth.getAuthenticationSummary(req.params.reviewId);
    
    if (!summary) {
      return res.status(404).json({ message: 'Authentication summary not found' });
    }
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Progress workflow manually
router.post('/workflow/:authId/progress', async (req, res) => {
  try {
    const { action, performedBy, notes } = req.body;
    
    const authRecord = await ReviewAuthentication.findById(req.params.authId);
    if (!authRecord) {
      return res.status(404).json({ message: 'Authentication record not found' });
    }
    
    authRecord.progressWorkflow(action, performedBy, notes);
    await authRecord.save();
    
    res.json({
      success: true,
      currentStage: authRecord.verificationWorkflow.currentStage,
      message: 'Workflow progressed successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all reviews requiring manual review
router.get('/pending-review', async (req, res) => {
  try {
    const pendingReviews = await ReviewAuthentication.find({
      'verificationWorkflow.currentStage': { $in: ['community_review', 'expert_validation'] },
      'finalDecision.status': { $in: ['suspicious', 'requires_investigation'] }
    }).populate('reviewId');
    
    res.json(pendingReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk authenticate reviews
router.post('/bulk-authenticate', async (req, res) => {
  try {
    const { reviewIds } = req.body;
    
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({ message: 'Invalid review IDs array' });
    }
    
    console.log(`🔍 Starting bulk authentication for ${reviewIds.length} reviews...`);
    
    const results = [];
    
    for (const reviewId of reviewIds) {
      try {
        const authRecord = await EnhancedReviewAuth.authenticateReview(reviewId);
        results.push({
          reviewId,
          success: true,
          authenticityScore: authRecord.overallAuthenticationScore,
          status: authRecord.finalDecision.status
        });
      } catch (error) {
        results.push({
          reviewId,
          success: false,
          error: error.message
        });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = reviewIds.length - successful;
    
    // Broadcast bulk operation completion
    if (socketHandler) {
      socketHandler.broadcastBulkOperationComplete(
        'bulk_authenticate',
        successful,
        failed,
        'system'
      );
    }
    
    res.json({
      success: true,
      processed: reviewIds.length,
      successful,
      failed,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get authentication statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await ReviewAuthentication.aggregate([
      {
        $group: {
          _id: '$finalDecision.status',
          count: { $sum: 1 },
          avgScore: { $avg: '$overallAuthenticationScore' }
        }
      }
    ]);
    
    const workflowStats = await ReviewAuthentication.aggregate([
      {
        $group: {
          _id: '$verificationWorkflow.currentStage',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const fraudStats = await ReviewAuthentication.aggregate([
      { $unwind: '$fraudIndicators' },
      {
        $group: {
          _id: '$fraudIndicators.severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      statusStats: stats,
      workflowStats,
      fraudStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update final decision
router.put('/decision/:authId', async (req, res) => {
  try {
    const { status, confidence, reasoning, decidedBy } = req.body;
    
    const authRecord = await ReviewAuthentication.findById(req.params.authId);
    if (!authRecord) {
      return res.status(404).json({ message: 'Authentication record not found' });
    }
    
    authRecord.finalDecision = {
      status,
      confidence,
      reasoning,
      decidedBy,
      decidedAt: new Date(),
      appealable: status !== 'authentic'
    };
    
    authRecord.verificationWorkflow.currentStage = 'completed';
    
    await authRecord.save();
    
    // Broadcast real-time update
    if (socketHandler) {
      socketHandler.broadcastReviewStatusUpdate(
        authRecord.reviewId,
        status,
        decidedBy || 'system'
      );
    }
    
    res.json({
      success: true,
      decision: authRecord.finalDecision,
      message: 'Final decision updated successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get daily review statistics for analytics
router.get('/stats/daily', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const dailyStats = await ReviewAuthentication.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          reviews: { $sum: 1 },
          avgScore: { $avg: "$overallAuthenticationScore" },
          authentic: {
            $sum: { $cond: [{ $eq: ["$finalDecision.status", "authentic"] }, 1, 0] }
          },
          suspicious: {
            $sum: { $cond: [{ $eq: ["$finalDecision.status", "suspicious"] }, 1, 0] }
          },
          fake: {
            $sum: { $cond: [{ $eq: ["$finalDecision.status", "fake"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Fill in missing days with zero values
    const result = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dailyStats.find(d => d._id === dateStr) || {
        _id: dateStr,
        reviews: 0,
        avgScore: 0,
        authentic: 0,
        suspicious: 0,
        fake: 0
      };
      
      result.push({
        date: dateStr,
        reviews: dayData.reviews,
        avgScore: Math.round(dayData.avgScore || 0),
        authentic: dayData.authentic,
        suspicious: dayData.suspicious,
        fake: dayData.fake
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Daily stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get comprehensive analytics overview
router.get('/analytics/overview', async (req, res) => {
  try {
    const totalReviews = await ReviewAuthentication.countDocuments();
    
    const statusBreakdown = await ReviewAuthentication.aggregate([
      {
        $group: {
          _id: '$finalDecision.status',
          count: { $sum: 1 },
          avgScore: { $avg: '$overallAuthenticationScore' }
        }
      }
    ]);
    
    const fraudIndicatorStats = await ReviewAuthentication.aggregate([
      { $unwind: '$fraudIndicators' },
      {
        $group: {
          _id: '$fraudIndicators.type',
          count: { $sum: 1 },
          avgSeverity: { $avg: '$fraudIndicators.severity' }
        }
      }
    ]);
    
    const workflowEfficiency = await ReviewAuthentication.aggregate([
      {
        $group: {
          _id: '$verificationWorkflow.currentStage',
          count: { $sum: 1 },
          avgProcessingTime: {
            $avg: {
              $subtract: [
                { $ifNull: ['$finalDecision.decidedAt', new Date()] },
                '$createdAt'
              ]
            }
          }
        }
      }
    ]);
    
    res.json({
      totalReviews,
      statusBreakdown,
      fraudIndicatorStats,
      workflowEfficiency,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
