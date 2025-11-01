import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import axios from 'axios';

const Questionnaire = () => {
  const { language } = useLanguage();
  const t = (key) => {
    const dict = {
      en: {
        title: 'Honey and Mumford Learning Styles Questionnaire',
        intro: 'There is no time limit to this questionnaire. It will probably take you 10-15 minutes. The accuracy of the results depends on how honest you can be. There are no right or wrong answers. If you agree more than you disagree with a statement put a tick (✓). If you disagree more than you agree put a cross (✗) by it. Be sure to mark each item with either a tick or cross.',
        loading: 'Loading questions...',
        none: 'No questions available',
        questionXofY: 'Question',
        of: 'of',
        agree: 'Agree',
        disagree: 'Disagree',
        previous: 'Previous',
        next: 'Next',
        submit: 'Submit Assessment',
        submitting: 'Submitting...'
      },
      ms: {
        title: 'Soal Selidik Gaya Pembelajaran Honey dan Mumford',
        intro: 'Tiada had masa untuk soal selidik ini. Ia mengambil masa 10-15 minit. Ketepatan keputusan bergantung kepada kejujuran anda. Tiada jawapan betul atau salah. Jika anda lebih bersetuju, tandakan tanda (✓). Jika anda lebih tidak bersetuju, tandakan silang (✗). Pastikan setiap item ditanda sama ada tanda atau silang.',
        loading: 'Memuatkan soalan...',
        none: 'Tiada soalan tersedia',
        questionXofY: 'Soalan',
        of: 'daripada',
        agree: 'Setuju',
        disagree: 'Tidak setuju',
        previous: 'Sebelum',
        next: 'Seterusnya',
        submit: 'Hantar Penilaian',
        submitting: 'Menghantar...'
      }
    };
    return dict[language][key];
  };
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`/questions`, { params: { lang: language } });
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
          <h2>{t('loading')}</h2>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>{t('none')}</h2>
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
        <h2>{t('title')}</h2>
        <p>{t('intro')}</p>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {t('questionXofY')} {currentQuestion + 1} {t('of')} {questions.length}
        </div>
      </div>

      <div className="question-card">
        <div className="question-text">
          {question.text}
        </div>
        
        <div className="rating-scale choice-toggle">
          <div className={`rating-option ${responses[question.id] === 1 ? 'selected' : ''}`}>
            <input
              type="radio"
              id={`q${question.id}_1`}
              name={`question_${question.id}`}
              value="1"
              checked={responses[question.id] === 1}
              onChange={() => handleAnswer(question.id, 1)}
            />
            <label htmlFor={`q${question.id}_1`} className="option-pill agree">
              <span className="icon">✓</span> {t('agree')}
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
            <label htmlFor={`q${question.id}_0`} className="option-pill disagree">
              <span className="icon">✗</span> {t('disagree')}
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
          {t('previous')}
        </button>
        
        {isLastQuestion ? (
          <button 
            onClick={handleSubmit} 
            disabled={!allAnswered || submitting}
            className="btn btn-success"
            style={{ marginLeft: '10px' }}
          >
            {submitting ? t('submitting') : t('submit')}
          </button>
        ) : (
          <button 
            onClick={nextQuestion} 
            disabled={responses[question.id] === undefined}
            className="btn"
            style={{ marginLeft: '10px' }}
          >
            {t('next')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
