const ReviewAuthentication = require('../models/ReviewAuthentication');
const Review = require('../models/Review');
const User = require('../models/User');
const RealAIAnalyzer = require('./realAIAnalyzer');

class EnhancedReviewAuth {
  
  // Start comprehensive review authentication process
  static async authenticateReview(reviewId, sourceData = {}) {
    try {
      const review = await Review.findById(reviewId).populate('reviewer');
      if (!review) throw new Error('Review not found');
      
      // Create authentication record
      const authRecord = new ReviewAuthentication({
        reviewId,
        sourceVerification: {
          ipAddress: sourceData.ipAddress || 'unknown',
          deviceFingerprint: sourceData.deviceFingerprint || 'unknown',
          geolocation: sourceData.geolocation || {},
          browserInfo: sourceData.browserInfo || 'unknown',
          sessionData: sourceData.sessionData || {}
        }
      });
      
      // Step 1: Initial AI Scan
      await this.performInitialAIScan(authRecord, review);
      
      // Step 2: Linguistic Analysis
      await this.performLinguisticAnalysis(authRecord, review);
      
      // Step 3: Behavioral Check
      await this.performBehavioralCheck(authRecord, review);
      
      // Step 4: Credibility Assessment
      await this.assessCredibilityFactors(authRecord, review);
      
      // Calculate overall score
      // Calculate overall score
      authRecord.calculateAuthenticationScore();
      
      // Determine workflow progression
      this.determineWorkflowProgression(authRecord);
      
      await authRecord.save();
      
      console.log(`🔍 Enhanced review authentication completed: ${authRecord.overallAuthenticationScore}%`);
      
      return authRecord;
    } catch (error) {
      console.error('Enhanced review authentication error:', error);
      throw error;
    }
  }
  
  // Step 1: Initial AI Scan
  static async performInitialAIScan(authRecord, review) {
    try {
      const aiAnalyzer = new RealAIAnalyzer();
      const analysis = await aiAnalyzer.analyzeReviewWithHuggingFace(review.content);
      
      // Check if HuggingFace API failed and use fallback
      if (!analysis.huggingFaceResults) {
        const step = {
          step: 'initial_ai_scan',
          score: 60,
          details: {
            isAIGenerated: false,
            confidence: 60,
            riskFactors: ['HuggingFace API unavailable - using local analysis only']
          },
          aiAnalysis: {
            modelUsed: 'Local NLP Fallback',
            modelVersion: 'sentiment + natural + compromise libraries',
            inferenceScore: 60,
            reasoning: 'HuggingFace API failed, fallback score used based on local analysis',
            huggingFaceResults: null,
            localAnalysisResults: analysis.localAnalysis
          },
          status: 'requires_manual'
        };
        
        authRecord.authenticationSteps.push(step);
        return;
      }
      
      const step = {
        step: 'initial_ai_scan',
        score: analysis.authenticityScore,
        details: {
          isAIGenerated: analysis.isAIGenerated,
          confidence: analysis.authenticityScore,
          riskFactors: analysis.detailedAnalysis
        },
        aiAnalysis: {
          modelUsed: 'HuggingFace Multi-Model Pipeline',
          modelVersion: 'cardiffnlp/twitter-roberta-base-sentiment-latest + martin-ha/toxic-comment-model',
          inferenceScore: analysis.authenticityScore,
          reasoning: analysis.detailedAnalysis?.reasoning || 'AI-based authenticity assessment using sentiment and toxicity analysis',
          huggingFaceResults: analysis.huggingFaceResults,
          localAnalysisResults: analysis.localAnalysis
        },
        status: analysis.authenticityScore > 60 ? 'passed' : 'failed'
      };
      
      authRecord.authenticationSteps.push(step);
      
      // Add fraud indicators if detected
      if (analysis.isAIGenerated) {
        authRecord.addFraudIndicator(
          'ai_generated_content',
          'high',
          analysis.authenticityScore,
          'Content appears to be AI-generated'
        );
      }
    } catch (error) {
      console.error('AI Scan error:', error);
      authRecord.authenticationSteps.push({
        step: 'initial_ai_scan',
        score: 50,
        status: 'failed',
        details: { error: error.message },
        aiAnalysis: {
          modelUsed: 'Error Fallback',
          modelVersion: 'N/A',
          inferenceScore: 50,
          reasoning: `AI analysis failed: ${error.message}`,
          huggingFaceResults: null,
          localAnalysisResults: null
        }
      });
    }
  }
  
  // Step 2: Linguistic Analysis
  static async performLinguisticAnalysis(authRecord, review) {
    try {
      const analysis = this.analyzeLinguisticPatterns(review.content);
      
      const posDistribution = this.extractPOSDistribution(review.content);
      const tfidfTopTerms = this.extractTFIDFTerms(review.content);
      const readabilityScore = this.calculateReadabilityScore(review.content);
      const emotionalWords = this.extractEmotionalWords(review.content);

      const step = {
        step: 'linguistic_analysis',
        score: analysis.overallScore,
        details: analysis,
        linguisticAnalysis: {
          lexicalDiversity: analysis.lexicalDiversity,
          wordCount: analysis.wordCount,
          avgSentenceLength: analysis.avgWordsPerSentence,
          sentenceVariance: analysis.sentenceVariance || 0,
          uniqueWordRatio: analysis.uniqueWords / analysis.wordCount,
          posDistribution,
          tfidfTopTerms,
          readabilityScore,
          emotionalWords
        },
        status: analysis.overallScore > 65 ? 'passed' : 'failed'
      };
      
      authRecord.authenticationSteps.push(step);
      
      // Store linguistic analysis at root level for easy access
      authRecord.linguisticAnalysis = step.linguisticAnalysis;
      
      // Check for suspicious patterns
      if (analysis.suspiciousPatterns.length > 0) {
        analysis.suspiciousPatterns.forEach(pattern => {
          authRecord.addFraudIndicator(
            `linguistic_${pattern.type}`,
            pattern.severity,
            pattern.confidence,
            pattern.description
          );
        });
      }
    } catch (error) {
      authRecord.authenticationSteps.push({
        step: 'linguistic_analysis',
        status: 'failed',
        details: { error: error.message }
      });
    }
  }
  
  // Step 3: Behavioral Check
  static async performBehavioralCheck(authRecord, review) {
    try {
      const user = review.reviewer;
      let behaviorScore = 50; // Base score
      
      // Check user's behavioral data
      if (user.behaviorData && user.behaviorData.typingCadence.length > 0) {
        const aiAnalyzer = new RealAIAnalyzer();
        const behaviorAnalysis = aiAnalyzer.analyzeTypingBehaviorAdvanced(user.behaviorData.typingCadence);
        
        behaviorScore = behaviorAnalysis.classification === 'Human' ? 85 : 
                      behaviorAnalysis.classification === 'Suspicious' ? 40 : 15;
        
        if (behaviorAnalysis.classification === 'Bot') {
          authRecord.addFraudIndicator(
            'bot_behavior',
            'critical',
            behaviorAnalysis.confidence,
            'User exhibits bot-like behavioral patterns'
          );
        }
      }
      
      const step = {
        step: 'behavioral_check',
        score: behaviorScore,
        details: {
          userTrustScore: user.trustScore,
          accountAge: user.accountAge,
          riskLevel: user.riskLevel
        },
        status: behaviorScore > 60 ? 'passed' : 'failed'
      };
      
      authRecord.authenticationSteps.push(step);
    } catch (error) {
      authRecord.authenticationSteps.push({
        step: 'behavioral_check',
        status: 'failed',
        details: { error: error.message }
      });
    }
  }
  
  // Assess credibility factors
  static async assessCredibilityFactors(authRecord, review) {
    try {
      const user = review.reviewer;
      
      // Get user's review history
      const userReviews = await Review.find({ reviewer: user._id });
      
      // Calculate credibility factors using real analysis
      const purchaseVerified = await this.verifyPurchaseRecord(user._id, review.product);
      const temporalData = await this.analyzeTemporalPatterns(review, user);
      const helpfulnessScore = await this.calculateHelpfulnessScore(review, userReviews);
      
      authRecord.credibilityFactors = {
        purchaseVerification: {
          verified: purchaseVerified.verified,
          verificationMethod: purchaseVerified.method,
          verificationDate: new Date(),
          confidence: purchaseVerified.confidence
        },
        reviewerHistory: {
          totalReviews: userReviews.length,
          averageRating: userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length || 0,
          reviewConsistency: this.calculateReviewConsistency(userReviews)
        },
        temporalAnalysis: {
          timeToReview: temporalData.timeToReview,
          reviewingPattern: temporalData.pattern,
          seasonalityScore: temporalData.seasonalityScore,
          suspiciousTimingFlags: temporalData.suspiciousFlags
        },
        contentQuality: {
          detailLevel: this.calculateDetailLevel(review.content),
          helpfulnessScore: helpfulnessScore,
          originalityScore: this.calculateOriginality(review.content)
        }
      };
    } catch (error) {
      console.error('Credibility assessment error:', error);
    }
  }
  
  // Analyze linguistic patterns using real NLP metrics
  static analyzeLinguisticPatterns(content) {
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uniqueWords = new Set(words);
    
    // Calculate base linguistic metrics
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    const lexicalDiversity = uniqueWords.size / wordCount;
    
    // Calculate dynamic score based on multiple linguistic factors
    let overallScore = 50; // Base score
    
    // Word count factor (optimal range: 50-200 words)
    if (wordCount >= 50 && wordCount <= 200) {
      overallScore += 15;
    } else if (wordCount > 200) {
      overallScore += 10;
    } else if (wordCount < 20) {
      overallScore -= 20;
    }
    
    // Lexical diversity factor (higher diversity = more authentic)
    if (lexicalDiversity > 0.7) {
      overallScore += 20;
    } else if (lexicalDiversity > 0.5) {
      overallScore += 10;
    } else if (lexicalDiversity < 0.3) {
      overallScore -= 15;
    }
    
    // Sentence length variation (natural writing has variation)
    const sentenceLengths = sentences.map(s => s.split(/\W+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const sentenceVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length;
    
    if (sentenceVariance > 10) {
      overallScore += 10; // Good variation
    } else if (sentenceVariance < 2) {
      overallScore -= 10; // Too uniform
    }
    
    const analysis = {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      uniqueWords: uniqueWords.size,
      lexicalDiversity,
      sentenceVariance,
      suspiciousPatterns: [],
      overallScore: Math.max(0, Math.min(100, overallScore))
    };
    
    // Check for suspicious patterns
    if (analysis.lexicalDiversity < 0.3) {
      analysis.suspiciousPatterns.push({
        type: 'low_diversity',
        severity: 'medium',
        confidence: 75,
        description: 'Unusually low lexical diversity'
      });
      analysis.overallScore -= 15;
    }
    
    // Check for generic phrases
    const genericPhrases = ['good product', 'highly recommend', 'great quality', 'fast shipping'];
    const genericCount = genericPhrases.filter(phrase => content.toLowerCase().includes(phrase)).length;
    
    if (genericCount > 2) {
      analysis.suspiciousPatterns.push({
        type: 'generic_language',
        severity: 'low',
        confidence: 60,
        description: 'Contains multiple generic phrases'
      });
      analysis.overallScore -= 10;
    }
    
    // Check for repetitive patterns
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const maxFreq = Math.max(...Object.values(wordFreq));
    if (maxFreq > wordCount * 0.1) { // If any word appears more than 10% of the time
      analysis.suspiciousPatterns.push({
        type: 'word_repetition',
        severity: 'medium',
        confidence: 80,
        description: 'Excessive word repetition detected'
      });
      analysis.overallScore -= 12;
    }
    
    // Ensure final score is within bounds
    analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore));
    
    return analysis;
  }
  
  // Calculate review consistency
  static calculateReviewConsistency(reviews) {
    if (reviews.length < 2) return 50;
    
    const ratings = reviews.map(r => r.rating);
    const avgRating = ratings.reduce((a, b) => a + b) / ratings.length;
    const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - avgRating, 2), 0) / ratings.length;
    
    // Lower variance = higher consistency
    return Math.max(0, Math.min(100, 100 - (variance * 20)));
  }
  
  // Calculate detail level
  static calculateDetailLevel(content) {
    const words = content.split(/\W+/).filter(w => w.length > 0);
    const detailIndicators = [
      /\d+/, // Numbers
      /color|size|weight|material|texture/gi, // Physical attributes
      /compared|versus|than|better|worse/gi, // Comparisons
      /because|since|due to|reason/gi // Explanations
    ];
    
    let detailScore = Math.min(100, words.length * 2); // Base on length
    
    detailIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) detailScore += matches.length * 5;
    });
    
    return Math.min(100, detailScore);
  }
  
  // Calculate originality
  static calculateOriginality(content) {
    // Simple originality check based on unique phrases
    const phrases = content.toLowerCase().split(/[.!?]+/);
    const uniquePhrases = new Set(phrases.map(p => p.trim()));
    
    return Math.min(100, (uniquePhrases.size / phrases.length) * 100);
  }
  
  // Determine workflow progression
  static determineWorkflowProgression(authRecord) {
    const score = authRecord.overallAuthenticationScore;
    const criticalIndicators = authRecord.fraudIndicators.filter(i => i.severity === 'critical').length;
    
    if (score > 85 && criticalIndicators === 0) {
      authRecord.verificationWorkflow.currentStage = 'final_approval';
      authRecord.finalDecision = {
        status: 'authentic',
        confidence: score,
        reasoning: ['High authentication score', 'No critical fraud indicators'],
        decidedBy: 'automated_system',
        decidedAt: new Date()
      };
    } else if (score < 40 || criticalIndicators > 0) {
      authRecord.verificationWorkflow.currentStage = 'expert_validation';
      authRecord.verificationWorkflow.priorityLevel = 'high';
      authRecord.finalDecision = {
        status: 'requires_investigation',
        confidence: 100 - score,
        reasoning: ['Low authentication score', 'Critical fraud indicators detected'],
        decidedBy: 'automated_system',
        decidedAt: new Date()
      };
    } else {
      authRecord.verificationWorkflow.currentStage = 'community_review';
      authRecord.finalDecision = {
        status: 'suspicious',
        confidence: Math.abs(50 - score),
        reasoning: ['Moderate authentication score', 'Requires community validation'],
        decidedBy: 'automated_system',
        decidedAt: new Date()
      };
    }
  }
  
  // Get authentication summary
  static async getAuthenticationSummary(reviewId) {
    try {
      const authRecord = await ReviewAuthentication.findOne({ reviewId })
        .populate('reviewId');
      
      if (!authRecord) return null;
      
      return {
        reviewId,
        authenticityScore: authRecord.overallAuthenticationScore,
        status: authRecord.finalDecision.status,
        confidence: authRecord.finalDecision.confidence,
        workflowStage: authRecord.verificationWorkflow.currentStage,
        fraudIndicators: authRecord.fraudIndicators.length,
        credibilityFactors: authRecord.credibilityFactors,
        completedSteps: authRecord.authenticationSteps.filter(s => s.status === 'passed').length,
        totalSteps: authRecord.authenticationSteps.length
      };
    } catch (error) {
      console.error('Authentication summary error:', error);
      return null;
    }
  }
  // Real purchase verification analysis
  static async verifyPurchaseRecord(userId, productId) {
    try {
      // In a real system, this would check payment records, order history, etc.
      // For now, implement heuristic-based verification
      const user = await User.findById(userId);
      const userReviews = await Review.find({ reviewer: userId });
      
      // Calculate verification based on user behavior patterns
      let verificationScore = 50;
      
      // Check account age (older accounts more likely to be verified purchasers)
      const accountAge = (new Date() - user.createdAt) / (1000 * 60 * 60 * 24); // days
      if (accountAge > 365) verificationScore += 25;
      else if (accountAge > 90) verificationScore += 15;
      else if (accountAge < 7) verificationScore -= 20;
      
      // Check review history patterns
      if (userReviews.length > 10) verificationScore += 15;
      else if (userReviews.length < 2) verificationScore -= 15;
      
      // Check for suspicious rapid-fire reviewing
      const recentReviews = userReviews.filter(r => 
        (new Date() - r.createdAt) < (1000 * 60 * 60 * 24) // last 24 hours
      );
      if (recentReviews.length > 5) verificationScore -= 30;
      
      const verified = verificationScore > 60;
      
      return {
        verified,
        confidence: Math.min(95, Math.max(5, verificationScore)),
        method: verified ? 'behavioral_analysis' : 'insufficient_evidence',
        details: {
          accountAge: Math.round(accountAge),
          reviewCount: userReviews.length,
          recentActivity: recentReviews.length
        }
      };
    } catch (error) {
      return {
        verified: false,
        confidence: 0,
        method: 'error',
        details: { error: error.message }
      };
    }
  }
  
  // Real temporal pattern analysis
  static async analyzeTemporalPatterns(review, user) {
    try {
      const reviewTime = new Date(review.createdAt);
      const userReviews = await Review.find({ reviewer: user._id }).sort({ createdAt: -1 });
      
      // Calculate time to review (if we had purchase data)
      // For now, use review creation patterns
      const timeToReview = 24; // Default 24 hours
      
      // Analyze reviewing pattern
      let pattern = 'normal';
      const suspiciousFlags = [];
      
      // Check for burst reviewing (multiple reviews in short time)
      const recentReviews = userReviews.filter(r => 
        Math.abs(new Date(r.createdAt) - reviewTime) < (1000 * 60 * 60 * 2) // 2 hours
      );
      
      if (recentReviews.length > 3) {
        pattern = 'burst_reviewing';
        suspiciousFlags.push('multiple_reviews_short_timeframe');
      }
      
      // Check for off-hours reviewing (potential bot behavior)
      const hour = reviewTime.getHours();
      if (hour >= 2 && hour <= 5) {
        suspiciousFlags.push('unusual_hours');
      }
      
      // Calculate seasonality score based on review timing patterns
      const monthlyDistribution = this.calculateMonthlyReviewDistribution(userReviews);
      const seasonalityScore = this.calculateSeasonalityScore(monthlyDistribution);
      
      return {
        timeToReview,
        pattern,
        seasonalityScore,
        suspiciousFlags,
        reviewHour: hour,
        burstCount: recentReviews.length
      };
    } catch (error) {
      return {
        timeToReview: 24,
        pattern: 'unknown',
        seasonalityScore: 50,
        suspiciousFlags: ['analysis_error']
      };
    }
  }
  
  // Real helpfulness score calculation
  static async calculateHelpfulnessScore(review, userReviews) {
    try {
      let helpfulnessScore = 50; // Base score
      
      // Content length analysis (more detailed reviews generally more helpful)
      const wordCount = review.content.split(/\W+/).filter(w => w.length > 0).length;
      if (wordCount > 100) helpfulnessScore += 20;
      else if (wordCount > 50) helpfulnessScore += 10;
      else if (wordCount < 10) helpfulnessScore -= 20;
      
      // Specific detail analysis
      const detailIndicators = [
        /pros?[:]/gi,
        /cons?[:]/gi,
        /\d+\s*(star|rating)/gi,
        /would\s+recommend/gi,
        /purchased|bought|ordered/gi,
        /quality|material|size|color/gi
      ];
      
      detailIndicators.forEach(pattern => {
        if (pattern.test(review.content)) helpfulnessScore += 5;
      });
      
      // User's historical helpfulness (if we had helpfulness votes)
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      if (avgRating > 4.5 || avgRating < 1.5) {
        helpfulnessScore -= 10; // Extreme ratings less helpful
      }
      
      // Balanced rating distribution
      const ratingVariance = this.calculateRatingVariance(userReviews);
      if (ratingVariance > 1.5) helpfulnessScore += 10; // Varied ratings more credible
      
      return Math.max(0, Math.min(100, Math.round(helpfulnessScore)));
    } catch (error) {
      return 50; // Default score on error
    }
  }
  
  // Helper method for monthly distribution
  static calculateMonthlyReviewDistribution(reviews) {
    const monthCounts = new Array(12).fill(0);
    reviews.forEach(review => {
      const month = new Date(review.createdAt).getMonth();
      monthCounts[month]++;
    });
    return monthCounts;
  }
  
  // Helper method for seasonality score
  static calculateSeasonalityScore(monthlyDistribution) {
    const total = monthlyDistribution.reduce((a, b) => a + b, 0);
    if (total === 0) return 50;
    
    const variance = monthlyDistribution.reduce((sum, count) => {
      const expected = total / 12;
      return sum + Math.pow(count - expected, 2);
    }, 0) / 12;
    
    // Lower variance = more consistent = higher score
    return Math.max(0, Math.min(100, 100 - (variance * 2)));
  }
  
  // Helper method for rating variance
  static calculateRatingVariance(reviews) {
    if (reviews.length === 0) return 0;
    const ratings = reviews.map(r => r.rating);
    const avg = ratings.reduce((a, b) => a + b) / ratings.length;
    return ratings.reduce((sum, rating) => sum + Math.pow(rating - avg, 2), 0) / ratings.length;
  }
  
  // Extract POS (Part of Speech) distribution
  static extractPOSDistribution(content) {
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const pos = {
      nouns: 0,
      verbs: 0,
      adjectives: 0,
      adverbs: 0,
      pronouns: 0,
      articles: 0
    };
    
    // Simple POS tagging based on common patterns
    const nounPatterns = /\b(thing|product|item|quality|service|experience|time|day|week|month|year)\b/gi;
    const verbPatterns = /\b(is|are|was|were|have|has|had|do|does|did|can|could|will|would|buy|bought|use|used|work|works|worked)\b/gi;
    const adjPatterns = /\b(good|bad|great|excellent|poor|amazing|terrible|wonderful|awful|nice|beautiful|ugly|fast|slow|easy|hard)\b/gi;
    const advPatterns = /\b(very|really|quite|extremely|highly|totally|completely|absolutely|perfectly|exactly)\b/gi;
    const pronounPatterns = /\b(i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their)\b/gi;
    const articlePatterns = /\b(a|an|the)\b/gi;
    
    pos.nouns = (content.match(nounPatterns) || []).length;
    pos.verbs = (content.match(verbPatterns) || []).length;
    pos.adjectives = (content.match(adjPatterns) || []).length;
    pos.adverbs = (content.match(advPatterns) || []).length;
    pos.pronouns = (content.match(pronounPatterns) || []).length;
    pos.articles = (content.match(articlePatterns) || []).length;
    
    return pos;
  }
  
  // Extract TF-IDF top terms (simplified version)
  static extractTFIDFTerms(content) {
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were']);
    
    const wordFreq = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Sort by frequency and return top 5 terms
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }
  
  // Calculate readability score (simplified Flesch Reading Ease)
  static calculateReadabilityScore(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\W+/).filter(w => w.length > 0);
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 50;
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    // Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }
  
  // Count syllables in a word (simplified)
  static countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) count--;
    
    return Math.max(1, count);
  }
  
  // Extract emotional words
  static extractEmotionalWords(content) {
    const emotionalWords = [
      'love', 'hate', 'amazing', 'terrible', 'wonderful', 'awful', 'fantastic', 'horrible',
      'excellent', 'poor', 'great', 'bad', 'perfect', 'disappointing', 'impressed', 'frustrated',
      'satisfied', 'dissatisfied', 'happy', 'angry', 'excited', 'upset', 'pleased', 'annoyed'
    ];
    
    const words = content.toLowerCase().split(/\W+/);
    return emotionalWords.filter(emotion => words.includes(emotion));
  }
}

module.exports = EnhancedReviewAuth;
