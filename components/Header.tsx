import React from 'react';
import type { Mode } from '../types';

const MODES: { id: Mode; label: string; activeClass: string; inactiveClass: string; }[] = [
    { id: 'standard', label: 'Standard', activeClass: 'bg-cyan-500 text-white', inactiveClass: 'bg-slate-700 hover:bg-slate-600 text-slate-300' },
    { id: 'orsatti', label: 'Sono Orsatti', activeClass: 'bg-purple-600 text-white', inactiveClass: 'bg-slate-700 hover:bg-slate-600 text-slate-300' },
    { id: 'ai', label: 'AI', activeClass: 'bg-amber-500 text-white', inactiveClass: 'bg-slate-700 hover:bg-slate-600 text-slate-300' },
];

const Header: React.FC<{ mode: Mode; onModeChange: (mode: Mode) => void; }> = ({ mode, onModeChange }) => (
  <header className="text-center p-4 md:p-6">
    <h1 className="font-cinzel text-3xl md:text-5xl font-bold text-cyan-300 tracking-wider">
      Il Fai da te Runico
    </h1>
    <p className="text-slate-400 mt-2 text-sm md:text-base">
      Come non trasformare il tuo cervello in una pozzanghera fumante
    </p>
    <div className="mt-6 flex justify-center items-center p-1 bg-slate-800/60 rounded-full max-w-sm mx-auto">
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={`w-1/3 px-2 py-1.5 rounded-full text-sm font-bold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${mode === m.id ? `${m.activeClass} focus-visible:ring-white` : `${m.inactiveClass} focus-visible:ring-slate-400`}`}
          aria-pressed={mode === m.id}
        >
          {m.label}
        </button>
      ))}
    </div>
  </header>
);

export default Header;
