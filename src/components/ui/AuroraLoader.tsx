import React from 'react';

export const AuroraLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full animate-fade-in">
      <div className="relative w-16 h-16">
        {/* Core spinner */}
        <div className="absolute inset-0 border-t-2 border-neon rounded-full animate-spin"></div>
        {/* Outer glow ring */}
        <div className="absolute inset-0 border-r-2 border-purpleAccent rounded-full animate-spin opacity-60" style={{ animationDuration: '1.5s' }}></div>
        {/* Inner core */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-neon rounded-full -translate-x-1/2 -translate-y-1/2 shadow-glow-soft animate-pulse"></div>
      </div>
      <p className="mt-4 text-sm text-gray-400 font-light tracking-widest uppercase">Synchronizing Aurora Node...</p>
    </div>
  );
};