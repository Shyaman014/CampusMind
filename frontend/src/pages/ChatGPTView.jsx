import React, { useState, useEffect, useRef } from 'react';
import API, { API_BASE_URL } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInputBar from '../components/chat/ChatInputBar';
import { Copy, Check, FileText, Menu, ThumbsUp, ThumbsDown, Edit2, RotateCcw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import BrandLogo from '../components/ui/BrandLogo';
import UserAvatar from '../components/ui/UserAvatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useAuth } from '../context/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, msg: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, msg: error.toString() }; }
  componentDidCatch(_error, _info) { }
  render() {
    if (this.state.hasError) return <div className="text-red-400 bg-red-400/10 p-3 rounded-lg text-xs">Render error: {this.state.msg}</div>;
    return this.props.children;
  }
}

const CodeBlock = ({ node: _node, className, children }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const isBlock = match || String(children).includes('\n');
  const language = match ? match[1] : 'text';

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isBlock) {
    return (
      <div className="rounded-xl overflow-hidden bg-[#111111] border border-[#2A2A2A] my-3 shadow-md">
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#181818] border-b border-[#2A2A2A]">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">{language}</span>
          <button onClick={handleCopy} className="flex items-center space-x-1 text-[11px] text-[#A1A1AA] hover:text-white smooth-transition">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, padding: '0.875rem 1rem', background: 'transparent', fontSize: '13px' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-[#2A2A2A]/60 text-indigo-300 px-1.5 py-0.5 rounded text-[13px] font-mono font-semibold">
      {children}
    </code>
  );
};

export default function ChatGPTView() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const [versionIndices, setVersionIndices] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchChats = async () => {
    try {
      const res = await API.get('/chats');
      if (res.data.success) setChats(res.data.data);
    } catch (err) { }
  };

  useEffect(() => { fetchChats(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, streamingContent]);

  const handleSelectChat = async (chatId) => {
    setIsTemporary(false); setActiveChatId(chatId); setStreamingContent(''); setSidebarOpen(false);
    try {
      const res = await API.get(`/chats/${chatId}`);
      if (res.data.success) {
        const chatData = res.data.data;
        setMessages(chatData.messages || []);
      }
    } catch (err) { }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setStreamingContent('');
    setSidebarOpen(false);
  };

  const handleToggleTemporary = () => {
    const next = !isTemporary; setIsTemporary(next); setSidebarOpen(false);
    if (next) { setActiveChatId(null); setMessages([]); }
  };

  const handleDeleteChat = async (chatId) => {
    try { await API.delete(`/chats/${chatId}`); setChats(chats.filter(c => c._id !== chatId)); if (activeChatId === chatId) handleNewChat(); }
    catch (err) { }
  };

  const handleClearAllChats = async () => {
    try { for (const chat of chats) await API.delete(`/chats/${chat._id}`); setChats([]); handleNewChat(); }
    catch (err) { }
  };

  const handleToggleFavorite = async (chatId) => {
    try {
      const res = await API.patch(`/chats/${chatId}/favorite`);
      if (res.data.success) {
        setChats(chats.map(c => c._id === chatId ? { ...c, isFavorite: res.data.data.isFavorite } : c));
      }
    } catch (err) { }
  };

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      const res = await API.patch(`/chats/${chatId}/rename`, { title: newTitle });
      if (res.data.success) {
        setChats(chats.map(c => c._id === chatId ? { ...c, title: res.data.data.title } : c));
      }
    } catch (err) { }
  };

  const handleDuplicateChat = async (chatId) => {
    try {
      const res = await API.post(`/chats/${chatId}/duplicate`);
      if (res.data.success) {
        setChats([res.data.data, ...chats]);
      }
    } catch (err) { }
  };

  const handleArchiveChat = async (chatId) => {
    try {
      const res = await API.patch(`/chats/${chatId}/archive`);
      if (res.data.success) {
        setChats(chats.map(c => c._id === chatId ? { ...c, isArchived: res.data.data.isArchived } : c));
      }
    } catch (err) { }
  };

  const handleSendMessage = async (promptText, attachments, sliceIndex = null) => {
    if (isStreaming) return;
    if (sliceIndex !== null) {
      setMessages(prev => [...prev.slice(0, sliceIndex), { role: 'user', content: promptText, attachments: attachments || [] }]);
    } else {
      setMessages(prev => [...prev, { role: 'user', content: promptText, attachments: attachments || [] }]);
    }
    setIsStreaming(true); setStreamingContent('');
    await streamResponseToBackend(promptText, attachments, sliceIndex);
  };

  const streamResponseToBackend = async (promptText, attachments, sliceIndex = null) => {
    const token = localStorage.getItem('campusmind_token');
    try {
      const streamUrl = API_BASE_URL.endsWith('/api') ? `${API_BASE_URL}/chats/stream` : `${API_BASE_URL}/api/chats/stream`;
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ chatId: isTemporary ? null : activeChatId, message: promptText, attachments, sliceIndex, mode: 'general' }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let currentAIContent = '', sseBuffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n\n');
        sseBuffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.type === 'start') { if (!isTemporary && data.chatId && data.chatId !== activeChatId) { setActiveChatId(data.chatId); fetchChats(); } }
              else if (data.type === 'chunk') { currentAIContent += data.text; setStreamingContent(currentAIContent); }
              else if (data.type === 'end') {
                if (data.messages && Array.isArray(data.messages)) {
                  setMessages(data.messages);
                } else {
                  setMessages(prev => [...prev, { role: 'assistant', content: currentAIContent, versions: [{ content: currentAIContent }] }]);
                }
                setStreamingContent('');
              }
              else if (data.type === 'error') { setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${data.message}` }]); setStreamingContent(''); }
            } catch { }
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${err.message}` }]);
      setStreamingContent('');
    }
    setIsStreaming(false);
  };

  const handleRegenerate = (index) => {
    let lastUserMessage = null, spliceIndex = index;
    for (let i = index - 1; i >= 0; i--) { if (messages[i].role === 'user') { lastUserMessage = messages[i]; spliceIndex = i; break; } }
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content, lastUserMessage.attachments, spliceIndex);
    }
  };

  const submitEdit = (index) => {
    const msg = messages[index];
    setEditingIndex(null);
    handleSendMessage(editValue, msg.attachments, index);
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleMessageFeedback = async (msgId, idx, feedbackType) => {
    if (!activeChatId || !msgId) return;
    try {
      const res = await API.post(`/chats/${activeChatId}/messages/${msgId}/feedback`, { feedback: feedbackType });
      if (res.data.success) {
        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, feedback: feedbackType } : m));
      }
    } catch (err) { }
  };

  const switchVersion = (msgIdx, direction) => {
    const msg = messages[msgIdx];
    if (!msg || !msg.versions || msg.versions.length <= 1) return;
    const currentIdx = versionIndices[msgIdx] || (msg.versions.length - 1);
    const newIdx = Math.max(0, Math.min(msg.versions.length - 1, currentIdx + direction));
    setVersionIndices({ ...versionIndices, [msgIdx]: newIdx });
  };

  const handleExport = (format) => {
    setShowExportMenu(false);
    const chatTitle = chats.find(c => c._id === activeChatId)?.title || 'CampusMind_Chat';
    let contentStr = `# ${chatTitle}\n\n`;
    messages.forEach(m => {
      contentStr += `### ${m.role === 'user' ? 'User' : 'CampusMind AI'}\n${m.content}\n\n---\n\n`;
    });

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<html><head><title>${chatTitle}</title><style>body{font-family:sans-serif;line-height:1.6;padding:2rem;color:#111;max-width:800px;margin:auto;}pre{background:#f4f4f4;padding:1rem;border-radius:6px;overflow-x:auto;}h3{color:#4F46E5;border-bottom:1px solid #ddd;padding-bottom:0.5rem;}</style></head><body>${contentStr.replace(/\n\n/g, '<br/><br/>')}</body></html>`);
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
    a.download = `${chatTitle.replace(/\s+/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-56px)] h-[calc(100dvh-56px)] overflow-hidden bg-[#0B0B0B] text-white">
      <ChatSidebar
        chats={chats} activeChatId={activeChatId} onSelectChat={handleSelectChat}
        onNewChat={() => handleNewChat()} onDeleteChat={handleDeleteChat} onClearAllChats={handleClearAllChats}
        onToggleFavorite={handleToggleFavorite} onRenameChat={handleRenameChat} onDuplicateChat={handleDuplicateChat} onArchiveChat={handleArchiveChat}
        isTemporary={isTemporary} onToggleTemporary={handleToggleTemporary} isOpen={sidebarOpen}
      />

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in" />
      )}

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Header Bar */}
        <div className="px-4 py-3 border-b border-[#2A2A2A] bg-[#111111] flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2.5">
              <span className="text-[15px] font-bold text-white tracking-tight">CampusMind AI</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[11px] font-bold border border-indigo-500/20 uppercase tracking-wider">v2.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {messages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222] text-xs font-semibold text-slate-200 border border-[#2A2A2A] transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export</span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#161616] border border-[#2A2A2A] shadow-2xl py-1 z-50 animate-fade-in">
                    <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#222] hover:text-white">Export as Markdown (.md)</button>
                    <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#222] hover:text-white">Export as Text (.txt)</button>
                    <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#222] hover:text-white">Export as Word (.docx)</button>
                    <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#222] hover:text-white">Print / Save as PDF</button>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => handleNewChat()} className="p-2 rounded-xl bg-[#181818] hover:bg-[#222] text-[#A1A1AA] hover:text-white border border-[#2A2A2A] shadow-sm transition-colors" title="New Chat">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {messages.length === 0 && !streamingContent ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="space-y-5 flex flex-col items-center">
                <BrandLogo size={64} iconSize={40} animate />
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  CampusMind AI v2.0
                </h1>
                <p className="text-[#A1A1AA] text-sm max-w-md mx-auto leading-relaxed">
                  Your state-of-the-art AI academic assistant, code analyzer, and research companion.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg px-2 sm:px-0">
                {[
                  'Explain QuickSort time complexity & code',
                  'Summarize OS paging vs segmentation',
                  'Write a React custom hook for API calls',
                  "What is Dijkstra's shortest path algorithm?"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 rounded-2xl bg-[#181818] border border-[#2A2A2A] text-left text-[13px] text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F] hover:border-[#3A3A3A] hover:-translate-y-0.5 smooth-transition leading-snug shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 pb-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const versions = msg.versions || [{ content: msg.content }];
                const currentVerIdx = versionIndices[idx] !== undefined ? versionIndices[idx] : (versions.length - 1);
                const displayContent = versions[currentVerIdx]?.content || msg.content;

                return (
                  <div key={idx} className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
                    {isUser ? (
                      <UserAvatar user={user} className="w-8 h-8 text-xs font-bold" rounded="rounded-full" />
                    ) : (
                      <BrandLogo size={32} iconSize={20} />
                    )}

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[80%] min-w-0`}>
                      <div className={`shadow-md ${
                        isUser
                          ? 'px-5 py-4 bg-[#1F1F1F] text-white rounded-3xl rounded-tr-sm border border-[#2A2A2A]'
                          : 'px-6 py-5 bg-[#181818] text-white rounded-3xl rounded-tl-sm border border-[#2A2A2A]'
                      }`}>
                        {msg.attachments?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {msg.attachments.map((att, aIdx) => (
                              <span key={aIdx} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#111111] border border-[#2A2A2A] text-indigo-300">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[140px]">{att.fileName}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {editingIndex === idx ? (
                          <div className="flex flex-col space-y-2.5 w-full min-w-[220px] sm:min-w-[300px]">
                            <textarea
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="w-full bg-[#111111] text-white border border-[#3A3A3A] rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                              rows={4}
                            />
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => setEditingIndex(null)} className="px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-xs hover:bg-[#3A3A3A] transition-all">Cancel</button>
                              <button onClick={() => submitEdit(idx)} className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-brandGlow transition-all">Save & Regenerate</button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[14px] leading-relaxed">
                            {isUser ? (
                              <div className="whitespace-pre-wrap font-sans">{displayContent}</div>
                            ) : (
                              <ErrorBoundary>
                                <div className="markdown-body">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                                    {displayContent}
                                  </ReactMarkdown>
                                </div>
                              </ErrorBoundary>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Bar under Message */}
                      {!isStreaming && editingIndex !== idx && (
                        <div className={`flex items-center space-x-2 mt-2.5 text-xs text-[#A1A1AA] ${isUser ? 'mr-1' : 'ml-1'}`}>
                          {isUser ? (
                            <button onClick={() => { setEditingIndex(idx); setEditValue(msg.content); }} className="flex items-center space-x-1 p-1 rounded hover:text-white transition-colors" title="Edit prompt & regenerate">
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {/* Version History navigation */}
                              {versions.length > 1 && (
                                <div className="flex items-center space-x-1 bg-[#181818] px-2 py-0.5 rounded-md border border-[#2A2A2A]">
                                  <button onClick={() => switchVersion(idx, -1)} disabled={currentVerIdx === 0} className="hover:text-white disabled:opacity-30">
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[10px] font-bold text-slate-300">{currentVerIdx + 1} / {versions.length}</span>
                                  <button onClick={() => switchVersion(idx, 1)} disabled={currentVerIdx === versions.length - 1} className="hover:text-white disabled:opacity-30">
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              <button onClick={() => copyToClipboard(displayContent, idx)} className="flex items-center space-x-1 p-1 rounded hover:text-white transition-colors" title="Copy response">
                                {copiedMsgIdx === idx ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedMsgIdx === idx && <span className="text-green-400 font-semibold">Copied!</span>}
                              </button>
                              
                              <button onClick={() => handleRegenerate(idx)} className="flex items-center space-x-1 p-1 rounded hover:text-white transition-colors" title="Regenerate response">
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Regenerate</span>
                              </button>

                              <button
                                onClick={() => handleMessageFeedback(msg._id, idx, msg.feedback === 'like' ? null : 'like')}
                                className={`p-1 rounded transition-colors ${msg.feedback === 'like' ? 'text-green-400 opacity-100 font-bold' : 'hover:text-green-400'}`}
                                title="Helpful"
                              >
                                <ThumbsUp className={`w-3.5 h-3.5 ${msg.feedback === 'like' ? 'fill-green-400' : ''}`} />
                              </button>

                              <button
                                onClick={() => handleMessageFeedback(msg._id, idx, msg.feedback === 'dislike' ? null : 'dislike')}
                                className={`p-1 rounded transition-colors ${msg.feedback === 'dislike' ? 'text-rose-400 opacity-100 font-bold' : 'hover:text-rose-400'}`}
                                title="Not Helpful"
                              >
                                <ThumbsDown className={`w-3.5 h-3.5 ${msg.feedback === 'dislike' ? 'fill-rose-400' : ''}`} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {streamingContent && (
                <div className="flex items-start gap-4 animate-fade-in">
                  <BrandLogo size={32} iconSize={20} animate />
                  <div className="px-6 py-5 rounded-3xl bg-[#181818] text-white rounded-tl-sm border border-[#2A2A2A] max-w-[88%] sm:max-w-[80%] shadow-md">
                    <div className="text-[14px] leading-relaxed">
                      <ErrorBoundary>
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                            {streamingContent}
                          </ReactMarkdown>
                        </div>
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        <ChatInputBar onSendMessage={handleSendMessage} disabled={isStreaming} isTemporary={isTemporary} />
      </div>
    </div>
  );
}
