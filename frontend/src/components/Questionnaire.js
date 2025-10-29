import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Questionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/questions');
      setQuestions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load questions');
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setResponses({
      ...responses,
      [questionId]: answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const responseData = questions.map(question => ({
        question_id: question.id,
        // IMPORTANT: don't use || because 0 is falsy; preserve 0
        answer: responses[question.id] !== undefined ? responses[question.id] : 0
      }));

      await axios.post('/responses', responseData);
      window.location.href = '/results';
    } catch (err) {
      setError('Failed to submit responses');
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Loading questions...</h2>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>No questions available</h2>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allAnswered = questions.every(q => responses[q.id] !== undefined);

  return (
    <div>
      <div className="card">
        <h2>Honey and Mumford Learning Styles Questionnaire</h2>
        <p>There is no time limit to this questionnaire. It will probably take you 10-15 minutes. The accuracy of the results depends on how honest you can be. There are no right or wrong answers. If you agree more than you disagree with a statement put a tick (✓). If you disagree more than you agree put a cross (✗) by it. Be sure to mark each item with either a tick or cross.</p>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>

      <div className="question-card">
        <div className="question-text">
          {question.text}
        </div>
        
        <div className="rating-scale">
          <div className={`rating-option ${responses[question.id] === 1 ? 'selected' : ''}`}>
            <input
              type="radio"
              id={`q${question.id}_1`}
              name={`question_${question.id}`}
              value="1"
              checked={responses[question.id] === 1}
              onChange={() => handleAnswer(question.id, 1)}
            />
            <label htmlFor={`q${question.id}_1`}>
              ✓ Agree
            </label>
          </div>
          
          <div className={`rating-option ${responses[question.id] === 0 ? 'selected' : ''}`}>
            <input
              type="radio"
              id={`q${question.id}_0`}
              name={`question_${question.id}`}
              value="0"
              checked={responses[question.id] === 0}
              onChange={() => handleAnswer(question.id, 0)}
            />
            <label htmlFor={`q${question.id}_0`}>
              ✗ Disagree
            </label>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card" style={{ textAlign: 'center' }}>
        <button 
          onClick={prevQuestion} 
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          Previous
        </button>
        
        {isLastQuestion ? (
          <button 
            onClick={handleSubmit} 
            disabled={!allAnswered || submitting}
            className="btn btn-success"
            style={{ marginLeft: '10px' }}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button 
            onClick={nextQuestion} 
            disabled={responses[question.id] === undefined}
            className="btn"
            style={{ marginLeft: '10px' }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
