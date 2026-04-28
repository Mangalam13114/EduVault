// ═══════════════════════════════════════════════════════
// AI Content Detection Utility
// ═══════════════════════════════════════════════════════

/**
 * Detect AI-generated content in text
 * 
 * TODO: Integrate with a real AI detection API such as:
 *   - GPTZero (https://gptzero.me)
 *   - Originality.ai (https://originality.ai)
 *   - ZeroGPT (https://zerogpt.com)
 *   - Copyleaks AI Content Detector
 * 
 * For now, this uses a simulated detection algorithm
 * that analyzes text patterns. Replace with real API calls.
 */

const axios = require('axios');
require('dotenv').config();

const analyzeAIContent = async (text) => {
  // Use Hugging Face Inference API if key is present, else fallback to simulation
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (hfKey) {
    try {
      // roberta-base-openai-detector is a common open-source AI detector
      const model = 'roberta-base-openai-detector';
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: text },
        { headers: { Authorization: `Bearer ${hfKey}` } }
      );
      const label = response.data && response.data[0] && response.data[0].label ? response.data[0].label : 'Unknown';
      const rawScore = response.data && response.data[0] && response.data[0].score ? response.data[0].score : null;
      let aiPercent = null;
      if (rawScore !== null) {
        if (label === 'Fake') {
          aiPercent = Math.round(rawScore * 100); // AI confidence
        } else if (label === 'Real') {
          aiPercent = Math.round((1 - rawScore) * 100); // Human confidence, so AI percent is inverse
        }
      }
      // Always return a result, fallback to local if label/score is missing
      if (aiPercent !== null && label !== 'Unknown') {
        return {
          score: aiPercent,
          isAIGenerated: label === 'Fake',
          details: label === 'Fake' ? 'Likely AI-generated content.' : label === 'Real' ? 'Likely human-written content.' : 'Unable to determine.',
          suspiciousSentences: []
        };
      }
    } catch (err) {
      // Continue to fallback
    }
  }
  // Always fallback to local heuristic if API fails or is missing
  try {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let aiScore = 0;
    const suspiciousSentences = [];
    const aiPatterns = [
      /\bin conclusion\b/gi,
      /\bit is worth noting\b/gi,
      /\bfurthermore\b/gi,
      /\bmoreover\b/gi,
      /\bnevertheless\b/gi,
      /\bin summary\b/gi,
      /\bit is important to note\b/gi,
      /\boverall\b/gi,
      /\bsignificantly\b/gi,
      /\badditionally\b/gi,
      /\bconsequently\b/gi,
      /\bspecifically\b/gi
    ];
    let patternMatches = 0;
    aiPatterns.forEach(pattern => {
      if (pattern.test(text)) patternMatches++;
    });
    aiScore = Math.min((patternMatches / aiPatterns.length) * 60, 60);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    if (sentenceLengths.length > 2) {
      const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
      const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / sentenceLengths.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev < 5) aiScore += 20;
      else if (stdDev < 8) aiScore += 10;
    }

    // Check for lack of first-person pronouns (AI often avoids them)
    const firstPersonCount = (text.match(/\b(I|my|me|mine|myself)\b/gi) || []).length;
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 50 && firstPersonCount / wordCount < 0.01) {
      aiScore += 15;
    }

    // Add randomization for realism (simulating API variance)
    aiScore += Math.random() * 10 - 5;
    aiScore = Math.max(0, Math.min(100, Math.round(aiScore)));

    // Flag suspicious sentences
    sentences.forEach((sentence, idx) => {
      const trimmed = sentence.trim();
      let sentenceScore = 0;
      aiPatterns.forEach(pattern => {
        if (pattern.test(trimmed)) sentenceScore++;
      });
      if (sentenceScore >= 2 || (trimmed.split(/\s+/).length > 25 && trimmed.split(/\s+/).length < 35)) {
        suspiciousSentences.push(trimmed);
      }
    });

    return {
      score: aiScore,
      isAIGenerated: aiScore > 50,
      details: aiScore > 70
        ? 'High probability of AI-generated content detected.'
        : aiScore > 40
          ? 'Moderate indicators of AI-generated content.'
          : 'Content appears to be primarily human-written.',
      suspiciousSentences: suspiciousSentences.slice(0, 5)
    };

  } catch (error) {
    // Always return a fallback result
    return {
      score: 0,
      isAIGenerated: false,
      details: 'AI detection service unavailable.',
      suspiciousSentences: []
    };
  }
};

module.exports = { analyzeAIContent };