import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import CampusMindIcon from '../ui/CampusMindIcon';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, setUnreadCount } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2A2A]/60">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">

          <Link to="/" className="flex items-center space-x-2 sm:space-x-2.5 group min-w-0">
            <CampusMindIcon size={26} />
            <span className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-white truncate max-w-[150px] sm:max-w-none">
              CampusMind AI
            </span>
          </Link>

          <div className="flex items-center space-x-1.5">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }}
                    className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F] smooth-transition relative"
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-1 w-72 max-w-[calc(100vw-32px)] bg-[#181818] rounded-xl shadow-2xl border border-[#2A2A2A] overflow-hidden z-50 animate-fade-in">
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
                    className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-[#1F1F1F] smooth-transition focus:outline-none"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=2A2A2A&textColor=FFFFFF`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#2A2A2A]"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-[#A1A1AA] hidden sm:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-1 w-52 max-w-[calc(100vw-32px)] bg-[#181818] rounded-xl shadow-2xl border border-[#2A2A2A] overflow-hidden z-50 animate-fade-in">
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
                <Link to="/login" className="px-3 py-1.5 text-sm text-[#A1A1AA] hover:text-white smooth-transition">Log in</Link>
                <Link to="/register" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-[#0B0B0B] hover:bg-[#E4E4E7] smooth-transition">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
