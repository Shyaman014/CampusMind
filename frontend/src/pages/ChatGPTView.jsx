import React, { useState, useEffect, useRef } from 'react';
import API, { API_BASE_URL } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInputBar from '../components/chat/ChatInputBar';
import { User as UserIcon, Copy, Check, FileText, Menu, ThumbsUp, ThumbsDown, Edit2, RotateCcw } from 'lucide-react';
import CampusMindIcon from '../components/ui/CampusMindIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, msg: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, msg: error.toString() }; }
  componentDidCatch(error, info) { /* handled by ui */ }
  render() {
    if (this.state.hasError) return <div className="text-red-400 bg-red-400/10 p-3 rounded-lg text-xs">Render error: {this.state.msg}</div>;
    return this.props.children;
  }
}

const CodeBlock = ({ node, className, children }) => {
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
      <div className="rounded-xl overflow-hidden bg-[#111111] border border-[#2A2A2A] my-3">
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#181818] border-b border-[#2A2A2A]">
          <span className="text-[11px] font-medium text-[#A1A1AA] uppercase">{language}</span>
          <button onClick={handleCopy} className="flex items-center space-x-1 text-[11px] text-[#A1A1AA] hover:text-white smooth-transition">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
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
    <code className="bg-[#2A2A2A]/60 text-white px-1.5 py-0.5 rounded text-[13px]">
      {children}
    </code>
  );
};

export default function ChatGPTView() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchChats = async () => {
    try {
      const res = await API.get('/chats');
      if (res.data.success) setChats(res.data.data);
    } catch (err) { /* silent fail */ }
  };

  useEffect(() => { fetchChats(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, streamingContent]);

  const handleSelectChat = async (chatId) => {
    setIsTemporary(false); setActiveChatId(chatId); setStreamingContent(''); setSidebarOpen(false);
    try {
      const res = await API.get(`/chats/${chatId}`);
      if (res.data.success) setMessages(res.data.data.messages || []);
    } catch (err) { /* silent fail */ }
  };

  const handleNewChat = () => { setActiveChatId(null); setMessages([]); setStreamingContent(''); setSidebarOpen(false); };

  const handleToggleTemporary = () => {
    const next = !isTemporary; setIsTemporary(next); setSidebarOpen(false);
    if (next) { setActiveChatId(null); setMessages([]); }
  };

  const handleDeleteChat = async (chatId) => {
    try { await API.delete(`/chats/${chatId}`); setChats(chats.filter(c => c._id !== chatId)); if (activeChatId === chatId) handleNewChat(); }
    catch (err) { /* silent fail */ }
  };

  const handleClearAllChats = async () => {
    try { for (const chat of chats) await API.delete(`/chats/${chat._id}`); setChats([]); handleNewChat(); }
    catch (err) { /* silent fail */ }
  };

  const handleSendMessage = async (promptText, attachments) => {
    if (isStreaming) return;
    setMessages(prev => [...prev, { role: 'user', content: promptText, attachments: attachments || [] }]);
    setIsStreaming(true); setStreamingContent('');
    await streamResponseToBackend(promptText, attachments);
  };

  const streamResponseToBackend = async (promptText, attachments) => {
    const token = localStorage.getItem('campusmind_token');
    try {
      const streamUrl = API_BASE_URL.endsWith('/api') ? `${API_BASE_URL}/chats/stream` : `${API_BASE_URL}/api/chats/stream`;
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ chatId: isTemporary ? null : activeChatId, message: promptText, attachments }),
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
              else if (data.type === 'end') { setMessages(prev => [...prev, { role: 'assistant', content: currentAIContent }]); setStreamingContent(''); }
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
    if (lastUserMessage) { setMessages(messages.slice(0, spliceIndex)); handleSendMessage(lastUserMessage.content, lastUserMessage.attachments); }
  };

  const submitEdit = (index) => {
    const msg = messages[index]; setMessages(messages.slice(0, index)); setEditingIndex(null);
    handleSendMessage(editValue, msg.attachments);
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="flex h-[calc(100vh-48px)] h-[calc(100dvh-48px)] overflow-hidden bg-[#0B0B0B] text-white">
      <ChatSidebar
        chats={chats} activeChatId={activeChatId} onSelectChat={handleSelectChat}
        onNewChat={handleNewChat} onDeleteChat={handleDeleteChat} onClearAllChats={handleClearAllChats}
        isTemporary={isTemporary} onToggleTemporary={handleToggleTemporary} isOpen={sidebarOpen}
      />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in"
        />
      )}

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        <div className="px-3 py-2 border-b border-[#2A2A2A]/40 flex items-center justify-between md:hidden bg-[#111111]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-1.5 min-w-0">
            <CampusMindIcon size={20} />
            <span className="text-sm font-medium truncate">CampusMind AI</span>
          </div>
          <button onClick={handleNewChat} className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {messages.length === 0 && !streamingContent ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="space-y-4 flex flex-col items-center">
                <CampusMindIcon size={52} animate />
                <h1 className="text-3xl font-semibold text-white tracking-tight">CampusMind AI</h1>
                <p className="text-[#A1A1AA] text-sm tracking-wide">What can I help you learn today?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg px-2 sm:px-0">
                {[
                  'Explain QuickSort time complexity & code',
                  'Summarize OS paging vs segmentation',
                  'Write a React custom hook for API calls',
                  "What is Dijkstra's shortest path algorithm?"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 rounded-xl bg-[#181818] border border-[#2A2A2A] text-left text-[13px] text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F] hover:border-[#3A3A3A] hover:-translate-y-0.5 smooth-transition leading-snug"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5 pb-4">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={idx} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-[#2A2A2A]' : 'bg-[#181818] border border-[#2A2A2A]'
                      }`}>
                      {isUser ? <UserIcon className="w-4 h-4 text-[#A1A1AA]" /> : <CampusMindIcon size={18} />}
                    </div>

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[80%] min-w-0`}>
                      <div className={`px-4 py-3 rounded-2xl ${isUser
                          ? 'bg-[#1F1F1F] text-white rounded-tr-md border border-[#2A2A2A]'
                          : 'bg-[#181818] text-white rounded-tl-md border border-[#2A2A2A]'
                        }`}>
                        {msg.attachments?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {msg.attachments.map((att, aIdx) => (
                              <span key={aIdx} className="inline-flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium bg-[#111111] border border-[#2A2A2A] text-[#A1A1AA]">
                                <FileText className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{att.fileName}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {editingIndex === idx ? (
                          <div className="flex flex-col space-y-2 w-full min-w-[200px] sm:min-w-[280px]">
                            <textarea value={editValue} onChange={e => setEditValue(e.target.value)}
                              className="w-full bg-[#111111] text-white border border-[#2A2A2A] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#3A3A3A] resize-none" rows={3} />
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => setEditingIndex(null)} className="px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-xs hover:bg-[#3A3A3A] smooth-transition">Cancel</button>
                              <button onClick={() => submitEdit(idx)} className="px-3 py-1.5 rounded-lg bg-white text-[#0B0B0B] text-xs hover:bg-[#E4E4E7] smooth-transition">Save & Submit</button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[14px] leading-relaxed">
                            {isUser ? (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            ) : (
                              <ErrorBoundary>
                                <div className="markdown-body">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                              </ErrorBoundary>
                            )}
                          </div>
                        )}
                      </div>

                      {!isStreaming && editingIndex !== idx && (
                        <div className={`flex items-center space-x-0.5 mt-1 ${isUser ? 'mr-0.5' : 'ml-0.5'}`}>
                          {isUser ? (
                            <button onClick={() => { setEditingIndex(idx); setEditValue(msg.content); }}
                              className="p-1 rounded text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-white smooth-transition" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => copyToClipboard(msg.content)} className="p-1 rounded text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-white smooth-transition" title="Copy">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleRegenerate(idx)} className="p-1 rounded text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-white smooth-transition" title="Regenerate">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 rounded text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-green-400 smooth-transition" title="Good">
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 rounded text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-red-400 smooth-transition" title="Bad">
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {streamingContent && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-7 h-7 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                    <CampusMindIcon size={18} animate />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#181818] text-white rounded-tl-md border border-[#2A2A2A] max-w-[88%] sm:max-w-[80%]">
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
              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>

        <ChatInputBar onSendMessage={handleSendMessage} disabled={isStreaming} isTemporary={isTemporary} />
      </div>
    </div>
  );
}
