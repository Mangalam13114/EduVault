import React from 'react';
import { format, isPast, isAfter } from 'date-fns';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import '../Course/Course.css';
import './Assignment.css';

const AssignmentList = ({
  assignments,
  submissions,
  onSelect,
  selectedId,
  userRole,
  canResubmit,
  renderExpandedFooter
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle color="var(--success)" size={13} />;
      case 'rejected': return <FiXCircle color="var(--danger)" size={13} />;
      case 'need_improvement': return <FiAlertTriangle color="var(--info)" size={13} />;
      case 'pending': return <FiClock color="var(--warning)" size={13} />;
      default: return null;
    }
  };

  return (
    <div className="assignment-list">
      {assignments.map((assignment, index) => {
        const submission = submissions[assignment._id];
        const isOverdue = isPast(new Date(assignment.endDate));
        const isActive = isAfter(new Date(assignment.endDate), new Date()) &&
                         isAfter(new Date(), new Date(assignment.startDate));
        const resubmitAllowed = canResubmit ? canResubmit(submission) : true;
        const isReviewed = submission
          ? ['approved', 'rejected', 'need_improvement'].includes(submission.status)
          : false;
        const canShowDetection = userRole !== 'student' || isReviewed;

        return (
          <motion.div
            key={assignment._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <motion.div
              className="assignment-item"
              onClick={() => onSelect(assignment)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.99 }}
              style={{
                borderColor: selectedId === assignment._id ? 'var(--accent-1)' : undefined,
                background: selectedId === assignment._id ? 'rgba(79,172,254,0.03)' : undefined
              }}
            >
              <div className="assignment-item-info">
                <h4>{assignment.title}</h4>
                <p>
                  Due: {format(new Date(assignment.endDate), 'MMM dd, yyyy HH:mm')}
                  {' · '}Marks: {assignment.totalMarks}
                </p>
              </div>
              <div className="assignment-item-right">
                {submission && (
                  <span className={`status-badge status-${submission.status}`}>
                    {getStatusIcon(submission.status)}
                    {submission.status.replace('_', ' ')}
                  </span>
                )}
                {!submission && userRole === 'student' && (
                  <span className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}>
                    {isOverdue ? 'Overdue' : isActive ? 'Active' : 'Upcoming'}
                  </span>
                )}
                {/* Show resubmit indicator for students */}
                {submission && userRole === 'student' && resubmitAllowed && submission.status !== 'pending' && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '10px', color: 'var(--accent-1)', fontWeight: 600
                  }}>
                    <FiRefreshCw size={11} /> Resubmit
                  </span>
                )}
              </div>
            </motion.div>

            {/* Expanded Detail */}
            {selectedId === assignment._id && (
              <motion.div
                className="assignment-detail-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h4>{assignment.title}</h4>
                <div className="desc">{assignment.description}</div>
                <div className="assignment-meta-row">
                  <div className="assignment-meta-item">📅 Start: {format(new Date(assignment.startDate), 'MMM dd, yyyy')}</div>
                  <div className="assignment-meta-item">⏰ End: {format(new Date(assignment.endDate), 'MMM dd, yyyy HH:mm')}</div>
                  <div className="assignment-meta-item">📊 Marks: {assignment.totalMarks}</div>
                </div>

                {submission && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <span className={`status-badge status-${submission.status}`} style={{ fontSize: '12px' }}>
                        {submission.status.replace('_', ' ')}
                      </span>
                      {submission.marks != null && (
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-1)' }}>
                          Marks: {submission.marks}/{assignment.totalMarks}
                        </span>
                      )}
                    </div>

                    {/* Resubmit badge */}
                    {userRole === 'student' && (
                      <div className={`resubmit-allowed-badge ${resubmitAllowed ? 'can-resubmit' : 'cannot-resubmit'}`}>
                        {resubmitAllowed ? (
                          <><FiRefreshCw size={12} /> You can resubmit this assignment</>
                        ) : (
                          <><FiCheckCircle size={12} /> This assignment has been approved</>
                        )}
                      </div>
                    )}

                    {submission.remarks && (
                      <div className="remarks-box">
                        <label>Teacher's Remarks</label>
                        <p>{submission.remarks}</p>
                      </div>
                    )}

                    {/* Detection scores */}
                    {canShowDetection && (submission.aiDetection?.score != null || submission.plagiarism?.percentage != null) && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                        {submission.aiDetection?.score != null && (
                          <div style={{
                            padding: '10px 16px', borderRadius: '10px',
                            background: submission.aiDetection.score > 50 ? 'rgba(251,113,133,0.06)' : 'rgba(52,211,153,0.06)',
                            border: `1px solid ${submission.aiDetection.score > 50 ? 'rgba(251,113,133,0.15)' : 'rgba(52,211,153,0.15)'}`,
                            fontSize: '12px'
                          }}>
                            🤖 AI: <strong style={{ color: submission.aiDetection.score > 50 ? 'var(--danger)' : 'var(--success)' }}>
                              {submission.aiDetection.score}%
                            </strong>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>{submission.aiDetection.details}</div>
                          </div>
                        )}
                        {submission.plagiarism?.percentage != null && (
                          <div style={{
                            padding: '10px 16px', borderRadius: '10px',
                            background: submission.plagiarism.percentage > 30 ? 'rgba(251,113,133,0.06)' : 'rgba(52,211,153,0.06)',
                            border: `1px solid ${submission.plagiarism.percentage > 30 ? 'rgba(251,113,133,0.15)' : 'rgba(52,211,153,0.15)'}`,
                            fontSize: '12px'
                          }}>
                            📋 Plagiarism: <strong style={{ color: submission.plagiarism.percentage > 30 ? 'var(--danger)' : 'var(--success)' }}>
                              {submission.plagiarism.percentage}%
                            </strong>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>{submission.plagiarism.details}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {userRole === 'student' && !isReviewed && (submission.aiDetection?.score != null || submission.plagiarism?.percentage != null) && (
                      <div style={{
                        marginTop: '12px',
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        AI and plagiarism scores will be visible after teacher review.
                      </div>
                    )}

                    {/* Suspicious sentences */}
                    {canShowDetection && submission.aiDetection?.suspiciousSentences?.length > 0 && (
                      <div style={{ marginTop: '14px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                          ⚠️ SUSPICIOUS SENTENCES
                        </label>
                        {submission.aiDetection.suspiciousSentences.map((s, i) => (
                          <div key={i} style={{
                            padding: '8px 12px', marginBottom: '5px', borderRadius: '6px',
                            background: 'rgba(251,113,133,0.04)', borderLeft: '3px solid var(--danger)',
                            fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5
                          }}>{s}</div>
                        ))}
                      </div>
                    )}

                    {/* Sources */}
                    {canShowDetection && submission.plagiarism?.sources?.length > 0 && (
                      <div style={{ marginTop: '14px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                          🔗 MATCHED SOURCES
                        </label>
                        {submission.plagiarism.sources.map((src, i) => (
                          <div key={i} style={{
                            padding: '8px 12px', marginBottom: '5px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-default)', fontSize: '11px'
                          }}>
                            <div style={{ fontWeight: 600 }}>{src.title}</div>
                            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{src.url} · {src.matchPercentage}% match</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Inline footer (e.g. submit form) */}
                {typeof renderExpandedFooter === 'function' && (
                  <div style={{ marginTop: '14px' }}>
                    {renderExpandedFooter(assignment, submission)}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AssignmentList;