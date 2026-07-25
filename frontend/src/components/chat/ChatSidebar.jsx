import React from 'react';
import { Plus, MessageSquare, Trash2, EyeOff, ShieldAlert } from 'lucide-react';

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearAllChats,
  isTemporary,
  onToggleTemporary,
  isOpen,
}) {
  return (
    <aside
      className={`bg-[#111111] flex flex-col h-full transition-all duration-200 border-r border-[#2A2A2A]/40 ${
        isOpen
          ? 'fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] shadow-2xl block md:relative md:w-[260px] md:shadow-none'
          : 'hidden md:flex md:relative md:w-[260px]'
      }`}
    >
      <div className="p-4 pt-5 space-y-3">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3 rounded-xl bg-[#1F1F1F] hover:bg-[#242424] text-white text-sm font-medium flex items-center justify-center space-x-2 border border-[#2A2A2A] smooth-transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <button
          onClick={onToggleTemporary}
          className={`w-full py-2 px-3 rounded-xl border text-sm flex items-center justify-between smooth-transition ${
            isTemporary
              ? 'bg-white/5 border-white/20 text-white'
              : 'bg-transparent border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:border-[#3A3A3A]'
          }`}
        >
          <div className="flex items-center space-x-2">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Temporary Chat</span>
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            isTemporary ? 'bg-white/10 text-white' : 'bg-[#1F1F1F] text-[#A1A1AA]'
          }`}>
            {isTemporary ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#A1A1AA] uppercase tracking-wider">Recent</span>
          {chats.length > 0 && (
            <button onClick={onClearAllChats} className="text-[11px] text-[#A1A1AA] hover:text-white smooth-transition">
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {chats.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-[#A1A1AA]">No conversations yet</p>
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = activeChatId === chat._id && !isTemporary;
            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat._id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13px] cursor-pointer smooth-transition relative ${
                  isActive
                    ? 'bg-[#1F1F1F] text-white'
                    : 'text-[#A1A1AA] hover:bg-[#181818] hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r-full" />
                )}
                <div className="flex items-center space-x-2.5 min-w-0 pl-1">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                  <span className="truncate">{chat.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 smooth-transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {isTemporary && (
        <div className="p-3 border-t border-[#2A2A2A]/40">
          <div className="px-3 py-2.5 rounded-lg bg-white/5 text-[#A1A1AA] flex items-center space-x-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Temporary — chats won't be saved</span>
          </div>
        </div>
      )}
    </aside>
  );
}
