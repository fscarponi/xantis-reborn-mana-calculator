import React from 'react';
import Card from './Card';

const OrsattiAudioPlayer: React.FC<{
  isPlaying: boolean;
  onTogglePlay: () => void;
}> = ({ isPlaying, onTogglePlay }) => (
  <Card>
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="font-cinzel text-xl text-purple-400">Traccia Mistica</h2>
      <div className={`flex items-end justify-center gap-1 h-10 w-20 ${isPlaying ? 'playing' : ''}`}>
         <span className="sound-bar sound-bar-1 w-2 h-full bg-purple-400 rounded-full" />
         <span className="sound-bar sound-bar-2 w-2 h-full bg-purple-400 rounded-full" />
         <span className="sound-bar sound-bar-3 w-2 h-full bg-purple-400 rounded-full" />
         <span className="sound-bar sound-bar-4 w-2 h-full bg-purple-400 rounded-full" />
      </div>
      <button
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pausa' : 'Play'}
        className="group relative w-16 h-16 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5A1.5 1.5 0 0 1 5.5 3.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
          </svg>
        )}
      </button>
    </div>
  </Card>
);

export default OrsattiAudioPlayer;
