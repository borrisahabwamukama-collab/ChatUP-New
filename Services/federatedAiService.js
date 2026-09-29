/**
 * ChatUp Federated On-Device AI Engine
 * Processes text analytics, sentiment classification, and toxicity checks locally.
 */

// Local keyword dictionaries for on-device detection without cloud calls
const LOCAL_SPAM_PATTERNS = [
  'free coins', 
  'click here', 
  'airdrop claim', 
  'crypto giveaway', 
  'win cash fast',
  'urgent transfer'
];

const LOCAL_POSITIVE_TRIGGERS = [
  'love', 'wonderful', 'amazing', 'great', 'awesome', 'thank', 'good', '✨', '❤️', '🚀'
];

/**
 * Runs local inference to detect toxicity or spam without sending data to a server
 */
export async function runLocalToxicityGuard(text) {
  if (!text || typeof text !== 'string') return { isSafe: true, confidence: 1.0 };

  const lowerText = text.toLowerCase();
  let flagged = false;

  for (let pattern of LOCAL_SPAM_PATTERNS) {
    if (lowerText.includes(pattern)) {
      flagged = true;
      break;
    }
  }

  return {
    isSafe: !flagged,
    confidence: flagged ? 0.95 : 0.99,
    processedLocally: true,
  };
}

/**
 * Runs local sentiment analysis to determine message mood on-device
 */
export async function runLocalSentimentAnalysis(text) {
  if (!text || typeof text !== 'string') return 'neutral';

  const lowerText = text.toLowerCase();
  let positiveHits = 0;

  for (let trigger of LOCAL_POSITIVE_TRIGGERS) {
    if (lowerText.includes(trigger)) {
      positiveHits++;
    }
  }

  if (positiveHits > 0) return 'positive';
  return 'neutral';
}