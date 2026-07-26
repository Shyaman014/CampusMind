import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, EyeOff, ShieldAlert, Star, Search, Edit2, Copy, Archive, Check, X } from 'lucide-react';

export default function ChatSidebar({
  chats = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearAllChats,
  onToggleFavorite,
  onRenameChat,
  onDuplicateChat,
  onArchiveChat,
  isTemporary,
  onToggleTemporary,
  isOpen,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setRenamingId(chat._id);
    setRenameValue(chat.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (renameValue.trim() && onRenameChat) {
      onRenameChat(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const filteredChats = chats.filter((c) => {
    if (showArchived) return c.isArchived;
    if (c.isArchived && !showArchived) return false;
    if (!searchQuery.trim()) return true;
    return c.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const favoriteChats = filteredChats.filter((c) => c.isFavorite);
  const regularChats = filteredChats.filter((c) => !c.isFavorite);

  const renderChatItem = (chat) => {
    const isActive = activeChatId === chat._id && !isTemporary;
    const isRenaming = renamingId === chat._id;

    return (
      <div
        key={chat._id}
        onClick={() => !isRenaming && onSelectChat(chat._id)}
        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-[13px] cursor-pointer transition-all duration-200 relative ${
          isActive
            ? 'bg-[#1F1F1F] text-white font-semibold shadow-sm'
            : 'text-[#A1A1AA] hover:bg-[#181818] hover:text-white hover:-translate-y-0.5 hover:shadow-sm'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r-full" />
        )}
        
        {isRenaming ? (
          <div className="flex items-center space-x-1.5 w-full pr-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(e, chat._id)}
              className="flex-1 bg-[#111111] text-white text-xs px-2 py-1 rounded border border-[#3A3A3A] focus:outline-none focus:border-white"
              autoFocus
            />
            <button onClick={(e) => handleSaveRename(e, chat._id)} className="p-1 hover:text-green-400">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setRenamingId(null)} className="p-1 hover:text-red-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2 min-w-0 pl-1">
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400/80" />
              <span className="truncate max-w-[130px] sm:max-w-[140px]">{chat.title}</span>
            </div>

            <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onToggleFavorite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(chat._id); }}
                  className={`p-1 rounded hover:bg-[#2A2A2A] transition-colors ${chat.isFavorite ? 'text-yellow-400 opacity-100' : 'text-[#A1A1AA] hover:text-white'}`}
                  title={chat.isFavorite ? 'Remove Favorite' : 'Favorite'}
                >
                  <Star className={`w-3 h-3 ${chat.isFavorite ? 'fill-yellow-400' : ''}`} />
                </button>
              )}
              {onRenameChat && (
                <button
                  onClick={(e) => handleStartRename(e, chat)}
                  className="p-1 rounded hover:bg-[#2A2A2A] text-[#A1A1AA] hover:text-white transition-colors"
                  title="Rename"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
              {onDuplicateChat && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicateChat(chat._id); }}
                  className="p-1 rounded hover:bg-[#2A2A2A] text-[#A1A1AA] hover:text-white transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
              {onArchiveChat && (
                <button
                  onClick={(e) => { e.stopPropagation(); onArchiveChat(chat._id); }}
                  className="p-1 rounded hover:bg-[#2A2A2A] text-[#A1A1AA] hover:text-white transition-colors"
                  title={chat.isArchived ? 'Unarchive' : 'Archive'}
                >
                  <Archive className="w-3 h-3" />
                </button>
              )}
              {onDeleteChat && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); }}
                  className="p-1 rounded hover:bg-[#2A2A2A] text-[#A1A1AA] hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`bg-[#111111] flex flex-col h-full transition-all duration-200 border-r border-[#2A2A2A]/40 ${
        isOpen
          ? 'fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] shadow-2xl block lg:relative lg:w-[260px] lg:shadow-none'
          : 'hidden lg:flex lg:relative lg:w-[260px]'
      }`}
    >
      <div className="p-4 pt-5 space-y-3.5">
        <button
          onClick={onNewChat}
          className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#1F1F1F] hover:bg-[#242424] text-white text-sm font-semibold flex items-center justify-center space-x-2 border border-[#2A2A2A] transition-all duration-200 shadow-sm hover:shadow-brandGlow hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>New Chat</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#181818] border border-[#2A2A2A] rounded-xl text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#3A3A3A] transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-[#A1A1AA] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onToggleTemporary}
          className={`w-full min-h-[44px] py-2 px-3 rounded-xl border text-xs flex items-center justify-between smooth-transition ${
            isTemporary
              ? 'bg-white/5 border-white/20 text-white font-medium'
              : 'bg-transparent border-[#2A2A2A] text-[#A1A1AA] hover:text-white hover:border-[#3A3A3A]'
          }`}
        >
          <div className="flex items-center space-x-2">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Temporary Chat</span>
          </div>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
            isTemporary ? 'bg-white/10 text-white' : 'bg-[#1F1F1F] text-[#A1A1AA]'
          }`}>
            {isTemporary ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {favoriteChats.length > 0 && !showArchived && (
          <div className="space-y-0.5">
            <div className="px-2.5 py-1 flex items-center space-x-1.5 text-[11px] font-semibold text-yellow-400 uppercase tracking-wider">
              <Star className="w-3 h-3 fill-yellow-400" />
              <span>Favorites</span>
            </div>
            {favoriteChats.map(renderChatItem)}
          </div>
        )}

        <div className="space-y-0.5">
          <div className="px-2.5 py-1 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-medium text-[#A1A1AA] uppercase tracking-wider">
                {showArchived ? 'Archived Chats' : 'Recent'}
              </span>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${showArchived ? 'bg-white/10 text-white font-medium' : 'text-[#A1A1AA] hover:text-white'}`}
              >
                {showArchived ? 'Active' : 'Archived'}
              </button>
            </div>
            {chats.length > 0 && !showArchived && (
              <button onClick={onClearAllChats} className="text-[11px] text-[#A1A1AA] hover:text-white smooth-transition">
                Clear all
              </button>
            )}
          </div>

          {filteredChats.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-xs text-[#A1A1AA]">
                {searchQuery ? 'No matching chats found' : showArchived ? 'No archived chats' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            regularChats.map(renderChatItem)
          )}
        </div>
      </div>

      {isTemporary && (
        <div className="p-3 border-t border-[#2A2A2A]/40">
          <div className="px-3 py-2.5 rounded-lg bg-white/5 text-[#A1A1AA] flex items-center space-x-2 text-xs">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Temporary — chats won't be saved</span>
          </div>
        </div>
      )}
    </aside>
  );
}
