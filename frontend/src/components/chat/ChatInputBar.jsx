import React, { useRef, useState, useEffect } from 'react';
import { Send, X, FileText, Loader2, Paperclip, UploadCloud } from 'lucide-react';
import API from '../../services/api';

export default function ChatInputBar({ onSendMessage, disabled, isTemporary }) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

    for (const selectedFile of files) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const res = await API.post('/learning/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.success) {
          setAttachments(prev => [...prev, {
            fileName: res.data.data.fileName,
            fileUrl: res.data.data.fileUrl,
            fileType: res.data.data.fileType,
            extractedText: res.data.data.summary || ''
          }]);
        }
      } catch (err) {
        console.error('File upload fallback:', err);
        setAttachments(prev => [...prev, { fileName: selectedFile.name, fileUrl: '', fileType: selectedFile.type }]);
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
      className="w-full max-w-3xl mx-auto px-2 sm:px-4 pb-3 sm:pb-4 relative"
    >
      {isDragging && (
        <div className="absolute inset-0 -top-12 z-50 rounded-2xl bg-indigo-950/80 border-2 border-dashed border-indigo-500 backdrop-blur-sm flex items-center justify-center space-x-2 text-white font-bold transition-all shadow-2xl animate-pulse">
          <UploadCloud className="w-6 h-6 text-indigo-400" />
          <span>Drop files here to attach to CampusMind AI</span>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#181818] border border-[#2A2A2A] text-xs text-white">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{att.fileName}</span>
              <button type="button" onClick={() => removeAttachment(idx)} className="p-0.5 rounded hover:bg-[#2A2A2A] text-[#A1A1AA] hover:text-white smooth-transition">
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
          className="p-2 sm:p-2.5 ml-1 text-[#A1A1AA] hover:text-white smooth-transition flex-shrink-0"
          title="Attach PDF, DOCX, PPT, MD, TXT, or Image"
        >
          {uploading ? <Loader2 className="w-[18px] h-[18px] animate-spin text-indigo-400" /> : <Paperclip className="w-[18px] h-[18px]" />}
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={uploading ? 'Uploading attachments...' : isTemporary ? 'Message (temporary)…' : 'Message CampusMind AI… (Drag & drop files supported)'}
          className="flex-1 min-w-0 bg-transparent text-[13px] sm:text-[14px] text-white placeholder-[#A1A1AA]/60 py-2 sm:py-2.5 px-1 sm:px-1.5 focus:outline-none resize-none leading-normal max-h-[150px]"
          rows={1}
        />

        <button
          type="submit"
          disabled={(!input.trim() && attachments.length === 0) || disabled || uploading}
          className="p-2 mr-1.5 mb-1 rounded-xl bg-white text-[#0B0B0B] disabled:opacity-20 disabled:bg-[#2A2A2A] disabled:text-[#A1A1AA] smooth-transition flex-shrink-0 hover:bg-[#E4E4E7]"
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
