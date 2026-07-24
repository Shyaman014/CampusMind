import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-600">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold gradient-text">CampusMind AI</span>
          <span className="text-xs text-slate-500">© 2026 CampusMind AI Platform</span>
        </div>

        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <span>Powered by Google Gemini 1.5 Pro</span>
          <span>•</span>
          <span>MongoDB Atlas</span>
          <span>•</span>
          <span>Socket.io Realtime</span>
        </div>

      </div>
    </footer>
  );
}
