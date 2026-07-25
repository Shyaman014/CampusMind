import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, Image as ImageIcon, Sparkles, Loader2, UploadCloud } from 'lucide-react';
import API from '../../services/api';

export default function FileUploadZone({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!loading && e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a study file or lecture slide');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await API.post('/learning/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFile(null);
        if (onUploadComplete) onUploadComplete(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload and analysis failed');
    }
    setLoading(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-8 rounded-3xl glass-card border border-dashed text-center relative overflow-hidden transition-all duration-300 ${
        isDragging
          ? 'border-indigo-400 bg-indigo-950/40 shadow-brandGlow animate-pulse'
          : 'border-indigo-500/40 bg-slate-900/40 hover:border-indigo-500/60'
      }`}
    >
      {isDragging && (
        <div className="absolute inset-0 z-20 bg-indigo-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white font-bold space-y-2">
          <UploadCloud className="w-12 h-12 text-indigo-400 animate-bounce" />
          <span className="text-lg">Drop file here to analyze with CampusMind AI</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
          <UploadIcon className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-white">Upload Lecture Slides, Notes & Documents</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Drag and drop your syllabus PDFs, PowerPoint slides (.ppt, .pptx), Word docs (.docx), Markdown (.md), or lecture images. CampusMind AI will instantly synthesize 4-tier study notes, flashcard decks & practice quizzes.
          </p>
        </div>

        <input
          type="file"
          id="file-upload"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.doc,.docx,.ppt,.pptx"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700 transition-colors shadow-sm"
        >
          {file ? (
            <>
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="max-w-[200px] truncate">{file.name}</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Choose Document or Image</span>
            </>
          )}
        </label>

        {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

        {file && (
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-brandGlow transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Synthesizing 4-Tier Notes & Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize AI Study Deck</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
