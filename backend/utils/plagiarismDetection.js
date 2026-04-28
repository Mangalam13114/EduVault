// ═══════════════════════════════════════════════════════
// Plagiarism Detection Utility
// ═══════════════════════════════════════════════════════

/**
 * Detect plagiarism in text content
 * 
 * TODO: Integrate with a real plagiarism detection API such as:
 *   - Copyscape (https://www.copyscape.com/apiconfigure.php)
 *   - PlagiarismCheck.org API
 *   - Copyleaks (https://copyleaks.com)
 *   - Turnitin API (for educational institutions)
 * 
 * For now, this uses a simulated plagiarism detection.
 * Replace with actual API calls for production use.
 */

const Submission = require('../models/Submission');
const axios = require('axios');
require('dotenv').config();

// Simple string similarity (Jaccard index for word sets)
function jaccardSimilarity(a, b) {
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// Cosine similarity for vectors
function cosineSimilarity(vecA, vecB) {
  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Get embedding from Hugging Face Inference API
 */
async function getEmbedding(text) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey) return null;
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      { inputs: text },
      { headers: { Authorization: `Bearer ${hfKey}` } }
    );
    // Response is [ [ ...vector ] ]
    return response.data[0];
  } catch (err) {
    return null;
  }
}

/**
 * Check plagiarism by comparing to previous submissions in the database
 * Uses Hugging Face semantic similarity if possible, else Jaccard
 */
const checkPlagiarism = async (text, studentId = null) => {
  const query = studentId ? { content: { $ne: '' }, student: { $ne: studentId } } : { content: { $ne: '' } };
  const previous = await Submission.find(query).select('content student').lean();
  let maxScore = 0;
  let matchedSources = [];

  // Try Hugging Face semantic similarity
  const embA = await getEmbedding(text);
  if (embA) {
    for (const sub of previous) {
      const embB = await getEmbedding(sub.content);
      if (!embB) continue;
      const sim = cosineSimilarity(embA, embB);
      if (sim > 0.7) {
        matchedSources.push({
          student: sub.student,
          matchPercentage: Math.round(sim * 100)
        });
      }
      if (sim > maxScore) maxScore = sim;
    }
    return {
      percentage: Math.round(maxScore * 100),
      sources: matchedSources,
      details: maxScore > 0.7 ? 'High semantic similarity detected.' : 'No significant matches found.'
    };
  }

  // Fallback: Jaccard similarity
  for (const sub of previous) {
    const sim = jaccardSimilarity(text, sub.content);
    if (sim > 0.2) {
      matchedSources.push({
        student: sub.student,
        matchPercentage: Math.round(sim * 100)
      });
    }
    if (sim > maxScore) maxScore = sim;
  }
  return {
    percentage: Math.round(maxScore * 100),
    sources: matchedSources,
    details: maxScore > 0.2 ? 'High word overlap detected.' : 'No significant matches found.'
  };
};

module.exports = { checkPlagiarism };