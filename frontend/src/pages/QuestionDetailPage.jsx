import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import QuestionCard from '../components/questions/QuestionCard';
import AnswerCard from '../components/answers/AnswerCard';
import AIAnswerBox from '../components/answers/AIAnswerBox';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Send, Sparkles, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchQuestionDetails = async () => {
    try {
      const res = await API.get(`/questions/${id}`);
      if (res.data.success) {
        setQuestion(res.data.data.question);
        setAnswers(res.data.data.answers);
      }
    } catch (err) {
      console.error('Failed to load question details:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestionDetails();

    if (socket) {
      socket.emit('join_question_room', id);
      socket.on('new_answer_posted', (newAnswer) => {
        setAnswers((prev) => [newAnswer, ...prev]);
      });

      return () => {
        socket.emit('leave_question_room', id);
        socket.off('new_answer_posted');
      };
    }
  }, [id, socket]);

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerContent.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await API.post(`/questions/${id}/answers`, {
        content: newAnswerContent,
      });

      if (res.data.success) {
        setAnswers([res.data.data, ...answers]);
        setNewAnswerContent('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SkeletonLoader count={2} />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Question not found</h2>
        <Link to="/" className="text-xs text-indigo-400 font-bold hover:underline mt-2 inline-block">
          Return to Doubt Feed
        </Link>
      </div>
    );
  }

  const aiAnswers = answers.filter((a) => a.isAI);
  const humanAnswers = answers.filter((a) => !a.isAI);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back to feed button */}
      <Link to="/forum" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doubt Feed</span>
      </Link>

      {/* Main Question Card */}
      <QuestionCard question={question} onVoteUpdate={fetchQuestionDetails} />

      {/* AI Answer Section */}
      {aiAnswers.length > 0 ? (
        <AIAnswerBox
          initialAnswer={aiAnswers[0]}
          questionTitle={question.title}
          questionContent={question.content}
        />
      ) : (
        <div className="p-4 rounded-2xl glass-card border border-indigo-500/30 text-xs text-indigo-300 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Generating AI auto-explanation for this doubt...</span>
        </div>
      )}

      {/* Human Answers List */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <span>Peer & Senior Answers ({humanAnswers.length})</span>
        </h3>

        {/* Submit Answer Form */}
        {user ? (
          <form onSubmit={handleAddAnswer} className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-200">Provide Your Answer or Solution (+10 Rep)</h4>
            {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}
            <textarea
              required
              rows={4}
              placeholder="Write a clear, helpful answer with step-by-step logic, code, or explanations..."
              value={newAnswerContent}
              onChange={(e) => setNewAnswerContent(e.target.value)}
              className="w-full p-4 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Post Answer'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl glass-card border border-slate-800 text-center text-xs text-slate-400">
            Please <Link to="/login" className="text-indigo-400 font-bold hover:underline">sign in</Link> to submit an answer.
          </div>
        )}

        {/* Human Answer Cards */}
        {humanAnswers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-2xl glass-card border border-slate-800">
            No senior or peer answers yet. Be the first to help!
          </div>
        ) : (
          humanAnswers.map((answer) => (
            <AnswerCard
              key={answer._id}
              answer={answer}
              questionAuthorId={question.author?._id || question.author}
              onAcceptUpdate={fetchQuestionDetails}
            />
          ))
        )}
      </div>

    </div>
  );
}
