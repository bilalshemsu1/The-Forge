import { storage } from './storage.js';

export const CATEGORIES = [
  'system-design',
  'debugging',
  'algorithm',
  'reverse-engineering',
  'read-and-reconstruct'
];

const DEFAULT_RATING = 1000;
const K_FACTOR = 32;

export const skillRating = {
  getRatings() {
    const ratings = storage.get('skill_ratings', {});
    CATEGORIES.forEach(cat => {
      if (ratings[cat] === undefined) {
        ratings[cat] = DEFAULT_RATING;
      }
    });
    return ratings;
  },

  getCategoryRating(category) {
    const ratings = this.getRatings();
    return ratings[category] || DEFAULT_RATING;
  },

  getRatingHistory() {
    return storage.get('rating_history', []);
  },

  getStreakInfo() {
    const history = storage.get('attempt_history', []);
    if (!history.length) return { currentStreak: 0, lastActiveDate: null };

    // Unique dates (YYYY-MM-DD) with completed attempts
    const activeDates = new Set(
      history.map(item => new Date(item.timestamp).toISOString().split('T')[0])
    );
    const sortedDates = Array.from(activeDates).sort().reverse();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streak = 0;
    let checkDate = new Date();
    
    // Check if user was active today or yesterday to preserve streak
    if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
      return { currentStreak: 0, lastActiveDate: sortedDates[0] || null };
    }

    if (!activeDates.has(todayStr)) {
      checkDate = new Date(Date.now() - 86400000); // Start counting from yesterday
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (activeDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { currentStreak: streak, lastActiveDate: sortedDates[0] };
  },

  getDifficultyRating(difficulty) {
    const d = Math.max(1, Math.min(10, difficulty || 1));
    return d * 150 + 400;
  },

  calculateExpectedScore(userRating, problemRating) {
    return 1 / (1 + Math.pow(10, (problemRating - userRating) / 400));
  },

  calculateActualScore({ solved, hintsUnlockedCount, aiQualityScore, isSkip }) {
    if (isSkip || !solved) return 0.1;

    let baseScore = 1.0;
    if (hintsUnlockedCount === 1) baseScore = 0.8;
    else if (hintsUnlockedCount === 2) baseScore = 0.6;
    else if (hintsUnlockedCount >= 3) baseScore = 0.3;

    if (aiQualityScore !== undefined && aiQualityScore !== null) {
      const qualityFactor = Math.max(0.2, Math.min(1.0, aiQualityScore / 5));
      return baseScore * qualityFactor;
    }

    return baseScore;
  },

  recordAttemptResult({ problem, solved, hintsUnlockedCount, aiQualityScore, isSkip, timeTakenSeconds, userReasoning, retroNote }) {
    const category = problem.category || 'algorithm';
    const currentRating = this.getCategoryRating(category);
    const problemRating = this.getDifficultyRating(problem.difficulty);
    const expectedScore = this.calculateExpectedScore(currentRating, problemRating);
    const actualScore = this.calculateActualScore({ solved, hintsUnlockedCount, aiQualityScore, isSkip });

    const ratingDelta = Math.round(K_FACTOR * (actualScore - expectedScore));
    const newRating = Math.max(100, currentRating + ratingDelta);

    // Save updated ratings
    const ratings = this.getRatings();
    ratings[category] = newRating;
    storage.set('skill_ratings', ratings);

    // Record history snapshot
    const timestamp = Date.now();
    const historyItem = {
      id: 'att_' + timestamp + '_' + Math.random().toString(36).substr(2, 4),
      problemId: problem.id,
      problemTitle: problem.title,
      category,
      difficulty: problem.difficulty,
      solved,
      isSkip,
      hintsUnlockedCount: hintsUnlockedCount || 0,
      actualScore,
      expectedScore,
      ratingBefore: currentRating,
      ratingAfter: newRating,
      ratingDelta,
      timeTakenSeconds,
      userReasoning,
      retroNote: retroNote || '',
      aiQualityScore,
      timestamp
    };

    const attemptHistory = storage.get('attempt_history', []);
    attemptHistory.unshift(historyItem);
    storage.set('attempt_history', attemptHistory);

    // Record rating timeline entry for dashboard charts
    const ratingTimeline = storage.get('rating_history', []);
    ratingTimeline.push({
      timestamp,
      category,
      rating: newRating,
      delta: ratingDelta,
      problemTitle: problem.title
    });
    storage.set('rating_history', ratingTimeline);

    return {
      newRating,
      ratingDelta,
      actualScore,
      expectedScore,
      attempt: historyItem
    };
  }
};
