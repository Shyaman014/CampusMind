import React, { useState, useEffect } from 'react';
import API from '../services/api';
import FileUploadZone from '../components/learning/FileUploadZone';
import FlashcardComponent from '../components/learning/FlashcardComponent';
import QuizComponent from '../components/learning/QuizComponent';
import { Sparkles, BookOpen, Layers, HelpCircle, CheckCircle2, FileText } from 'lucide-react';

export default function LearningLabPage() {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-3xl glass-card border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900 to-indigo-950/20 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-brandGlow">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">AI Study Workspace & Notes Synthesizer</h1>
            <p className="text-xs text-slate-300 mt-1">
              Upload PDF slides or lecture images to automatically generate concise summaries, flashcard decks & practice quizzes.
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
              <span>Your Analyzed Notes</span>
            </h3>

            <div className="space-y-1 max-h-96 overflow-y-auto">
              {uploads.map((up) => (
                <button
                  key={up._id}
                  onClick={() => setSelectedUpload(up)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                    selectedUpload?._id === up._id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{up.fileName}</span>
                  <span className="text-[10px] uppercase font-semibold text-purple-400 ml-1">{up.fileType}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Material Insights */}
          {selectedUpload && (
            <div className="lg:col-span-3 space-y-6">
              
              {/* Document Summary & Key Points */}
              <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span>{selectedUpload.fileName} — Executive Summary</span>
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  {selectedUpload.summary}
                </p>

                {selectedUpload.importantPoints && selectedUpload.importantPoints.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Key Takeaways</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedUpload.importantPoints.map((pt, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Flashcards Deck */}
              <FlashcardComponent flashcards={selectedUpload.flashcards} />

              {/* Assessment Quiz */}
              <QuizComponent quiz={selectedUpload.quiz} />

            </div>
          )}

        </div>
      )}

    </div>
  );
}
