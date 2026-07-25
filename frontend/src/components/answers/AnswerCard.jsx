import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  MessageSquare, 
  Send,
  Award
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AnswerCard({ answer, questionAuthorId, onAcceptUpdate }) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(answer.upvotes || 0);
  const [downvotes, setDownvotes] = useState(answer.downvotes || 0);
  const [isAccepted, setIsAccepted] = useState(answer.isAccepted || false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const isQuestionOwner = user && user._id === questionAuthorId;

  const handleVote = async (voteType) => {
    try {
      const res = await API.post(`/answers/${answer._id}/vote`, { voteType });
      if (res.data.success) {
        setUpvotes(res.data.data.upvotes);
        setDownvotes(res.data.data.downvotes);
      }
    } catch (error) {
      console.error('Answer vote failed:', error);
    }
  };

  const handleAccept = async () => {
    try {
      const res = await API.put(`/answers/${answer._id}/accept`);
      if (res.data.success) {
        setIsAccepted(true);
        if (onAcceptUpdate) onAcceptUpdate(answer._id);
      }
    } catch (error) {
      console.error('Accept answer failed:', error);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const res = await API.get(`/answers/${answer._id}/comments`);
        if (res.data.success) {
          setComments(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await API.post(`/answers/${answer._id}/comments`, { content: newComment });
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Add comment failed:', error);
    }
  };

  const authorName = answer.author?.name || 'Campus Scholar';
  const authorAvatar = answer.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  return (
    <div className={`p-6 rounded-2xl glass-card border transition-all ${
      isAccepted ? 'border-emerald-500/50 bg-emerald-950/10 shadow-lg shadow-emerald-900/10' : 'border-slate-800'
    }`}>
      
      {/* Answer Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{authorName}</span>
              {answer.author?.role === 'senior' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>Senior</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {answer.author?.department || 'Student'} • {answer.author?.reputation || 10} Rep
            </p>
          </div>
        </div>

        {/* Accepted Solution Badge or Button */}
        {isAccepted ? (
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-1 border border-emerald-500/30">
            <CheckCircle className="w-4 h-4 fill-emerald-400 text-slate-950" />
            <span>Accepted Solution</span>
          </span>
        ) : isQuestionOwner ? (
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Accepted</span>
          </button>
        ) : null}
      </div>

      {/* Content */}
      <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line mb-4 font-sans">
        {answer.content}
      </div>

      {/* Footer Controls: Votes & Comments */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs text-slate-400">
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleVote(1)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="font-bold">{upvotes}</span>
          </button>

          <button
            onClick={() => handleVote(-1)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:text-rose-400 transition-all"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="font-bold">{downvotes}</span>
          </button>
        </div>

        <button
          onClick={toggleComments}
          className="flex items-center space-x-1.5 hover:text-indigo-400 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comments ({comments.length || answer.commentsCount || 0})</span>
        </button>

      </div>

      {/* Discussion Comments Thread */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-slate-500">Loading discussion comments...</p>
          ) : (
            comments.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">{c.author?.name}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300">{c.content}</p>
              </div>
            ))
          )}

          {user && (
            <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
