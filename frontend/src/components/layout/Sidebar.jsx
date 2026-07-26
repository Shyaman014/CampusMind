import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Tag as TagIcon, 
  Sparkles, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';

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

const POPULAR_TAGS = ['dsa', 'react', 'python', 'sql', 'system-design', 'operating-systems', 'networking', 'cpp'];

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubject = searchParams.get('subject');
  const activeTag = searchParams.get('tag');

  const handleSubjectClick = (subj) => {
    if (activeSubject === subj) {
      searchParams.delete('subject');
    } else {
      searchParams.set('subject', subj);
    }
    setSearchParams(searchParams);
  };

  const handleTagClick = (tag) => {
    if (activeTag === tag) {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };

  return (
    <aside className="w-full lg:w-64 space-y-6">
      
      {/* AI Learning Banner */}
      <div className="p-4 rounded-2xl glass-card border border-indigo-500/30 relative overflow-hidden bg-gradient-to-br from-indigo-900/30 to-purple-900/30">
        <div className="flex items-center space-x-2 text-indigo-400 mb-2">
          <Zap className="w-4 h-4 fill-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Study Workspace</span>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Have Lecture PDFs or Slides?</h4>
        <p className="text-xs text-slate-400 mb-3">Upload your materials to generate instant flashcards, quizzes & summaries.</p>
        <Link
          to="/learning"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all w-full justify-center shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Lab</span>
        </Link>
      </div>

      {/* Subject Filter List */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800">
        <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs uppercase tracking-wider mb-3">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Academic Subjects</span>
        </div>
        <ul className="space-y-1">
          {SUBJECTS.map((subj) => {
            const isSelected = activeSubject === subj;
            return (
              <li key={subj}>
                <button
                  onClick={() => handleSubjectClick(subj)}
                  className={`w-full text-left px-3 py-2 min-h-[36px] rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{subj}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-1" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Popular Tags */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800">
        <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs uppercase tracking-wider mb-3">
          <TagIcon className="w-4 h-4 text-purple-400" />
          <span>Popular Tags</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
}
