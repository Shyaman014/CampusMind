import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Trophy, Award, Flame, Star, ShieldCheck, User } from 'lucide-react';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.get('/community/leaderboard');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="p-8 rounded-3xl glass-card border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-purple-950/20 shadow-2xl text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Campus Community Leaderboard</h1>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Top student scholars & senior mentors ranked by academic reputation, helpful answers, and activity streaks.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {!loading && users.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* #2 Rank */}
          <div className="p-6 rounded-3xl glass-card border border-slate-700 text-center space-y-3 relative bg-slate-900/60 order-2 md:order-1">
            <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-slate-700 text-slate-300">
              #2 Rank
            </span>
            <img
              src={users[1].avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={users[1].name}
              className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-slate-400"
            />
            <h3 className="text-base font-bold text-white">{users[1].name}</h3>
            <p className="text-xs text-slate-400">{users[1].department || 'Computer Science'}</p>
            <div className="pt-2 text-sm font-extrabold text-slate-200">
              {users[1].reputation} <span className="text-xs text-slate-400 font-normal">Reputation</span>
            </div>
          </div>

          {/* #1 Rank Podium Centerpiece */}
          <div className="p-8 rounded-3xl glass-card border border-amber-500/50 text-center space-y-3 relative bg-gradient-to-b from-amber-950/30 to-slate-900 shadow-2xl scale-105 order-1 md:order-2">
            <span className="absolute top-4 right-4 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500 text-slate-950 flex items-center space-x-1">
              <Trophy className="w-3 h-3 fill-slate-950" />
              <span>#1 Leader</span>
            </span>
            <img
              src={users[0].avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={users[0].name}
              className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-amber-400 shadow-brandGlow"
            />
            <h3 className="text-lg font-extrabold text-white">{users[0].name}</h3>
            <p className="text-xs text-amber-300 font-medium">{users[0].department || 'Computer Science'}</p>
            <div className="pt-2 text-lg font-black text-amber-400">
              {users[0].reputation} <span className="text-xs text-slate-400 font-normal">Reputation</span>
            </div>
          </div>

          {/* #3 Rank */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 text-center space-y-3 relative bg-slate-900/60 order-3">
            <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-amber-900/40 text-amber-400">
              #3 Rank
            </span>
            <img
              src={users[2].avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={users[2].name}
              className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-amber-700"
            />
            <h3 className="text-base font-bold text-white">{users[2].name}</h3>
            <p className="text-xs text-slate-400">{users[2].department || 'Engineering'}</p>
            <div className="pt-2 text-sm font-extrabold text-slate-200">
              {users[2].reputation} <span className="text-xs text-slate-400 font-normal">Reputation</span>
            </div>
          </div>

        </div>
      )}

      {/* Leaderboard Full Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold text-slate-400 uppercase">
              <th className="py-4 px-6">Rank</th>
              <th className="py-4 px-6">Scholar Student</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6">Streak</th>
              <th className="py-4 px-6 text-right">Reputation Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {users.map((u, idx) => (
              <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-extrabold text-slate-300">
                  #{idx + 1}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-white flex items-center space-x-1.5">
                        <span>{u.name}</span>
                        {u.role === 'senior' && (
                          <span className="px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">Senior</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-400">{u.department || 'CSE'}</td>
                <td className="py-4 px-6 text-slate-300">
                  <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{u.streakDays || 1}d</span>
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-black text-indigo-400 text-sm">
                  {u.reputation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
