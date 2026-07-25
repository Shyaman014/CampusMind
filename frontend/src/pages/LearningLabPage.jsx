import React, { useState, useEffect } from 'react';
import API from '../services/api';
import FileUploadZone from '../components/learning/FileUploadZone';
import FlashcardComponent from '../components/learning/FlashcardComponent';
import QuizComponent from '../components/learning/QuizComponent';
import { Sparkles, BookOpen, Layers, HelpCircle, CheckCircle2, FileText, Download, Zap, Award, Bookmark, List } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LearningLabPage() {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detailed'); // 'summary' | 'detailed' | 'short' | 'exam' | 'revision' | 'flashcards' | 'quiz'
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchUploads = async () => {
    try {
      const res = await API.get('/learning/uploads');
      if (res.data.success) {
        setUploads(res.data.data);
        if (res.data.data.length > 0 && !selectedUpload) {
          setSelectedUpload(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch uploads:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUploadSuccess = (newUpload) => {
    setUploads([newUpload, ...uploads]);
    setSelectedUpload(newUpload);
    setActiveTab('detailed');
  };

  const handleExportNotes = (format) => {
    setShowExportMenu(false);
    if (!selectedUpload) return;

    const title = selectedUpload.fileName || 'CampusMind_Study_Notes';
    const notes = selectedUpload.notes || {};
    const contentStr = `# ${title} — AI Study Pack\n\n` +
      `## 📖 Executive Summary\n${selectedUpload.summary || 'N/A'}\n\n---\n\n` +
      `## 📚 Detailed Study Notes\n${notes.detailed || selectedUpload.summary || 'N/A'}\n\n---\n\n` +
      `## ⚡ Short Summary & Quick Takeaways\n${notes.short || 'N/A'}\n\n---\n\n` +
      `## 🎯 Exam Cram & Likely Questions\n${notes.exam || 'N/A'}\n\n---\n\n` +
      `## 🛠️ Revision Cheatsheet\n${notes.revision || 'N/A'}\n`;

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;line-height:1.6;padding:2rem;color:#111;max-width:800px;margin:auto;}h2{color:#4F46E5;border-bottom:2px solid #eee;padding-bottom:0.5rem;margin-top:2rem;}pre{background:#f4f4f4;padding:1rem;border-radius:6px;}</style></head><body>${contentStr.replace(/\n\n/g, '<br/><br/>')}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }

    const mime = format === 'docx' || format === 'txt' ? 'text/plain;charset=utf-8' : 'text/markdown;charset=utf-8';
    const ext = format === 'docx' ? 'txt' : format;
    const blob = new Blob([contentStr], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_StudyPack.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActiveNotesContent = () => {
    if (!selectedUpload) return '';
    const notes = selectedUpload.notes || {};
    switch (activeTab) {
      case 'detailed': return notes.detailed || selectedUpload.summary || 'No detailed notes generated for this document.';
      case 'short': return notes.short || selectedUpload.summary || 'No short summary available.';
      case 'exam': return notes.exam || 'No exam cram study guide generated for this document.';
      case 'revision': return notes.revision || 'No revision cheatsheet generated for this document.';
      default: return selectedUpload.summary || '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl glass-card border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900 to-indigo-950/20 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-brandGlow">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Study Workspace & Notes Synthesizer</h1>
            <p className="text-xs text-slate-300 mt-1">
              Upload lecture PDFs, Word docs, PowerPoint slides, or images to synthesize 4-Tier study notes, flashcards & interactive quizzes.
            </p>
          </div>
        </div>
      </div>

      {/* File Upload Zone */}
      <FileUploadZone onUploadComplete={handleUploadSuccess} />

      {/* Main Material Viewer */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* History / File Selector Sidebar */}
          <div className="lg:col-span-1 glass-card p-4 rounded-2xl border border-slate-800 space-y-3 h-fit">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Your Study Packs ({uploads.length})</span>
            </h3>

            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {uploads.map((up) => (
                <button
                  key={up._id}
                  onClick={() => setSelectedUpload(up)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                    selectedUpload?._id === up._id
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/40 font-bold shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate max-w-[150px]">{up.fileName}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-400 ml-1">{up.fileType}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Material Insights */}
          {selectedUpload && (
            <div className="lg:col-span-3 space-y-6">
              {/* Header bar for document with export */}
              <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span className="text-base font-bold text-white">{selectedUpload.fileName}</span>
                  <span className="text-xs text-slate-400">({selectedUpload.fileType?.toUpperCase()})</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-brandGlow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Study Pack</span>
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#161616] border border-slate-800 shadow-2xl py-1 z-50 animate-fade-in">
                      <button onClick={() => handleExportNotes('md')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white font-medium">Export as Markdown (.md)</button>
                      <button onClick={() => handleExportNotes('txt')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white font-medium">Export as Text (.txt)</button>
                      <button onClick={() => handleExportNotes('docx')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white font-medium">Export as Word (.docx)</button>
                      <button onClick={() => handleExportNotes('pdf')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white font-medium">Print / Save as PDF</button>
                    </div>
                  )}
                </div>
              </div>

              {/* 4-Tier Study Navigation Tabs */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-800/80">
                <button
                  onClick={() => setActiveTab('detailed')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeTab === 'detailed' ? 'bg-purple-600 text-white shadow-brandGlow' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Detailed Notes</span>
                </button>
                <button
                  onClick={() => setActiveTab('short')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeTab === 'short' ? 'bg-purple-600 text-white shadow-brandGlow' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Short Summary</span>
                </button>
                <button
                  onClick={() => setActiveTab('exam')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeTab === 'exam' ? 'bg-purple-600 text-white shadow-brandGlow' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Exam Cram</span>
                </button>
                <button
                  onClick={() => setActiveTab('revision')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeTab === 'revision' ? 'bg-purple-600 text-white shadow-brandGlow' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Revision Cheatsheet</span>
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeTab === 'flashcards' ? 'bg-indigo-600 text-white shadow-brandGlow' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Flashcards ({selectedUpload.flashcards?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-brandGlow' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Practice Quiz ({selectedUpload.quiz?.length || 0})</span>
                </button>
              </div>

              {/* Tab Content Display */}
              {activeTab === 'flashcards' ? (
                <FlashcardComponent flashcards={selectedUpload.flashcards} />
              ) : activeTab === 'quiz' ? (
                <QuizComponent quiz={selectedUpload.quiz} />
              ) : (
                <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span className="capitalize">{activeTab === 'exam' ? 'Exam Cram & Likely Questions' : activeTab === 'revision' ? 'Revision Cheatsheet & Formulas' : `${activeTab} Study Notes`}</span>
                    </h3>
                  </div>

                  <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80 shadow-inner">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {getActiveNotesContent()}
                    </ReactMarkdown>
                  </div>

                  {selectedUpload.importantPoints && selectedUpload.importantPoints.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <List className="w-4 h-4 text-purple-400" />
                        <span>Key Takeaways & Core Concepts</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedUpload.importantPoints.map((pt, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
