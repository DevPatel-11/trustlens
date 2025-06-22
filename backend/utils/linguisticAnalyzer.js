const crypto = require('crypto');

class LinguisticAnalyzer {
  constructor() {
    this.commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    this.positiveWords = new Set(['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'perfect', 'best', 'nice', 'beautiful', 'quality', 'recommend', 'happy', 'satisfied', 'pleased', 'impressed']);
    this.negativeWords = new Set(['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 'poor', 'cheap', 'fake', 'broken', 'useless', 'waste', 'regret', 'angry', 'frustrated']);
    this.spamIndicators = new Set(['buy now', 'click here', 'limited time', 'special offer', 'guaranteed', 'free shipping', 'discount', 'sale', 'promotion']);
  }

  // Generate linguistic fingerprint for a review
  generateLinguisticFingerprint(reviewText, behaviorMetrics = {}) {
    const text = reviewText.toLowerCase().trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Basic text metrics
    const metrics = {
      characterCount: text.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: words.length / Math.max(sentences.length, 1),
      avgCharsPerWord: text.replace(/\s/g, '').length / Math.max(words.length, 1)
    };

    // Vocabulary analysis
    const uniqueWords = new Set(words);
    const vocabularyRichness = uniqueWords.size / Math.max(words.length, 1);
    
    // Common words ratio
    const commonWordsCount = words.filter(word => this.commonWords.has(word)).length;
    const commonWordsRatio = commonWordsCount / Math.max(words.length, 1);

    // Sentiment analysis
    const positiveCount = words.filter(word => this.positiveWords.has(word)).length;
    const negativeCount = words.filter(word => this.negativeWords.has(word)).length;
    const sentimentScore = (positiveCount - negativeCount) / Math.max(words.length, 1);

    // Spam indicators
    const spamCount = this.spamIndicators.size > 0 ? 
      Array.from(this.spamIndicators).filter(phrase => text.includes(phrase)).length : 0;

    // Punctuation analysis
    const punctuationMarks = text.match(/[.,!?;:]/g) || [];
    const punctuationDensity = punctuationMarks.length / Math.max(text.length, 1);

    // Capitalization patterns
    const capitalLetters = (reviewText.match(/[A-Z]/g) || []).length;
    const capitalizationRatio = capitalLetters / Math.max(reviewText.length, 1);

    // Repetition analysis
    const wordFrequency = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    const maxWordFrequency = Math.max(...Object.values(wordFrequency));
    const repetitionScore = maxWordFrequency / Math.max(words.length, 1);

    // Behavioral metrics integration
    const writingSpeed = behaviorMetrics.writingTime ? 
      words.length / (behaviorMetrics.writingTime / 1000 / 60) : 0; // words per minute

    const fingerprint = {
      // Basic metrics
      ...metrics,
      
      // Advanced linguistic features
      vocabularyRichness,
      commonWordsRatio,
      sentimentScore,
      punctuationDensity,
      capitalizationRatio,
      repetitionScore,
      spamIndicators: spamCount,
      
      // Behavioral integration
      writingSpeed,
      revisionsCount: behaviorMetrics.revisionsCount || 0,
      sessionDuration: behaviorMetrics.sessionDuration || 0,
      imageCount: behaviorMetrics.imageCount || 0,
      
      // Temporal patterns
      timestamp: Date.now(),
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours(),
      
      // Unique identifiers
      textHash: crypto.createHash('md5').update(text).digest('hex'),
      fingerprintId: crypto.randomUUID()
    };

    return fingerprint;
  }

  // Calculate authenticity score based on multiple factors
  calculateAuthenticityScore(fingerprint, userHistory = {}, orderData = {}) {
    let score = 100; // Start with perfect score
    let flags = [];
    let reasons = [];

    // 1. Text Quality Analysis (25 points)
    if (fingerprint.wordCount < 10) {
      score -= 15;
      flags.push('SHORT_REVIEW');
      reasons.push('Review too short (less than 10 words)');
    }

    if (fingerprint.vocabularyRichness < 0.3) {
      score -= 10;
      flags.push('LOW_VOCABULARY');
      reasons.push('Limited vocabulary diversity');
    }

    if (fingerprint.repetitionScore > 0.3) {
      score -= 8;
      flags.push('HIGH_REPETITION');
      reasons.push('Excessive word repetition detected');
    }

    // 2. Sentiment Analysis (20 points)
    if (Math.abs(fingerprint.sentimentScore) > 0.5) {
      score -= 5;
      flags.push('EXTREME_SENTIMENT');
      reasons.push('Extremely polarized sentiment');
    }

    if (fingerprint.spamIndicators > 0) {
      score -= 15;
      flags.push('SPAM_INDICATORS');
      reasons.push('Contains promotional language');
    }

    // 3. Behavioral Analysis (25 points)
    if (fingerprint.writingSpeed > 100) { // More than 100 WPM is suspicious
      score -= 12;
      flags.push('FAST_TYPING');
      reasons.push('Unusually fast typing speed');
    }

    if (fingerprint.revisionsCount < 2 && fingerprint.wordCount > 50) {
      score -= 8;
      flags.push('NO_REVISIONS');
      reasons.push('No text revisions for lengthy review');
    }

    if (fingerprint.sessionDuration < 30000 && fingerprint.wordCount > 30) { // Less than 30 seconds
      score -= 10;
      flags.push('RUSHED_WRITING');
      reasons.push('Review written too quickly');
    }

    // 4. Temporal Patterns (15 points)
    if (fingerprint.hourOfDay >= 2 && fingerprint.hourOfDay <= 5) {
      score -= 5;
      flags.push('UNUSUAL_TIME');
      reasons.push('Review submitted at unusual hours');
    }

    // 5. User History Analysis (15 points)
    if (userHistory.totalReviews > 10 && userHistory.avgReviewLength) {
      const lengthDeviation = Math.abs(fingerprint.wordCount - userHistory.avgReviewLength) / userHistory.avgReviewLength;
      if (lengthDeviation > 2) {
        score -= 8;
        flags.push('LENGTH_ANOMALY');
        reasons.push('Review length significantly different from user pattern');
      }
    }

    if (userHistory.recentReviewCount > 5) { // More than 5 reviews in recent period
      score -= 7;
      flags.push('HIGH_ACTIVITY');
      reasons.push('Unusually high review activity');
    }

    // 6. Purchase Verification Bonus
    if (orderData.purchaseVerified) {
      score += 10;
      reasons.push('Purchase verified - authenticity bonus');
    }

    if (orderData.orderTrustScore > 70) {
      score += 5;
      reasons.push('High order trust score');
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine risk level
    let riskLevel = 'Low';
    if (score < 40) riskLevel = 'High';
    else if (score < 70) riskLevel = 'Medium';

    return {
      authenticityScore: Math.round(score),
      riskLevel,
      flags,
      reasons,
      analysis: {
        textQuality: Math.max(0, 100 - (flags.filter(f => ['SHORT_REVIEW', 'LOW_VOCABULARY', 'HIGH_REPETITION'].includes(f)).length * 10)),
        sentimentAnalysis: Math.max(0, 100 - (flags.filter(f => ['EXTREME_SENTIMENT', 'SPAM_INDICATORS'].includes(f)).length * 10)),
        behavioralConsistency: Math.max(0, 100 - (flags.filter(f => ['FAST_TYPING', 'NO_REVISIONS', 'RUSHED_WRITING'].includes(f)).length * 10)),
        temporalPatterns: Math.max(0, 100 - (flags.filter(f => ['UNUSUAL_TIME'].includes(f)).length * 20)),
        userConsistency: Math.max(0, 100 - (flags.filter(f => ['LENGTH_ANOMALY', 'HIGH_ACTIVITY'].includes(f)).length * 15))
      }
    };
  }

  // Compare fingerprints to detect similar writing patterns
  compareFingerprints(fingerprint1, fingerprint2) {
    const features = [
      'vocabularyRichness', 'commonWordsRatio', 'sentimentScore',
      'punctuationDensity', 'capitalizationRatio', 'avgWordsPerSentence',
      'avgCharsPerWord', 'writingSpeed'
    ];

    let similarity = 0;
    let validFeatures = 0;

    features.forEach(feature => {
      if (fingerprint1[feature] !== undefined && fingerprint2[feature] !== undefined) {
        const diff = Math.abs(fingerprint1[feature] - fingerprint2[feature]);
        const maxVal = Math.max(fingerprint1[feature], fingerprint2[feature], 0.01);
        const featureSimilarity = 1 - (diff / maxVal);
        similarity += Math.max(0, featureSimilarity);
        validFeatures++;
      }
    });

    return validFeatures > 0 ? similarity / validFeatures : 0;
  }

  // Detect potential fake review patterns
  detectFakePatterns(fingerprints) {
    const patterns = {
      duplicateContent: [],
      similarWritingStyles: [],
      temporalClustering: [],
      behavioralAnomalies: []
    };

    // Check for duplicate or very similar content
    for (let i = 0; i < fingerprints.length; i++) {
      for (let j = i + 1; j < fingerprints.length; j++) {
        const similarity = this.compareFingerprints(fingerprints[i], fingerprints[j]);
        if (similarity > 0.85) {
          patterns.similarWritingStyles.push({
            fingerprint1: fingerprints[i].fingerprintId,
            fingerprint2: fingerprints[j].fingerprintId,
            similarity
          });
        }

        if (fingerprints[i].textHash === fingerprints[j].textHash) {
          patterns.duplicateContent.push({
            fingerprint1: fingerprints[i].fingerprintId,
            fingerprint2: fingerprints[j].fingerprintId
          });
        }
      }
    }

    // Check for temporal clustering (multiple reviews in short time)
    const timeGroups = {};
    fingerprints.forEach(fp => {
      const timeSlot = Math.floor(fp.timestamp / (30 * 60 * 1000)); // 30-minute slots
      if (!timeGroups[timeSlot]) timeGroups[timeSlot] = [];
      timeGroups[timeSlot].push(fp.fingerprintId);
    });

    Object.values(timeGroups).forEach(group => {
      if (group.length > 3) {
        patterns.temporalClustering.push({
          timeSlot: group[0],
          count: group.length,
          fingerprints: group
        });
      }
    });

    return patterns;
  }
}

module.exports = LinguisticAnalyzer; 