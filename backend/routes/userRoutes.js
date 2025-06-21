const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TrustAnalyzer = require('../utils/trustAnalyzer');
const RealAIAnalyzer = require('../utils/realAIAnalyzer');
const { AlertSystem } = require('../utils/alertSystem');

// Initialize the real AI analyzer
const aiAnalyzer = new RealAIAnalyzer();

// Create a new user with ADVANCED AI behavioral analysis
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    
    console.log('🧠 Starting advanced AI behavioral analysis...');
    
    // Calculate basic trust score
    userData.trustScore = TrustAnalyzer.calculateTrustScore(userData);
    
    // REAL AI behavioral analysis if typing data exists
    if (userData.behaviorData && userData.behaviorData.typingCadence && userData.behaviorData.typingCadence.length > 0) {
      const behaviorAnalysis = aiAnalyzer.analyzeTypingBehaviorAdvanced(
        userData.behaviorData.typingCadence,
        userData.behaviorData.mousePatterns || []
      );
      
      // Store detailed behavioral analysis
      userData.behaviorData.aiAnalysis = behaviorAnalysis;
      
      // Adjust trust score based on AI analysis
      if (behaviorAnalysis.classification === 'Bot') {
        userData.trustScore = Math.max(10, userData.trustScore - 40);
        userData.riskLevel = 'High';
      } else if (behaviorAnalysis.classification === 'Suspicious') {
        userData.trustScore = Math.max(20, userData.trustScore - 20);
        userData.riskLevel = 'Medium';
      }
      
      console.log(`🤖 Behavioral Analysis: ${behaviorAnalysis.classification} (${behaviorAnalysis.confidence}% confidence)`);
    }
    
    const user = new User(userData);
    await user.save();
    
    // Advanced alert checking with AI analysis
    await AlertSystem.checkUserBehavior(user);
    
    console.log(`✅ User created with AI-enhanced trust score: ${user.trustScore}%`);
    
    res.status(201).json({
      ...user.toObject(),
      aiEnhanced: true
    });
  } catch (error) {
    console.error('Error in AI user analysis:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID with detailed AI analysis
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Add real-time behavioral analysis if data exists
    let enhancedUser = user.toObject();
    if (user.behaviorData.typingCadence.length > 0) {
      const realtimeAnalysis = aiAnalyzer.analyzeTypingBehaviorAdvanced(user.behaviorData.typingCadence);
      enhancedUser.realtimeBehaviorAnalysis = realtimeAnalysis;
    }
    
    res.json(enhancedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REAL-TIME behavioral analysis endpoint
router.post('/:id/analyze-behavior', async (req, res) => {
  try {
    const { typingData, mouseData } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    console.log('🔍 Performing real-time behavioral analysis...');
    
    const behaviorAnalysis = aiAnalyzer.analyzeTypingBehaviorAdvanced(typingData, mouseData);
    
    // Update user's behavioral data
    user.behaviorData.typingCadence = typingData;
    if (mouseData) user.behaviorData.mousePatterns = mouseData;
    user.behaviorData.aiAnalysis = behaviorAnalysis;
    
    // Recalculate trust score based on new analysis
    const oldTrustScore = user.trustScore;
    if (behaviorAnalysis.classification === 'Bot') {
      user.trustScore = Math.max(10, user.trustScore - 30);
      user.riskLevel = 'High';
    } else if (behaviorAnalysis.classification === 'Human') {
      user.trustScore = Math.min(100, user.trustScore + 10);
      user.riskLevel = user.riskLevel === 'High' ? 'Medium' : user.riskLevel;
    }
    
    await user.save();
    
    // Check for new alerts based on updated analysis
    await AlertSystem.checkUserBehavior(user);
    
    res.json({
      success: true,
      behaviorAnalysis,
      trustScoreChange: user.trustScore - oldTrustScore,
      newTrustScore: user.trustScore,
      riskLevel: user.riskLevel
    });
  } catch (error) {
    console.error('Real-time analysis error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update user with AI-enhanced analysis
router.put('/:id', async (req, res) => {
  try {
    const userData = req.body;
    
    // Recalculate trust score with AI enhancement
    userData.trustScore = TrustAnalyzer.calculateTrustScore(userData);
    
    // AI behavioral analysis if new typing data
    if (userData.behaviorData && userData.behaviorData.typingCadence) {
      const behaviorAnalysis = aiAnalyzer.analyzeTypingBehaviorAdvanced(userData.behaviorData.typingCadence);
      userData.behaviorData.aiAnalysis = behaviorAnalysis;
      
      // Adjust trust score based on AI analysis
      if (behaviorAnalysis.classification === 'Bot') {
        userData.trustScore = Math.max(10, userData.trustScore - 40);
      }
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, userData, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check for alerts with updated data
    await AlertSystem.checkUserBehavior(user);
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get suspicious activity alerts for a user
router.get('/:id/alerts', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Combine traditional and AI-powered alerts
    const traditionalAlerts = TrustAnalyzer.detectSuspiciousActivity(user);
    
    let aiAlerts = [];
    if (user.behaviorData.aiAnalysis) {
      aiAlerts = user.behaviorData.aiAnalysis.analysis.riskFactors.map(factor => ({
        type: 'AI Behavioral Analysis',
        severity: 'High',
        description: `AI detected: ${factor.replace('_', ' ')}`
      }));
    }
    
    res.json([...traditionalAlerts, ...aiAlerts]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get IP analysis for a user
router.get('/users/:id/ip-analysis', async (req, res) => {
  try {
    const ipAnalysis = await TrustAnalyzer.getIPAnalysisDetails(req.params.id);
    
    if (!ipAnalysis) {
      return res.status(404).json({ 
        error: 'IP analysis not available for this user',
        message: 'User not found or no IP address recorded'
      });
    }
    
    res.json({ 
      success: true,
      data: ipAnalysis 
    });
  } catch (error) {
    console.error('Error getting IP analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// Recalculate trust score for a user (includes IP analysis)
router.post('/users/:id/recalculate-trust', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newTrustScore = await TrustAnalyzer.calculateTrustScore(user);
    const ipAnalysis = await TrustAnalyzer.getIPAnalysisDetails(req.params.id);
    
    res.json({ 
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        oldTrustScore: user.trustScore,
        newTrustScore: newTrustScore,
        ipAnalysis: ipAnalysis
      }
    });
  } catch (error) {
    console.error('Error recalculating trust score:', error);
    res.status(500).json({ error: error.message });
  }
});

// NEW: Get seller return rate analytics
router.get('/:id/seller-analytics', async (req, res) => {
  try {
    const TrustAnalyzer = require('../utils/trustAnalyzer');
    const analytics = await TrustAnalyzer.getSellerReturnAnalytics(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({ message: 'Seller analytics not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NEW: Recalculate seller trust score with return rate
router.post('/:id/recalculate-seller-trust', async (req, res) => {
  try {
    const TrustAnalyzer = require('../utils/trustAnalyzer');
    const result = await TrustAnalyzer.calculateSellerTrustWithReturnRate(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Unable to recalculate seller trust score' });
    }
    
    res.json({
      success: true,
      message: 'Seller trust score recalculated based on return rates',
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
