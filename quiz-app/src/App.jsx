import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  Check, 
  Layers, 
  Clock, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'aws-ccp-quiz-state';

export default function App() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizState, setQuizState] = useState('welcome'); // 'welcome' | 'exam' | 'summary'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load questions from JSON
  useEffect(() => {
    fetch('/questions.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch questions dataset');
        }
        return res.json();
      })
      .then(data => {
        setAllQuestions(data);
        setIsLoading(false);
        
        // Check if there is saved progress in localStorage
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            if (parsed.selectedQuestions && parsed.selectedQuestions.length > 0) {
              setSelectedQuestions(parsed.selectedQuestions);
              setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
              setAnswers(parsed.answers || {});
              setQuizState(parsed.quizState || 'welcome');
            }
          } catch (e) {
            console.error('Failed to parse saved state from local storage', e);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (selectedQuestions.length > 0) {
      const stateToSave = {
        selectedQuestions,
        currentQuestionIndex,
        answers,
        quizState
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [selectedQuestions, currentQuestionIndex, answers, quizState]);

  // Helper: Shuffle questions and select 50
  const startNewQuiz = () => {
    if (allQuestions.length === 0) return;
    
    // Shuffle all questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 50);
    
    setSelectedQuestions(selected);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizState('exam');
  };

  // Helper: Start over completely
  const startOver = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSelectedQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizState('welcome');
  };

  // Toggle option selection (multiselect is supported for every question)
  const toggleOption = (questionId, optionId) => {
    setAnswers(prev => {
      const currentSelections = prev[questionId] || [];
      if (currentSelections.includes(optionId)) {
        return {
          ...prev,
          [questionId]: currentSelections.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...currentSelections, optionId]
        };
      }
    });
  };

  // Finish exam and go to summary
  const finishExam = () => {
    setQuizState('summary');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16 }}>
        <RefreshCw style={{ animation: 'spin 2s linear infinite', color: 'var(--primary)' }} size={40} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>Loading AWS Practice Exam Questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 24, gap: 16 }}>
        <AlertTriangle color="var(--error)" size={48} />
        <h2 style={{ color: 'var(--text-primary)' }}>Failed to load questions</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Calculate scores for summary screen
  const calculateResults = () => {
    let score = 0;
    const details = selectedQuestions.map(q => {
      const userSelected = answers[q.id] || [];
      const correct = q.correctAnswers;
      
      // Determine correctness:
      // The user must select exactly all correct options and no incorrect ones.
      const isCorrect = userSelected.length === correct.length &&
        userSelected.every(ans => correct.includes(ans));
        
      if (isCorrect) score++;
      
      return {
        ...q,
        userSelected,
        isCorrect
      };
    });
    
    return { score, details };
  };

  const results = quizState === 'summary' ? calculateResults() : null;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Layers color="var(--primary)" size={28} />
            <div>
              <h1 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>AWS Cloud Practitioner</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Practice Quiz Simulator</p>
            </div>
          </div>
          <span className="badge">
            {allQuestions.length} Questions Available
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Welcome Screen */}
        {quizState === 'welcome' && (
          <div className="glass-card animate-fade-in" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-glow)', padding: 20, borderRadius: '50%', border: '1px solid rgba(255, 153, 0, 0.2)' }}>
              <Award color="var(--primary)" size={64} />
            </div>
            
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: 8, background: 'linear-gradient(90deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Start Your Practice Exam
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                Prepare for the AWS Certified Cloud Practitioner (CLF-C02) exam. We will assemble a random set of 50 questions from our practice datastore.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, width: '100%', maxWidth: 600, marginTop: 12 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Clock color="var(--secondary)" size={24} style={{ marginBottom: 8 }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>50 Questions</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Randomly selected set</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <HelpCircle color="var(--primary)" size={24} style={{ marginBottom: 8 }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Multi-Select</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Choose all that apply</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <CheckCircle color="var(--success)" size={24} style={{ marginBottom: 8 }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Delayed Results</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Detailed review at the end</p>
              </div>
            </div>

            <button className="btn btn-primary" onClick={startNewQuiz} style={{ marginTop: 12, padding: '16px 36px', fontSize: '1.05rem' }}>
              Begin Practice Exam
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Active Exam Screen */}
        {quizState === 'exam' && selectedQuestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
            {/* Progress Header */}
            <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Question {currentQuestionIndex + 1} of 50
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Source: {selectedQuestions[currentQuestionIndex].sourceFile.replace('.md', '').toUpperCase()}
                </span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${((currentQuestionIndex + 1) / 50) * 100}%` }}></div>
              </div>
            </div>

            {/* Question Display */}
            <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', lineHeight: 1.5, color: '#fff', fontWeight: 600 }}>
                  {selectedQuestions[currentQuestionIndex].question}
                </h3>
                {selectedQuestions[currentQuestionIndex].correctAnswers.length > 1 && (
                  <p style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: 12, fontWeight: 600 }}>
                    ⚠️ Choose {selectedQuestions[currentQuestionIndex].correctAnswers.length} answers.
                  </p>
                )}
              </div>

              {/* Choices */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedQuestions[currentQuestionIndex].choices.map(choice => {
                  const isSelected = (answers[selectedQuestions[currentQuestionIndex].id] || []).includes(choice.id);
                  return (
                    <div 
                      key={choice.id} 
                      className={`option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleOption(selectedQuestions[currentQuestionIndex].id, choice.id)}
                    >
                      <span className="option-letter">{choice.id}</span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.4, flex: 1 }}>{choice.text}</span>
                      <div className="checkbox-indicator">
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1, cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer' }}
              >
                <ArrowLeft size={18} />
                Previous
              </button>

              {currentQuestionIndex < 49 ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Next Question
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={finishExam}
                  style={{ background: 'linear-gradient(135deg, var(--success), #059669)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)' }}
                >
                  Submit & Finish Exam
                  <Award size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary / Review Screen */}
        {quizState === 'summary' && results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="animate-fade-in">
            {/* Top Score summary widget */}
            <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
              <div 
                className="circular-progress" 
                style={{ '--percentage': Math.round((results.score / 50) * 100) }}
              >
                <div className="circular-progress-inner">
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    {results.score}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    out of 50
                  </span>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Practice Quiz Complete</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Passing Score: 70% (35/50). Your Score: {Math.round((results.score / 50) * 100)}%
                </p>
                <span 
                  className="badge" 
                  style={{ 
                    marginTop: 12, 
                    backgroundColor: results.score >= 35 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: results.score >= 35 ? 'var(--success)' : 'var(--error)',
                    borderColor: results.score >= 35 ? 'var(--success)' : 'var(--error)'
                  }}
                >
                  {results.score >= 35 ? 'PASSED - Great Work!' : 'FAILED - Needs Review'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button className="btn btn-primary" onClick={startNewQuiz}>
                  <RefreshCw size={18} />
                  Try Another 50
                </button>
              </div>
            </div>

            {/* Questions Review list */}
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color="var(--primary)" />
                Review Exam Answers
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {results.details.map((q, idx) => {
                  return (
                    <div 
                      key={q.id} 
                      className="glass-card" 
                      style={{ 
                        padding: 24, 
                        borderLeft: `4px solid ${q.isCorrect ? 'var(--success)' : 'var(--error)'}`
                      }}
                    >
                      {/* Header status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          Question {idx + 1}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {q.isCorrect ? (
                            <>
                              <CheckCircle size={16} color="var(--success)" />
                              <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>Correct</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} color="var(--error)" />
                              <span style={{ fontSize: '0.85rem', color: 'var(--error)', fontWeight: 600 }}>Incorrect</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Question text */}
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>
                        {q.question}
                      </h4>

                      {/* Option evaluation */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                        {q.choices.map(choice => {
                          const isSelected = q.userSelected.includes(choice.id);
                          const isCorrectOption = q.correctAnswers.includes(choice.id);
                          
                          let statusClass = '';
                          if (isCorrectOption) {
                            statusClass = 'correct';
                          } else if (isSelected && !isCorrectOption) {
                            statusClass = 'incorrect';
                          }

                          return (
                            <div key={choice.id} className={`option-card ${statusClass}`} style={{ cursor: 'default', transform: 'none' }}>
                              <span className="option-letter">{choice.id}</span>
                              <span style={{ fontSize: '0.9rem', flex: 1, color: 'var(--text-primary)' }}>{choice.text}</span>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {isCorrectOption && (
                                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                    Correct Answer
                                  </span>
                                )}
                                {isSelected && (
                                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                    Your Choice
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                          <h5 style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                            Explanation
                          </h5>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky footer with start over */}
      <footer className="footer">
        <div style={{ width: '100%', maxWidth: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            AWS Certified Cloud Practitioner practice tool. All rights reserved.
          </p>
          <button className="btn btn-danger-outline btn" onClick={startOver} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <RotateCcw size={14} />
            Start Over
          </button>
        </div>
      </footer>
    </div>
  );
}
