import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';

export default function QuizComponent({ quiz }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const handleOptionSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();

  return (
    <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>AI Generated Assessment Quiz</span>
        </div>
        {submitted && (
          <div className="flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">
            <Award className="w-4 h-4" />
            <span>Score: {score} / {quiz.length}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {quiz.map((q, qIdx) => {
          const isCorrect = selectedAnswers[qIdx] === q.correctAnswer;
          return (
            <div key={qIdx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-start space-x-2">
                <span className="text-indigo-400 font-extrabold">{qIdx + 1}.</span>
                <span>{q.question}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  let btnStyle = 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60';

                  if (submitted) {
                    if (optIdx === q.correctAnswer) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected && optIdx !== q.correctAnswer) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(qIdx, optIdx)}
                      className={`p-3 rounded-xl text-xs text-left border transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && optIdx === q.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-1" />
                      )}
                      {submitted && isSelected && optIdx !== q.correctAnswer && (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="font-bold text-indigo-400">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(selectedAnswers).length === 0}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all disabled:opacity-50"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        )}
      </div>

    </div>
  );
}
