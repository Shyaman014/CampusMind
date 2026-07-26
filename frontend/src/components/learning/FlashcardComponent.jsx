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
        className="min-h-[14rem] sm:h-56 w-full cursor-pointer rounded-2xl glass-card border border-indigo-500/30 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative transition-all duration-500 hover:border-indigo-500/60 bg-gradient-to-br from-slate-900 to-indigo-950/30 overflow-hidden break-words"
      >
        <button className="absolute top-4 right-4 p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-slate-800/60 text-slate-400 hover:text-white" aria-label="Rotate card">
          <RotateCw className="w-4 h-4" />
        </button>

        {!isFlipped ? (
          <div className="space-y-2 max-w-full">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Question / Term</span>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug break-words">{current.front}</h3>
            <p className="text-[11px] text-slate-500 mt-2">Click card to reveal definition/answer</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-full">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Answer / Explanation</span>
            <p className="text-sm sm:text-base text-indigo-200 font-medium leading-relaxed break-words">{current.back}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs text-slate-400 text-center">Click card to flip</span>

        <button
          onClick={handleNext}
          className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
