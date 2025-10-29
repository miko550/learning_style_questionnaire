import React, { useState, useEffect } from 'react';
import { Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import axios from 'axios';

const Results = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/my-result');
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No results found. Please complete the assessment first.');
      } else {
        setError('Failed to load results');
      }
      setLoading(false);
    }
  };

  const getStyleDescription = (style) => {
    const descriptions = {
      activist: "You learn best through active participation and hands-on experience. You enjoy new challenges, group work, and learning by doing. You prefer to jump in and try things out rather than spend time planning.",
      reflector: "You learn best by observing and thinking about experiences. You like to gather information, consider all angles, and think things through before acting. You prefer to watch and listen before participating.",
      theorist: "You learn best through logical, systematic approaches. You like to understand the underlying principles and theories behind what you're learning. You prefer structured learning with clear objectives and logical progression.",
      pragmatist: "You learn best when you can see the practical application of what you're learning. You like to try out new ideas and techniques to see if they work in practice. You prefer learning that has immediate relevance to your work or life."
    };
    return descriptions[style] || "Your learning style is being analyzed.";
  };

  const getStyleRecommendations = (style) => {
    const recommendations = {
      activist: [
        "Seek out new experiences and challenges",
        "Participate in group activities and discussions",
        "Learn through role-playing and simulations",
        "Take on leadership roles in projects",
        "Try out new ideas and techniques immediately"
      ],
      reflector: [
        "Take time to observe and gather information",
        "Keep a learning journal to reflect on experiences",
        "Ask questions and seek feedback from others",
        "Review and analyze what you've learned",
        "Participate in discussions after observing first"
      ],
      theorist: [
        "Look for underlying principles and theories",
        "Create structured learning plans and objectives",
        "Use logical frameworks and models",
        "Question assumptions and explore concepts deeply",
        "Organize information systematically"
      ],
      pragmatist: [
        "Focus on practical applications and real-world examples",
        "Try out new techniques in your work or studies",
        "Look for immediate benefits and relevance",
        "Learn from case studies and practical examples",
        "Apply what you learn as soon as possible"
      ]
    };
    return recommendations[style] || [];
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Loading your results...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-danger">{error}</div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/questionnaire" className="btn">Take Assessment</a>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card">
        <h2>No Results Found</h2>
        <p>You haven't completed the assessment yet.</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/questionnaire" className="btn">Take Assessment</a>
        </div>
      </div>
    );
  }

  // Consistent colors for all components
  const styleColors = {
    activist: '#8884d8',
    reflector: '#82ca9d', 
    theorist: '#ffc658',
    pragmatist: '#ff7300'
  };

  const chartData = [
    { name: 'Activist', score: result.visual_score, color: styleColors.activist },
    { name: 'Reflector', score: result.auditory_score, color: styleColors.reflector },
    { name: 'Theorist', score: result.reading_score, color: styleColors.theorist },
    { name: 'Pragmatist', score: result.kinesthetic_score, color: styleColors.pragmatist }
  ];

  // Radar chart data
  const radarData = [
    { subject: 'Activist', A: result.visual_score, fullMark: 20 },
    { subject: 'Reflector', A: result.auditory_score, fullMark: 20 },
    { subject: 'Theorist', A: result.reading_score, fullMark: 20 },
    { subject: 'Pragmatist', A: result.kinesthetic_score, fullMark: 20 }
  ];

  const maxScore = Math.max(result.visual_score, result.auditory_score, result.reading_score, result.kinesthetic_score);

  return (
    <div>
      <div className="card">
        <h2>Your Learning Style Results</h2>
        <p>Based on your responses, here's your learning style profile:</p>
      </div>

      <div className="results-grid">
        {chartData.map((item, index) => (
          <div key={index} className="result-card">
            <h3>{item.name}</h3>
            <div className="score" style={{ color: item.color }}>
              {item.score}
            </div>
            <div className="progress-bar" style={{ height: '10px', margin: '10px 0' }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(item.score / maxScore) * 100}%`,
                  backgroundColor: item.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Your Dominant Learning Style</h2>
        <div className="dominant-style" style={{ color: styleColors[result.dominant_style] }}>
          {result.dominant_style.charAt(0).toUpperCase() + result.dominant_style.slice(1)}
        </div>
        <p>{getStyleDescription(result.dominant_style)}</p>
      </div>

      <div className="chart-container">
        <h3>Learning Style Radar Chart</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 20]} />
            <Radar 
              name="Score" 
              dataKey="A" 
              stroke={styleColors[result.dominant_style]} 
              fill={styleColors[result.dominant_style]} 
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>


      <div className="card">
        <h3>Recommendations for Your Learning Style</h3>
        <ul>
          {getStyleRecommendations(result.dominant_style).map((rec, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center' }}>
          <a href="/questionnaire" className="btn btn-secondary">Retake Assessment</a>
        </div>
      </div>
    </div>
  );
};

export default Results;
