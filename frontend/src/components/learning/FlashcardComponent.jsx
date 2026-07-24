import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Layers } from 'lucide-react';

export default function FlashcardComponent({ flashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) return null;

  const current = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Interactive AI Flashcards</span>
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="h-56 w-full cursor-pointer rounded-2xl glass-card border border-indigo-500/30 p-8 flex flex-col items-center justify-center text-center relative transition-all duration-500 hover:border-indigo-500/60 bg-gradient-to-br from-slate-900 to-indigo-950/30"
      >
        <button className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 text-slate-400 hover:text-white">
          <RotateCw className="w-4 h-4" />
        </button>

        {!isFlipped ? (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Question / Term</span>
            <h3 className="text-lg font-bold text-white leading-snug">{current.front}</h3>
            <p className="text-[11px] text-slate-500 mt-2">Click card to reveal definition/answer</p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Answer / Explanation</span>
            <p className="text-base text-indigo-200 font-medium leading-relaxed">{current.back}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs text-slate-400">Click card to flip</span>

        <button
          onClick={handleNext}
          className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
