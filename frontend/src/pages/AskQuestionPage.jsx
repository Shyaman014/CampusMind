import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { HelpCircle, Tag as TagIcon, BookOpen, EyeOff, Send, AlertCircle } from 'lucide-react';

const SUBJECTS = [
  'General Computer Science',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Computer Networks',
  'Database Management Systems',
  'Machine Learning & AI',
  'Web Development',
  'Software Engineering',
];

export default function AskQuestionPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [tagsInput, setTagsInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and detailed question explanation');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/questions', {
        title,
        content,
        subject,
        tags: tags.length > 0 ? tags : ['General'],
        isAnonymous,
      });

      if (res.data.success) {
        navigate(`/questions/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <div className="p-8 rounded-3xl glass-card border border-indigo-500/30 space-y-6 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/20 shadow-2xl">
        
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-brandGlow">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Ask an Academic Doubt</h1>
            <p className="text-xs text-slate-400">Receive instant AI explanations & peer support from seniors (+5 Rep)</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Question Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Doubt Title / Question Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. How does QuickSort handle duplicate elements, and why is pivot selection critical?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Subject & Anonymous Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Academic Subject *</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <EyeOff className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Post Anonymously</span>
              </label>
            </div>
          </div>

          {/* Details Content */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Detailed Explanation & Code / Context *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Describe your current logic, what you've tried so far, sample test inputs, formulas, or code snippets..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center space-x-1">
              <TagIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Tags (Comma Separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. dsa, sorting, quicksort, algorithms"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-8 py-3 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-brandGlow transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Posting & Requesting AI Explanation...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Doubt</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
