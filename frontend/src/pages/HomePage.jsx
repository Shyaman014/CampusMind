import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import QuestionCard from '../components/questions/QuestionCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Sidebar from '../components/layout/Sidebar';
import { Sparkles, TrendingUp, Clock, Eye, PlusCircle, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const subjectFilter = searchParams.get('subject') || '';
  const tagFilter = searchParams.get('tag') || '';
  const [sortBy, setSortBy] = useState('latest'); // latest, upvotes, views

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let url = `/questions?sortBy=${sortBy}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (subjectFilter) url += `&subject=${encodeURIComponent(subjectFilter)}`;
      if (tagFilter) url += `&tag=${encodeURIComponent(tagFilter)}`;

      const res = await API.get(url);
      if (res.data.success) {
        setQuestions(res.data.data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, subjectFilter, tagFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Welcome Banner */}
      <div className="p-8 rounded-3xl glass-card border border-indigo-500/30 mb-8 bg-gradient-to-r from-indigo-900/30 via-slate-900 to-purple-900/30 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Campus Doubt Solver</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Ask Doubts. Get <span className="gradient-text">Instant AI Solutions</span> & Senior Mentorship.
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Collaborate with senior students, earn reputation points, and upload lecture PDFs for instant AI flashcards and quiz summaries.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              to="/ask"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-brandGlow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ask a Doubt Now</span>
            </Link>
            <Link
              to="/learning"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Upload PDF Notes</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed Container */}
        <div className="flex-1 space-y-6">
          
          {/* Feed Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Campus Doubts Feed</span>
                {subjectFilter && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Subject: {subjectFilter}
                  </span>
                )}
                {tagFilter && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    #{tagFilter}
                  </span>
                )}
              </h2>
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 self-start sm:self-auto text-xs">
              <button
                onClick={() => setSortBy('latest')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  sortBy === 'latest' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>
              <button
                onClick={() => setSortBy('upvotes')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  sortBy === 'upvotes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Top Upvoted</span>
              </button>
              <button
                onClick={() => setSortBy('views')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  sortBy === 'views' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Most Viewed</span>
              </button>
            </div>
          </div>

          {/* Question List or Skeleton Loader */}
          {loading ? (
            <SkeletonLoader count={4} />
          ) : questions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No doubts found</h3>
              <p className="text-xs text-slate-400">Be the first student to post a doubt in this topic!</p>
              <Link
                to="/ask"
                className="inline-block px-4 py-2 rounded-full text-xs font-bold bg-indigo-600 text-white mt-2"
              >
                Ask a Doubt
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard key={q._id} question={q} onVoteUpdate={fetchQuestions} />
              ))}
            </div>
          )}

        </div>

        {/* Sidebar */}
        <Sidebar />

      </div>

    </div>
  );
}
