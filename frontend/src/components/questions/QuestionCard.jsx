import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import API from '../../services/api';

export default function QuestionCard({ question, onVoteUpdate }) {
  const [upvotes, setUpvotes] = useState(question.upvotes || 0);
  const [userVoted, setUserVoted] = useState(false);

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await API.post(`/questions/${question._id}/vote`, { voteType: 1 });
      if (res.data.success) {
        setUpvotes(res.data.data.upvotes);
        setUserVoted(!userVoted);
        if (onVoteUpdate) onVoteUpdate();
      }
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const authorName = question.isAnonymous ? 'Anonymous Student' : (question.author?.name || 'Campus Student');
  const authorAvatar = question.isAnonymous
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    : (question.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');

  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 group hover:shadow-xl">
      
      {/* Header: Author & Metadata */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-9 h-9 rounded-full object-cover border border-indigo-500/30"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-200">{authorName}</span>
              {!question.isAnonymous && question.author?.role === 'senior' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  Senior Scholar
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {new Date(question.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {question.subject}
            </p>
          </div>
        </div>

        {/* Badges: AI Answered / Resolved */}
        <div className="flex items-center space-x-2">
          {question.isResolved && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solved</span>
            </span>
          )}
          {question.aiAnswered && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Answered</span>
            </span>
          )}
        </div>
      </div>

      {/* Question Title & Content Preview */}
      <Link to={`/questions/${question._id}`} className="block space-y-2 group">
        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {question.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {question.content}
        </p>
      </Link>

      {/* Tags & Action Bar */}
      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {question.tags && question.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats: Upvotes, Answers, Views */}
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <button
            onClick={handleVote}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
              userVoted ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-indigo-400'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="font-semibold">{upvotes}</span>
          </button>

          <Link
            to={`/questions/${question._id}`}
            className="flex items-center space-x-1 hover:text-indigo-400 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Answers</span>
          </Link>

          <div className="flex items-center space-x-1 text-slate-500">
            <Eye className="w-3.5 h-3.5" />
            <span>{question.views || 0}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
