import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RUNES, DICE_OPTIONS } from './constants';
import type { DiceOption } from './constants';
import AIWizard from './AIWizard';
import { calculateManaCost, calculateDiceSizeIncrease } from './logic';
import { useRunicAI } from './useRunicAI';

type Mode = 'standard' | 'orsatti' | 'ai';

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

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

const OrsattiWizard: React.FC = () => (
    <div className="fixed bottom-0 right-0 md:bottom-8 md:right-8 z-50 pointer-events-none" aria-hidden="true">
        <svg
            width="200"
            height="300"
            viewBox="0 0 150 225"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-float-wizard drop-shadow-lg"
        >
            <g transform="translate(0, 20)">
                {/* Sparkles */}
                <path d="M 132.5 52.5 L 135 45 L 137.5 52.5 L 145 55 L 137.5 57.5 L 135 65 L 132.5 57.5 L 125 55 Z" fill="#fef08a" className="sparkle-1" style={{ transformOrigin: '135px 55px' }} />
                <path d="M 115 25 L 117 20 L 119 25 L 124 27 L 119 29 L 117 34 L 115 29 L 110 27 Z" fill="#fef08a" className="sparkle-2" style={{ transformOrigin: '117px 27px' }} />
                <path d="M 140 80 L 141.5 76 L 143 80 L 147 81.5 L 143 83 L 141.5 87 L 140 83 L 136 81.5 Z" fill="#fef08a" className="sparkle-3" style={{ transformOrigin: '141.5px 81.5px' }} />

                {/* Staff */}
                <line x1="125" y1="10" x2="145" y2="150" stroke="#5c2d0d" strokeWidth="6" strokeLinecap="round" />
                <circle cx="123" cy="12" r="10" className="animate-glow-staff" />

                {/* Wizard */}
                <g>
                    {/* Hat */}
                    <path d="M 75,0 L 40,50 L 110,50 Z" fill="#5b21b6" />
                    <path d="M 40,50 Q 75,65 110,50 Q 75,55 40,50 Z" fill="#4c1d95" />
                    <circle cx="60" cy="40" r="3" fill="#fef08a" />
                    <path d="M 80 30 L 82 25 L 84 30 L 89 32 L 84 34 L 82 39 L 80 34 L 75 32 Z" fill="#fef08a" />

                    {/* Hand */}
                    <circle cx="115" cy="80" r="8" fill="#fbcfe8" />

                    {/* Body */}
                    <path d="M 50,60 C 20,100 20,150 50,180 L 100,180 C 130,150 130,100 100,60 Z" fill="#6d28d9" />
                    <path d="M 50,60 C 75,50 75,50 100,60 L 100,70 C 75,80 75,80 50,70 Z" fill="#5b21b6" />

                    {/* Head */}
                    <circle cx="75" cy="70" r="20" fill="#fbcfe8" />
                    <circle cx="68" cy="70" r="2" fill="#27272a" />
                    <circle cx="82" cy="70" r="2" fill="#27272a" />

                    {/* Beard */}
                    <path d="M 55,80 Q 75,120 95,80 Q 75,130 55,80" fill="#e5e7eb" />
                    <path d="M 60,90 Q 75,140 90,90 Q 75,150 60,90" fill="#f3f4f6" />
                </g>
            </g>
        </svg>
    </div>
);

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

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('standard');
  const [highestDieValue, setHighestDieValue] = useState<number>(DICE_OPTIONS[3].value);
  const [skillBonus, setSkillBonus] = useState<number>(3);
  const [selectedRunes, setSelectedRunes] = useState<string[]>([]);
  const [customManaCost, setCustomManaCost] = useState<number>(42);
  const [customDiceSizeIncrease, setCustomDiceSizeIncrease] = useState<number>(0);
  
  const [skillBonusInput, setSkillBonusInput] = useState<string>('3');
  const [customManaCostInput, setCustomManaCostInput] = useState<string>('42');
  const [customDiceSizeIncreaseInput, setCustomDiceSizeIncreaseInput] = useState<string>('0');
  
  const [isOrsattiAudioPlaying, setIsOrsattiAudioPlaying] = useState<boolean>(false);
  const orsattiAudioRef = useRef<HTMLAudioElement>(null);
  
  // AI State Lifted
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const { aiResponse, isLoadingAI, aiError, generateSpell } = useRunicAI();

  const isOrsattiMode = mode === 'orsatti';

  useEffect(() => {
    const audio = orsattiAudioRef.current;
    if (!audio) return;

    const onPlay = () => setIsOrsattiAudioPlaying(true);
    const onPause = () => setIsOrsattiAudioPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);

    if (isOrsattiMode) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio autoplay failed:", error);
          setIsOrsattiAudioPlaying(false);
        });
      }
    } else {
      audio.pause();
    }

    return () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onPause);
    };
  }, [isOrsattiMode]);
  
  const handleOrsattiAudioToggle = () => {
    const audio = orsattiAudioRef.current;
    if (!audio) return;

    if (isOrsattiAudioPlaying) {
        audio.pause();
    } else {
        audio.play().catch(error => {
            console.error("Audio playback failed:", error);
            setIsOrsattiAudioPlaying(false);
        });
    }
  };

  const maxRunes = useMemo(() => {
    if (isOrsattiMode) return Infinity; // No limits for Orsatti
    return Math.max(2, Math.min(skillBonus, 9));
  }, [skillBonus, isOrsattiMode]);

  const handleRuneClick = (rune: string) => {
    setSelectedRunes(prev => {
      if (isOrsattiMode) {
        return [...prev, rune];
      }
      if (prev.length < maxRunes) {
        return [...prev, rune];
      }
      return prev;
    });
  };

  const handleRemoveRune = (indexToRemove: number) => {
    setSelectedRunes(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearSpell = () => {
    setSelectedRunes([]);
  };

  const handleModeChange = (newMode: Mode) => {
      if (mode === 'orsatti' && newMode !== 'orsatti') {
          clearSpell();
          setCustomDiceSizeIncrease(0);
          setCustomDiceSizeIncreaseInput('0');
      }
      setMode(newMode);
  };

  const manaCost = useMemo(() => {
    if (isOrsattiMode) return customManaCost;
    return calculateManaCost(highestDieValue, skillBonus, selectedRunes);
  }, [highestDieValue, skillBonus, selectedRunes, isOrsattiMode, customManaCost]);
  
  const diceSizeIncrease = useMemo(() => {
    return calculateDiceSizeIncrease(selectedRunes);
  }, [selectedRunes]);

  const validationStatus = useMemo(() => {
    if (isOrsattiMode) {
      return { message: "Il potere di Orsatti non conosce vincoli.", color: 'text-purple-400', isValid: true };
    }
    const count = selectedRunes.length;
    if (count < 2) {
      return { message: 'Seleziona almeno 2 rune per creare un incantesimo.', color: 'text-amber-400', isValid: false };
    }
    if (count > maxRunes) {
      return { message: `Troppe rune! Il tuo massimo è ${maxRunes}.`, color: 'text-red-400', isValid: false };
    }
    return { message: `Incantesimo valido con ${count} rune.`, color: 'text-green-400', isValid: true };
  }, [selectedRunes.length, maxRunes, isOrsattiMode]);

  const renderStandardOrsattiContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 flex flex-col gap-8">
        {isOrsattiMode ? (
          <OrsattiAudioPlayer isPlaying={isOrsattiAudioPlaying} onTogglePlay={handleOrsattiAudioToggle} />
        ) : (
          <Card>
            <h2 className="font-cinzel text-2xl text-cyan-400 mb-4">Parametri Magici</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="dice-select" className="block text-sm font-medium text-slate-300 mb-1">Dado più Alto</label>
                <select id="dice-select" value={highestDieValue} onChange={(e) => setHighestDieValue(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                  {DICE_OPTIONS.map((opt: DiceOption) => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="skill-bonus" className="block text-sm font-medium text-slate-300 mb-1">Valore Magia Runica</label>
                <input id="skill-bonus" type="number" value={skillBonusInput} onChange={(e) => { setSkillBonusInput(e.target.value); const value = parseInt(e.target.value, 10); setSkillBonus(isNaN(value) ? 0 : value); }} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                <p className="text-xs text-slate-400 mt-1">Determina il numero massimo di rune (min 2, max 9).</p>
              </div>
            </div>
          </Card>
        )}
        <Card className="text-center">
          <h2 className="font-cinzel text-xl text-cyan-400 mb-2">{isOrsattiMode ? 'Inserisci il mana che vuoi spendere' : 'Costo Punti Mana'}</h2>
          {isOrsattiMode ? <input type="number" value={customManaCostInput} onChange={(e) => { setCustomManaCostInput(e.target.value); const value = parseInt(e.target.value, 10); setCustomManaCost(isNaN(value) ? 0 : value); }} aria-label="Costo mana personalizzato" className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white text-6xl font-bold text-center text-cyan-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /> : <p className={`text-6xl font-bold text-cyan-300 transition-all duration-300 ${!validationStatus.isValid ? 'opacity-50' : 'opacity-100'}`} title={validationStatus.isValid ? `Costo: ${manaCost}` : 'Crea un incantesimo valido per vedere il costo finale'}>{validationStatus.isValid ? manaCost : '??'}</p>}
          <p className={`mt-2 text-sm ${validationStatus.color}`}>{validationStatus.message}</p>
          {((!isOrsattiMode && diceSizeIncrease > 0) || isOrsattiMode) && <div className="mt-4 pt-4 border-t border-slate-700">{isOrsattiMode ? <> <h3 className="font-cinzel text-base text-amber-400">Aumento Taglia Dado</h3> <p className="text-xs text-slate-400 mb-2">Inserisci le taglie che desideri</p> <input type="number" value={customDiceSizeIncreaseInput} onChange={(e) => { setCustomDiceSizeIncreaseInput(e.target.value); const value = parseInt(e.target.value, 10); setCustomDiceSizeIncrease(isNaN(value) ? 0 : value); }} aria-label="Aumento taglia dado personalizzato" className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-1 px-3 text-white text-2xl font-bold text-center text-amber-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /> </> : <> <h3 className="font-cinzel text-base text-amber-400">Aumento Taglia Dado</h3> <p className="text-2xl font-bold text-amber-300">+{diceSizeIncrease}</p> </>}</div>}
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-cinzel text-2xl text-cyan-400">Componi Incantesimo</h2>
            {selectedRunes.length > 0 && <button onClick={clearSpell} className="text-sm bg-red-800/50 hover:bg-red-700/70 text-red-200 py-1 px-3 rounded-md transition-colors">Svuota</button>}
          </div>
          {isOrsattiMode && <p className="text-amber-300 italic text-sm text-center mb-4 border border-amber-500/50 bg-amber-900/20 p-3 rounded-md">"Sei nella modalita' Orsatti, il custode delle regole e delle verita', non esistono vincoli e catene per lui"</p>}
          <div className="bg-slate-900/50 border border-slate-700 rounded-md min-h-[80px] p-3 mb-6 flex flex-wrap gap-2 items-center">
            {selectedRunes.length === 0 ? <span className="text-slate-500">Seleziona le rune qui sotto...</span> : selectedRunes.map((rune, index) => <button key={`${rune}-${index}`} onClick={() => handleRemoveRune(index)} title={`Rimuovi ${rune}`} aria-label={`Rimuovi runa ${rune}`} className="group bg-cyan-900/70 text-cyan-200 font-bold py-1 pl-3 pr-2 rounded-full text-lg flex items-center transition-colors hover:bg-red-800/60 hover:text-red-100"><span>{rune}</span><span aria-hidden="true" className="ml-1.5 text-sm opacity-70 group-hover:opacity-100">×</span></button>)}
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-2">
            {RUNES.map(rune => { const isDisabled = !isOrsattiMode && selectedRunes.length >= maxRunes; return <button key={rune} onClick={() => handleRuneClick(rune)} disabled={isDisabled} className={`p-2 aspect-square rounded-md flex items-center justify-center font-bold text-lg transition-all duration-200 ${isOrsattiMode ? 'bg-slate-700 hover:bg-purple-500' : 'bg-slate-700 hover:bg-slate-600'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>{rune}</button>; })}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="magical-bg bg-slate-900 text-slate-200 min-h-screen font-sans">
      <audio ref={orsattiAudioRef} src="https://tzvwwovezxo6gwk4.public.blob.vercel-storage.com/AUD-20250910-WA0009.mp3" loop />
      {isOrsattiMode && <OrsattiWizard />}
      <div className="bg-slate-900/80 min-h-screen backdrop-blur-sm">
        <Header mode={mode} onModeChange={handleModeChange} />
        <main className="container mx-auto p-4 md:p-8">
            <div style={{ display: mode !== 'ai' ? 'block' : 'none' }}>
              {renderStandardOrsattiContent()}
            </div>
            <div style={{ display: mode === 'ai' ? 'block' : 'none' }}>
              <AIWizard 
                isActive={mode === 'ai'}
                highestDieValue={highestDieValue}
                setHighestDieValue={setHighestDieValue}
                skillBonus={skillBonus}
                setSkillBonus={setSkillBonus}
                skillBonusInput={skillBonusInput}
                setSkillBonusInput={setSkillBonusInput}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                aiResponse={aiResponse}
                isLoadingAI={isLoadingAI}
                aiError={aiError}
                generateSpell={generateSpell}
              />
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
