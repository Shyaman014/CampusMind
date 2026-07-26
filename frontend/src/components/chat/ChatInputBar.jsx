import React, { useRef, useState, useEffect } from 'react';
import { Send, X, FileText, Loader2, Paperclip, UploadCloud } from 'lucide-react';
import API from '../../services/api';

export default function ChatInputBar({ onSendMessage, disabled, isTemporary }) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handlePlusClick = () => fileInputRef.current?.click();

  const processFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);
    setUploading(true);
    setUploadError('');

    for (const selectedFile of files) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const res = await API.post('/learning/upload', formData);
        if (res.data.success) {
          setAttachments(prev => [...prev, {
            fileName: res.data.data.fileName,
            fileUrl: res.data.data.fileUrl,
            fileType: res.data.data.fileType,
            extractedText: res.data.data.extractedText || res.data.data.summary || res.data.data.fileName || ''
          }]);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'File upload failed';
        console.error('File upload error:', errorMsg);
        setUploadError(`Failed to upload "${selectedFile.name}": ${errorMsg}`);
        setTimeout(() => setUploadError(''), 7000);
      }
    }
    setUploading(false);
  };

  const handleFileSelected = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragging(true);
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
    if (!disabled && !uploading && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (index) => setAttachments(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || disabled) return;
    onSendMessage(input, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = '24px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-2 sm:px-4 pb-3 sm:pb-4 relative"
    >
      {isDragging && (
        <div className="absolute inset-0 -top-12 z-50 rounded-2xl bg-indigo-950/80 border-2 border-dashed border-indigo-500 backdrop-blur-sm flex items-center justify-center space-x-2 text-white font-bold transition-all shadow-2xl animate-pulse">
          <UploadCloud className="w-6 h-6 text-indigo-400" />
          <span>Drop files here to attach to CampusMind AI</span>
        </div>
      )}

      {uploadError && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 font-medium flex items-center justify-between shadow-sm">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="p-1 min-h-[32px] min-w-[32px] flex items-center justify-center rounded hover:bg-rose-500/30 text-rose-300 hover:text-white smooth-transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-xs text-white">
              <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{att.fileName}</span>
              <button type="button" onClick={() => removeAttachment(idx)} className="p-1 min-h-[28px] min-w-[28px] flex items-center justify-center rounded hover:bg-[#2A2A2A] text-[#A1A1AA] hover:text-white smooth-transition">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`flex items-end rounded-2xl bg-[#1F1F1F] border smooth-transition ${
          isTemporary
            ? 'border-white/20 focus-within:border-white/40'
            : isDragging
            ? 'border-indigo-500 shadow-brandGlow'
            : 'border-[#2A2A2A] focus-within:border-[#3A3A3A]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.doc,.docx,.ppt,.pptx"
          className="hidden"
        />

        <button
          type="button"
          onClick={handlePlusClick}
          disabled={uploading || disabled}
          className="p-2 sm:p-2.5 ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A1A1AA] hover:text-white smooth-transition flex-shrink-0"
          title="Attach PDF, DOCX, PPT, MD, TXT, or Image"
          aria-label="Attach files"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Paperclip className="w-5 h-5" />}
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={uploading ? 'Uploading attachments...' : isTemporary ? 'Message (temporary)…' : 'Message CampusMind AI… (Drag & drop files supported)'}
          className="flex-1 min-w-0 bg-transparent text-[13px] sm:text-[14px] text-white placeholder-[#A1A1AA]/60 py-2.5 sm:py-3 px-1 sm:px-1.5 focus:outline-none resize-none leading-normal max-h-[150px]"
          rows={1}
        />

        <button
          type="submit"
          disabled={(!input.trim() && attachments.length === 0) || disabled || uploading}
          className="p-2 mr-1.5 mb-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white text-[#0B0B0B] disabled:opacity-20 disabled:bg-[#2A2A2A] disabled:text-[#A1A1AA] smooth-transition flex-shrink-0 hover:bg-[#E4E4E7]"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <p className="text-[11px] text-[#A1A1AA]/50 text-center mt-2">
        CampusMind AI can make mistakes. Verify important academic information.
      </p>
    </div>
  );
}
