import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import api from '../../utils/api';

const AssignmentSubmit = ({ assignment, existingSubmission, onSubmitComplete, onCancel }) => {
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword'];
      if (!allowed.includes(selectedFile.type)) {
        toast.error('Only PDF, DOCX, DOC, and TXT files allowed.');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File too large. Max 10MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) {
      toast.warning('Please provide text or upload a file');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignmentId', assignment._id);
      if (content.trim()) formData.append('content', content);
      if (file) formData.append('file', file);

      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSubmitComplete(res.data.submission);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submit-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📝 {existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
        </h3>
        <motion.button onClick={onCancel} whileTap={{ scale: 0.9 }} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px'
        }}><FiX /></motion.button>
      </div>

      {existingSubmission && (
        <div style={{
          padding: '10px 14px', marginBottom: '14px', borderRadius: '8px',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
          fontSize: '12px', color: 'var(--warning)'
        }}>
          ⚠️ Submitting again will replace your previous submission and reset status to pending.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            Text Content
          </label>
          <textarea
            className="textarea-field"
            placeholder="Type or paste your assignment content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ minHeight: '160px' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            Upload File (PDF, DOCX, TXT)
          </label>
          <motion.div
            className={`file-upload-area ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {file ? (
              <>
                <FiFile size={36} style={{ color: 'var(--success)', marginBottom: '10px' }} />
                <div className="file-upload-text">{file.name}</div>
                <div className="file-upload-hint">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                <motion.button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    marginTop: '10px', padding: '5px 14px', background: 'rgba(251,113,133,0.08)',
                    border: '1px solid rgba(251,113,133,0.2)', borderRadius: '6px',
                    color: 'var(--danger)', fontSize: '11px', cursor: 'pointer'
                  }}
                >Remove</motion.button>
              </>
            ) : (
              <>
                <FiUpload size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                <div className="file-upload-text">Click to upload</div>
                <div className="file-upload-hint">PDF, DOCX, DOC, or TXT (max 10MB)</div>
              </>
            )}
          </motion.div>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <motion.button type="submit" className="btn-primary" disabled={submitting} whileTap={{ scale: 0.96 }}>
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentSubmit;