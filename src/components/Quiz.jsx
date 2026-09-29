import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';
import { quizSets } from '../data/modules';
import { soundManager } from '../lib/sound';

export default function Quiz({ moduleId, onComplete, onAsk }) {
  const questions = quizSets[moduleId] || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  const questionRef = useRef(null);

  useEffect(() => {
    questionRef.current?.focus();
  }, [index, finished]);

  useEffect(() => {
    setIndex(0); setSelected(null); setScore(0); setFinished(false);
  }, [moduleId]);

  if (!question) return <div className="empty-state"><Icon name="bulb" size={22} /><p>Quiz data is being prepared for this learning bay.</p></div>;

  const choose = (choiceIndex) => {
    if (selected !== null) return;
    setSelected(choiceIndex);
    if (choiceIndex === question.answer) { setScore((value) => value + 1); soundManager.playSuccess(); } else soundManager.playError();
  };

  const next = () => {
    if (index === questions.length - 1) {
      const finalScore = score;
      setFinished(true);
      onComplete?.(finalScore, questions.length);
      soundManager.playComplete();
    } else { setIndex((value) => value + 1); setSelected(null); }
  };

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 67;
    return <div className="quiz-finished" role="status" aria-live="polite" tabIndex="-1" ref={questionRef}><div className="score-orb"><span>{percentage}%</span><small>accuracy</small></div><span className="eyebrow">{passed ? 'CHECKPOINT CLEARED' : 'REVIEW RECOMMENDED'}</span><h3>{passed ? 'Nice work, lab scientist.' : 'Good first pass. Keep exploring.'}</h3><p>You answered {score} of {questions.length} questions correctly. {passed ? 'This checkpoint is marked complete.' : 'Review the simulation and try again to clear the checkpoint.'}</p><div className="quiz-finished-actions"><button className="text-button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setFinished(false); }}>Retry quiz</button><button className="ai-button" onClick={onAsk}><Icon name="chat" size={15} /> Ask AI Tutor</button></div></div>;
  }

  return <div className="quiz-shell">
    <div className="quiz-progress" aria-label={`Question ${index + 1} of ${questions.length}`}><span>QUESTION {String(index + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</span><div role="progressbar" aria-valuemin="0" aria-valuemax={questions.length} aria-valuenow={index + 1}><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div></div>
    <h3 ref={questionRef} tabIndex="-1">{question.question}</h3>
    <div className="answer-list" role="group" aria-label="Answer choices">{question.choices.map((choice, choiceIndex) => {
      const isSelected = selected === choiceIndex;
      const isCorrect = selected !== null && choiceIndex === question.answer;
      return <button key={choice} type="button" aria-label={choice} disabled={selected !== null} aria-pressed={isSelected} className={`answer-choice ${isSelected ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''}`} onClick={() => choose(choiceIndex)}><span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span>{isCorrect && <Icon name="check" size={16} aria-hidden="true" />}</button>;
    })}</div>
    {selected !== null && <div className={`quiz-feedback ${selected === question.answer ? 'correct' : 'incorrect'}`} role="status" aria-live="polite"><div className="feedback-icon"><Icon name={selected === question.answer ? 'check' : 'info'} size={15} /></div><div><strong>{selected === question.answer ? 'Correct signal.' : 'Not quite.'}</strong><p>{question.explanation}</p></div></div>}
    {selected !== null && <button className="next-question" onClick={next}>{index === questions.length - 1 ? 'See result' : 'Next question'} <Icon name="arrow" size={16} /></button>}
  </div>;
}
