import React from 'react';
import { motion } from 'framer-motion';
import './Detection.css';

const DetectionResults = ({ submission }) => {
  if (!submission) return null;

  const { aiDetection, plagiarism } = submission;
  const hasAI = aiDetection && aiDetection.score !== null;
  const hasPlag = plagiarism && plagiarism.percentage !== null;

  if (!hasAI && !hasPlag) {
    return (
      <div className="detection-container">
        <div className="detection-card" style={{ textAlign: 'center', padding: '36px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No detection data available.</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score, threshold) => {
    if (score > threshold) return 'var(--danger)';
    if (score > threshold / 2) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="detection-container">
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-heading)' }}>
        🔍 Detection Analysis
      </h3>

      <div className="detection-grid">
        {hasAI && (
          <motion.div className="detection-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h4>🤖 AI Content Detection</h4>
            <div className="score-circle" style={{
              background: `conic-gradient(${getScoreColor(aiDetection.score, 50)} ${aiDetection.score * 3.6}deg, rgba(255,255,255,0.03) 0deg)`
            }}>
              <div className="score-circle-inner">
                <div className="score-value" style={{ color: getScoreColor(aiDetection.score, 50) }}>
                  {aiDetection.score}%
                </div>
                <div className="score-label">AI Score</div>
              </div>
            </div>
            <div className="detection-detail">{aiDetection.details}</div>
            <div style={{
              marginTop: '10px', padding: '6px 14px', borderRadius: '8px', textAlign: 'center',
              background: aiDetection.isAIGenerated ? 'rgba(251,113,133,0.06)' : 'rgba(52,211,153,0.06)',
              color: aiDetection.isAIGenerated ? 'var(--danger)' : 'var(--success)',
              fontSize: '11px', fontWeight: 700
            }}>
              {aiDetection.isAIGenerated ? '⚠️ Likely AI-Generated' : '✅ Likely Human-Written'}
            </div>

            {aiDetection.suspiciousSentences?.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>⚠️ Suspicious Sentences</h5>
                {aiDetection.suspiciousSentences.map((s, i) => (
                  <div key={i} className="suspicious-item">{s}</div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {hasPlag && (
          <motion.div className="detection-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h4>📋 Plagiarism Detection</h4>
            <div className="score-circle" style={{
              background: `conic-gradient(${getScoreColor(plagiarism.percentage, 30)} ${plagiarism.percentage * 3.6}deg, rgba(255,255,255,0.03) 0deg)`
            }}>
              <div className="score-circle-inner">
                <div className="score-value" style={{ color: getScoreColor(plagiarism.percentage, 30) }}>
                  {plagiarism.percentage}%
                </div>
                <div className="score-label">Plagiarism</div>
              </div>
            </div>
            <div className="detection-detail">{plagiarism.details}</div>
            <div style={{
              marginTop: '10px', padding: '6px 14px', borderRadius: '8px', textAlign: 'center',
              background: plagiarism.percentage > 30 ? 'rgba(251,113,133,0.06)' : 'rgba(52,211,153,0.06)',
              color: plagiarism.percentage > 30 ? 'var(--danger)' : 'var(--success)',
              fontSize: '11px', fontWeight: 700
            }}>
              {plagiarism.percentage > 50 ? '🚨 High Plagiarism' :
               plagiarism.percentage > 30 ? '⚠️ Moderate' : '✅ Original'}
            </div>

            {plagiarism.sources?.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>🔗 Matched Sources</h5>
                {plagiarism.sources.map((src, i) => (
                  <div key={i} className="source-item">
                    <div className="source-item-title">{src.title}</div>
                    <div className="source-item-url">{src.url}</div>
                    <div className="source-item-match">{src.matchPercentage}% match</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DetectionResults;