import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';
import UserAvatar from '../ui/UserAvatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, setUnreadCount } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2A2A]/60">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          <Link to="/" className="flex items-center space-x-3 group min-w-0">
            <BrandLogo size={36} iconSize={22} className="group-hover:scale-105 transition-transform duration-200" />
            <span className="text-[18px] sm:text-[20px] font-extrabold tracking-tight text-white truncate max-w-[180px] sm:max-w-none group-hover:text-indigo-300 smooth-transition">
              CampusMind AI
            </span>
          </Link>

          <div className="flex items-center space-x-1.5">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F] smooth-transition relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-1 w-72 max-w-[calc(100vw-24px)] bg-[#181818] rounded-xl shadow-2xl border border-[#2A2A2A] overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-[#2A2A2A]">
                        <span className="text-[11px] font-medium text-[#A1A1AA] uppercase tracking-wider">Notifications</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-xs text-[#A1A1AA]">Nothing yet</p>
                        ) : (
                          notifications.map((notif, idx) => (
                            <Link
                              key={idx}
                              to={notif.link || '#'}
                              onClick={() => setShowNotifications(false)}
                              className="block px-4 py-2.5 hover:bg-[#242424] smooth-transition"
                            >
                              <p className="text-sm text-white">{notif.title}</p>
                              <p className="text-xs text-[#A1A1AA] mt-0.5">{notif.message}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center space-x-1.5 p-1 min-h-[44px] rounded-lg hover:bg-[#1F1F1F] smooth-transition focus:outline-none"
                    aria-label="User menu"
                  >
                    <UserAvatar user={user} className="w-8 h-8 text-xs font-bold" rounded="rounded-full" />
                    <ChevronDown className="w-3.5 h-3.5 text-[#A1A1AA] hidden sm:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-1 w-52 max-w-[calc(100vw-24px)] bg-[#181818] rounded-xl shadow-2xl border border-[#2A2A2A] overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-[#2A2A2A]">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-[#A1A1AA] capitalize">{user.role}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/dashboard" onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#242424] smooth-transition">
                          <User className="w-4 h-4" /><span>Profile</span>
                        </Link>
                        <Link to="/settings" onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#242424] smooth-transition">
                          <Settings className="w-4 h-4" /><span>Settings</span>
                        </Link>
                      </div>
                      <div className="border-t border-[#2A2A2A]" />
                      <button
                        onClick={() => { setShowUserMenu(false); logout(); }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-red-400 hover:bg-red-400/5 smooth-transition"
                      >
                        <LogOut className="w-4 h-4" /><span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-2 min-h-[40px] flex items-center justify-center text-sm text-[#A1A1AA] hover:text-white smooth-transition">Log in</Link>
                <Link to="/register" className="px-3.5 py-2 min-h-[40px] flex items-center justify-center rounded-xl text-sm font-medium bg-white text-[#0B0B0B] hover:bg-[#E4E4E7] smooth-transition shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
