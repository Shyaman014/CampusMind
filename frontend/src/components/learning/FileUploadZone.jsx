import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import API from '../../services/api';

export default function FileUploadZone({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or Image file');
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
    <div className="p-8 rounded-3xl glass-card border border-dashed border-indigo-500/40 text-center bg-slate-900/40 relative overflow-hidden">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <UploadIcon className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-white">Upload Study Notes or Lecture PDFs</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Drag and drop your syllabus slides, PDF notes, or lecture images. CampusMind AI will instantly synthesize flashcards, quizzes, and key takeaways.
          </p>
        </div>

        <input
          type="file"
          id="file-upload"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border border-slate-700 transition-colors"
        >
          {file ? (
            <>
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>{file.name}</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Choose PDF / Image File</span>
            </>
          )}
        </label>

        {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

        {file && (
          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-brandGlow transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing Material...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Flashcards & Quiz</span>
                </>
              )}
            </button>
          </div>
        )}

      </form>

    </div>
  );
}
