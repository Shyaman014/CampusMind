import React, { useState } from 'react';
import { Sparkles, HelpCircle, RefreshCw, Zap } from 'lucide-react';
import API from '../../services/api';

export default function AIAnswerBox({ initialAnswer, questionTitle, questionContent }) {
  const [explanationLevel, setExplanationLevel] = useState(initialAnswer?.explanationLevel || 'standard');
  const [content, setContent] = useState(initialAnswer?.content || '');
  const [loading, setLoading] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState([]);

  const handleLevelChange = async (level) => {
    setExplanationLevel(level);
    setLoading(true);
    try {
      const res = await API.post('/ai/explain', {
        title: questionTitle,
        content: questionContent,
        explanationLevel: level,
      });
      if (res.data.success) {
        setContent(res.data.data.explanation);
        if (res.data.data.relatedQuestions) {
          setRelatedQuestions(res.data.data.relatedQuestions);
        }
      }
    } catch (error) {
      console.error('Failed to change explanation level:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 rounded-2xl glass-card border border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-purple-950/20 relative overflow-hidden shadow-2xl">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-indigo-500/20 pb-4">
        
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-brandGlow">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-extrabold text-white">CampusMind AI Explanation</h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                Gemini 1.5 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">Instant AI concept breakdown & step-by-step guidance</p>
          </div>
        </div>

        {/* Level Toggle Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 self-start sm:self-auto">
          {['beginner', 'standard', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              disabled={loading}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                explanationLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

      </div>

      {/* Answer Content */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Generating {explanationLevel} level explanation with Gemini AI...</p>
        </div>
      ) : (
        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans mb-6 overflow-x-auto break-words min-w-0">
          {content || 'AI response is loading...'}
        </div>
      )}

      {/* Related Questions */}
      {relatedQuestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-indigo-500/20">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Recommended Follow-up Questions to Study</span>
          </div>
          <div className="space-y-2">
            {relatedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2 hover:border-indigo-500/40 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
