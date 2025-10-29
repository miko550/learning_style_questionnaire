import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const AdminDashboard = () => {
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answersUser, setAnswersUser] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answersLoading, setAnswersLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsResponse, usersResponse] = await Promise.all([
        axios.get('/admin/all-results'),
        axios.get('/admin/users')
      ]);
      setResults(resultsResponse.data);
      setUsers(usersResponse.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load admin data');
      setLoading(false);
    }
  };

  const getStyleCounts = () => {
    const counts = { activist: 0, reflector: 0, theorist: 0, pragmatist: 0 };
    results.forEach(result => {
      counts[result.dominant_style]++;
    });
    return Object.entries(counts).map(([style, count]) => ({
      name: style.charAt(0).toUpperCase() + style.slice(1),
      value: count,
      color: getStyleColor(style)
    }));
  };

  const getStyleColor = (style) => {
    const colors = {
      activist: '#8884d8',
      reflector: '#82ca9d',
      theorist: '#ffc658',
      pragmatist: '#ff7300'
    };
    return colors[style] || '#888888';
  };

  const getAverageScores = () => {
    if (results.length === 0) return [];
    
    const totals = { activist: 0, reflector: 0, theorist: 0, pragmatist: 0 };
    results.forEach(result => {
      totals.activist += result.visual_score;
      totals.reflector += result.auditory_score;
      totals.theorist += result.reading_score;
      totals.pragmatist += result.kinesthetic_score;
    });

    return Object.entries(totals).map(([style, total]) => ({
      name: style.charAt(0).toUpperCase() + style.slice(1),
      average: (total / results.length).toFixed(1),
      color: getStyleColor(style)
    }));
  };

  const viewAnswers = async (userId) => {
    try {
      setAnswersLoading(true);
      setAnswers([]);
      setAnswersUser(users.find(u => u.id === userId) || null);
      const resp = await axios.get(`/admin/user/${userId}/responses`);
      setAnswers(resp.data);
    } catch (e) {
      setError('Failed to load participant answers');
    } finally {
      setAnswersLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Loading admin dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const styleCounts = getStyleCounts();
  const averageScores = getAverageScores();
  const completedAssessments = results.length;
  const totalUsers = users.length;
  const completionRate = totalUsers > 0 ? ((completedAssessments / totalUsers) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="card">
        <h2>Admin Dashboard</h2>
        <p>Overview of all student learning style assessments</p>
      </div>

      <div className="results-grid">
        <div className="result-card">
          <h3>Total Users</h3>
          <div className="score">{totalUsers}</div>
        </div>
        <div className="result-card">
          <h3>Completed Assessments</h3>
          <div className="score">{completedAssessments}</div>
        </div>
        <div className="result-card">
          <h3>Completion Rate</h3>
          <div className="score">{completionRate}%</div>
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="chart-container">
            <h3>Learning Style Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={styleCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {styleCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Average Scores by Learning Style</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={averageScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="card">
        <h3>Individual Student Results</h3>
        {results.length === 0 ? (
          <p>No assessment results available yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Activist</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Reflector</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Theorist</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Pragmatist</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Dominant Style</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const user = users.find(u => u.id === result.user_id);
                  return (
                    <tr key={result.id}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {user ? user.username : 'Unknown User'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        {result.visual_score}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        {result.auditory_score}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        {result.reading_score}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        {result.kinesthetic_score}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        <span style={{ 
                          backgroundColor: getStyleColor(result.dominant_style),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {result.dominant_style.charAt(0).toUpperCase() + result.dominant_style.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        {new Date(result.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        <button className="btn btn-secondary" onClick={() => viewAnswers(result.user_id)}>View answers</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Answers drawer */}
      {answersUser && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Answers: {answersUser.username}</h3>
            <button className="btn btn-secondary" onClick={() => { setAnswersUser(null); setAnswers([]); }}>Close</button>
          </div>
          {answersLoading ? (
            <p>Loading answers...</p>
          ) : (
            answers.length === 0 ? (
              <p>No answers submitted.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>#</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Question</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {answers.map((a) => (
                      <tr key={a.question_id}>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{a.question_id}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{a.question_text}</td>
                        <td style={{ padding: '12px', textTransform: 'capitalize', textAlign: 'center', border: '1px solid #ddd' }}>{a.category}</td>
                        <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{a.answer === 1 ? '✓ Agree' : '✗ Disagree'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
