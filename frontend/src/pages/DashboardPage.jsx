import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  HelpCircle, 
  MessageSquare, 
  CheckCircle2, 
  Flame, 
  TrendingUp,
  Camera,
  Edit2,
  Loader2,
  Check,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard/student');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        // silent fail
      }
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#A1A1AA] text-sm">Loading dashboard...</div>;
  }

  const { analytics, userQuestions, reputationHistory } = data || {};

  const handleAvatarClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      setIsUploading(true);
      try {
        const uploadRes = await API.post('/learning/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (uploadRes.data.success) {
          const fileUrl = uploadRes.data.data.fileUrl;
          const profileRes = await API.put('/auth/profile', { avatar: fileUrl });
          if (profileRes.data.success) {
            setUser(profileRes.data.data);
          }
        }
      } catch (err) {
        // silent fail
        alert('Failed to update profile photo.');
      }
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleNameSave = async () => {
    if (!editNameValue.trim() || editNameValue.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }
    
    try {
      const profileRes = await API.put('/auth/profile', { name: editNameValue.trim() });
      if (profileRes.data.success) {
        setUser(profileRes.data.data);
      }
    } catch (err) {
      // silent fail
      alert('Failed to update name.');
    }
    setIsEditingName(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white min-h-screen bg-transparent">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl bg-[#171717] border border-[#2A2A2A] shadow-sm hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center space-x-6 w-full md:w-auto">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <div className={`transition-all duration-200 ${isUploading ? 'opacity-50' : 'group-hover:opacity-75'}`}>
              <UserAvatar user={user} className="w-24 h-24 text-3xl font-extrabold" rounded="rounded-full" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
              {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-1.5">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    autoFocus
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); else if (e.key === 'Escape') setIsEditingName(false); }}
                    className="px-2 py-1 bg-[#1F1F1F] border border-[#3A3A3A] rounded-lg text-white text-xl font-semibold focus:outline-none focus:border-white w-48"
                  />
                  <button onClick={handleNameSave} className="p-1 rounded bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30 smooth-transition"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setIsEditingName(false)} className="p-1 rounded bg-red-400/20 text-red-400 hover:bg-red-400/30 smooth-transition"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => { setEditNameValue(user?.name || ''); setIsEditingName(true); }}>
                  <h1 className="text-2xl font-semibold text-white tracking-tight truncate">{user?.name}</h1>
                  <Edit2 className="w-4 h-4 text-[#A1A1AA] opacity-0 group-hover:opacity-100 smooth-transition" />
                </div>
              )}
              {!isEditingName && (
                <span className="flex-shrink-0 px-2.5 py-0.5 rounded-md bg-[#1F1F1F] text-[#A1A1AA] text-[11px] font-medium border border-[#2A2A2A] uppercase tracking-wider">
                  {user?.role}
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#A1A1AA]">{user?.department} • {user?.yearOfStudy}</p>
            <p className="text-[13px] text-[#A1A1AA] mt-0.5 truncate">"{user?.bio || 'Campus Mind Student'}"</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none px-3 sm:px-6 py-4 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] text-center min-w-[100px] sm:min-w-[120px]">
            <span className="text-2xl font-semibold text-[#22C55E] block">{analytics?.reputation || 10}</span>
            <span className="text-[10px] font-medium text-[#A1A1AA] uppercase tracking-wider mt-1 block">Reputation</span>
          </div>
          <div className="flex-1 md:flex-none px-3 sm:px-6 py-4 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] text-center min-w-[100px] sm:min-w-[120px]">
            <div className="flex items-center justify-center space-x-1 sm:space-x-1.5 text-xl sm:text-2xl font-semibold text-[#F59E0B]">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-[#F59E0B]" />
              <span>{analytics?.streakDays || 1}d</span>
            </div>
            <span className="text-[10px] font-medium text-[#A1A1AA] uppercase tracking-wider mt-1 block">Streak</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#171717] border border-[#2A2A2A] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="text-xs font-medium uppercase tracking-wider">Doubts Asked</span>
            <HelpCircle className="w-4 h-4 text-[#A1A1AA]" />
          </div>
          <p className="text-3xl font-semibold text-white">{analytics?.questionsCount || 0}</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#171717] border border-[#2A2A2A] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="text-xs font-medium uppercase tracking-wider">Answers Provided</span>
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-semibold text-white">{analytics?.answersCount || 0}</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#171717] border border-[#2A2A2A] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="text-xs font-medium uppercase tracking-wider">Accepted Solutions</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <p className="text-3xl font-semibold text-white">{analytics?.acceptedAnswersCount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Doubts & Questions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2 px-1">
            <HelpCircle className="w-4 h-4 text-[#A1A1AA]" />
            <span>Your Doubts & Questions</span>
          </h3>
          <div className="space-y-3">
            {userQuestions && userQuestions.length > 0 ? (
              userQuestions.map((q) => (
                <Link
                  key={q._id}
                  to={`/questions/${q._id}`}
                  className="block p-4 rounded-2xl bg-[#171717] border border-[#2A2A2A] hover:bg-[#1F1F1F] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-white truncate pr-4">{q.title}</p>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border ${
                      q.isResolved 
                        ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' 
                        : 'bg-[#1F1F1F] text-[#A1A1AA] border-[#2A2A2A]'
                    }`}>
                      {q.isResolved ? 'Solved' : 'Open'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-[#A1A1AA] mt-2.5">
                    <span>{new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{q.upvotes} Upvotes</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-[#171717] border border-[#2A2A2A] text-center">
                <p className="text-[13px] text-[#A1A1AA]">No doubts asked yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reputation History */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2 px-1">
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            <span>Reputation History</span>
          </h3>
          <div className="space-y-3 relative">
            {reputationHistory && reputationHistory.length > 0 ? (
              reputationHistory.map((rep, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#171717] border border-[#2A2A2A] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-[#A1A1AA]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white">{rep.reason}</p>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                        {new Date(rep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#22C55E] text-sm whitespace-nowrap">
                    +{rep.points} Rep
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-[#171717] border border-[#2A2A2A] text-center">
                <p className="text-[13px] text-[#A1A1AA]">No reputation history yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
