import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import '../Dashboard/Dashboard.css';

const COLORS = {
  approved: '#4ade80',
  pending: '#f472b6',
  rejected: '#fb7185',
  need_improvement: '#a855f7'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(22, 27, 38, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
        color: '#e4e8f1',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPanel = ({ analytics, role }) => {
  if (!analytics) return null;

  const { statusCounts, aiScores, plagScores, monthlyTrend, marksData, courseBreakdown, totalSubmissions } = analytics;

  // Pie data for status distribution
  const pieData = [
    { name: 'Approved', value: statusCounts.approved, color: COLORS.approved },
    { name: 'Pending', value: statusCounts.pending, color: COLORS.pending },
    { name: 'Rejected', value: statusCounts.rejected, color: COLORS.rejected },
    { name: 'Need Improvement', value: statusCounts.need_improvement, color: COLORS.need_improvement },
  ].filter(d => d.value > 0);

  // AI score distribution for bar chart
  const aiDistribution = [
    { range: '0-20%', count: aiScores.filter(s => s.score <= 20).length, color: '#4ade80' },
    { range: '21-40%', count: aiScores.filter(s => s.score > 20 && s.score <= 40).length, color: '#22c55e' },
    { range: '41-60%', count: aiScores.filter(s => s.score > 40 && s.score <= 60).length, color: '#a855f7' },
    { range: '61-80%', count: aiScores.filter(s => s.score > 60 && s.score <= 80).length, color: '#ec4899' },
    { range: '81-100%', count: aiScores.filter(s => s.score > 80).length, color: '#fb7185' },
  ];

  // Plagiarism distribution
  const plagDistribution = [
    { range: '0-10%', count: plagScores.filter(s => s.percentage <= 10).length },
    { range: '11-25%', count: plagScores.filter(s => s.percentage > 10 && s.percentage <= 25).length },
    { range: '26-50%', count: plagScores.filter(s => s.percentage > 25 && s.percentage <= 50).length },
    { range: '51-75%', count: plagScores.filter(s => s.percentage > 50 && s.percentage <= 75).length },
    { range: '76-100%', count: plagScores.filter(s => s.percentage > 75).length },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '4px' }}>
          📊 Assignment Analytics
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Total submissions analyzed: {totalSubmissions}
        </p>
      </div>

      <div className="analytics-grid">
        {/* Status Distribution Pie */}
        <motion.div className="analytics-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h4>📈 Submission Status</h4>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No submission data yet
            </div>
          )}
        </motion.div>

        {/* AI Detection Distribution */}
        <motion.div className="analytics-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h4>🤖 AI Detection Scores</h4>
          {aiScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={aiDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Submissions" radius={[4, 4, 0, 0]} animationDuration={800}>
                  {aiDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No AI detection data yet
            </div>
          )}
        </motion.div>

        {/* Plagiarism Distribution */}
        <motion.div className="analytics-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h4>📋 Plagiarism Distribution</h4>
          {plagScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={plagDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Submissions" fill="#a855f7" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No plagiarism data yet
            </div>
          )}
        </motion.div>

        {/* Submission Trend */}
        <motion.div className="analytics-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h4>📅 Submission Trend</h4>
          {monthlyTrend && monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Submissions" stroke="#c084fc" fill="url(#trendGradient)" strokeWidth={2} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No trend data yet
            </div>
          )}
        </motion.div>

        {/* Course-wise Breakdown - Full Width */}
        {courseBreakdown && courseBreakdown.length > 0 && (
          <motion.div className="analytics-card analytics-card-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h4>📚 Course-wise Breakdown</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={courseBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{value}</span>}
                />
                <Bar dataKey="approved" name="Approved" fill={COLORS.approved} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill={COLORS.pending} stackId="a" />
                <Bar dataKey="rejected" name="Rejected" fill={COLORS.rejected} stackId="a" />
                <Bar dataKey="need_improvement" name="Need Improvement" fill={COLORS.need_improvement} stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Marks Distribution */}
        {marksData && marksData.length > 0 && (
          <motion.div className="analytics-card analytics-card-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h4>🎯 Marks Distribution</h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={marksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey={role === 'teacher' ? 'student' : 'assignment'}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="marks"
                  name="Marks"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#ec4899' }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;