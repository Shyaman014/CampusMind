import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  ShieldCheck, 
  Trash2 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // users, questions

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (err) {
      // silent fail
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      // silent fail
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question as spam?')) return;
    try {
      const res = await API.delete(`/admin/questions/${qId}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      // silent fail
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      // silent fail
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading admin panel...</div>;
  }

  const { counts, recentQuestions } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl glass-card border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900 to-indigo-950/20 shadow-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">CampusMind AI Admin Control Center</h1>
            <p className="text-xs text-slate-400">Manage user access roles, audit platform statistics, and clean spam content</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Registered Users</span>
          <p className="text-2xl font-black text-white">{counts?.totalUsers || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Questions</span>
          <p className="text-2xl font-black text-white">{counts?.totalQuestions || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Answers</span>
          <p className="text-2xl font-black text-white">{counts?.totalAnswers || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Uploaded Note Files</span>
          <p className="text-2xl font-black text-white">{counts?.totalUploads || 0}</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'questions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Spam Content Cleanup ({recentQuestions?.length || 0})
        </button>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold text-slate-400 uppercase">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Reputation</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-indigo-300 font-bold capitalize focus:outline-none"
                    >
                      <option value="student">student</option>
                      <option value="senior">senior</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 font-bold text-indigo-400">{u.reputation} Rep</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Questions Cleanup Table */}
      {activeTab === 'questions' && (
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold text-slate-400 uppercase">
                <th className="py-4 px-6">Question Title</th>
                <th className="py-4 px-6">Author</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {recentQuestions && recentQuestions.map((q) => (
                <tr key={q._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-semibold text-white max-w-md truncate">{q.title}</td>
                  <td className="py-4 px-6 text-slate-400">{q.author?.name || 'User'}</td>
                  <td className="py-4 px-6 text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Spam</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
