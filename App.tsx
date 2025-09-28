import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DICE_OPTIONS } from './constants';
import AIWizard from './AIWizard';
import { calculateManaCost, calculateDiceSizeIncrease, getDiceProgressionString } from './logic';
import { useRunicAI } from './useRunicAI';
import type { Mode } from './types';
import Header from './components/Header';
import OrsattiWizard from './components/OrsattiWizard';
import SpellCrafter from './components/SpellCrafter';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('standard');
  const [highestDieValue, setHighestDieValue] = useState<number>(DICE_OPTIONS[3].value);
  const [skillBonus, setSkillBonus] = useState<number>(3);
  const [spellCircle, setSpellCircle] = useState<number>(3);
  const [employedRunicMagic, setEmployedRunicMagic] = useState<number>(3);
  const [selectedRunes, setSelectedRunes] = useState<string[]>([]);
  const [customManaCost, setCustomManaCost] = useState<number>(42);
  const [customDiceSizeIncrease, setCustomDiceSizeIncrease] = useState<number>(0);
  
  const [skillBonusInput, setSkillBonusInput] = useState<string>('3');
  const [spellCircleInput, setSpellCircleInput] = useState<string>('3');
  const [employedRunicMagicInput, setEmployedRunicMagicInput] = useState<string>('3');
  const [customManaCostInput, setCustomManaCostInput] = useState<string>('42');
  const [customDiceSizeIncreaseInput, setCustomDiceSizeIncreaseInput] = useState<string>('0');
  
  const [isOrsattiAudioPlaying, setIsOrsattiAudioPlaying] = useState<boolean>(false);
  const orsattiAudioRef = useRef<HTMLAudioElement>(null);
  
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const { aiResponse, isLoadingAI, aiError, generateSpell } = useRunicAI();

  const isOrsattiMode = mode === 'orsatti';

  const calculatedSpellCircle = useMemo(() => {
    if (mode !== 'standard') return 0;
    const numRunes = selectedRunes.length;
    if (numRunes < 2) return 0;
    if (numRunes === 2) {
      return selectedRunes[0] === 'Bet' ? 1 : 2;
    }
    return Math.min(numRunes, 9);
  }, [selectedRunes, mode]);

  const displaySpellCircle = mode === 'standard' ? calculatedSpellCircle : spellCircle;
  const maxRunes = useMemo(() => Math.min(skillBonus, 9), [skillBonus]);
  
  useEffect(() => {
    if (mode === 'standard') return;
    const maxCircle = Math.max(2, Math.min(9, skillBonus));
    if (spellCircle > maxCircle) {
      setSpellCircle(maxCircle);
      setSpellCircleInput(String(maxCircle));
    }
  }, [skillBonus, spellCircle, mode]);

  useEffect(() => {
    const maxEmployed = skillBonus;
    if (employedRunicMagic > maxEmployed) {
        setEmployedRunicMagic(maxEmployed);
        setEmployedRunicMagicInput(String(maxEmployed));
    }
  }, [skillBonus, employedRunicMagic]);

  useEffect(() => {
    const minEmployed = displaySpellCircle > 0 ? displaySpellCircle : 2;
    if (employedRunicMagic < minEmployed) {
        setEmployedRunicMagic(minEmployed);
        setEmployedRunicMagicInput(String(minEmployed));
    }
  }, [displaySpellCircle, employedRunicMagic]);

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

  const handleRuneClick = (rune: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    button.classList.add('animate-rune-glow');
    button.addEventListener('animationend', () => {
        button.classList.remove('animate-rune-glow');
    }, { once: true });

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
    return calculateManaCost(highestDieValue, employedRunicMagic, selectedRunes);
  }, [highestDieValue, employedRunicMagic, selectedRunes, isOrsattiMode, customManaCost]);
  
  const diceSizeIncrease = useMemo(() => {
    return calculateDiceSizeIncrease(selectedRunes);
  }, [selectedRunes]);

  const diceProgressionString = useMemo(() => {
    const increase = isOrsattiMode ? customDiceSizeIncrease : diceSizeIncrease;
    return getDiceProgressionString(highestDieValue, increase);
  }, [highestDieValue, diceSizeIncrease, customDiceSizeIncrease, isOrsattiMode]);
  
  const validationStatus = useMemo(() => {
    if (isOrsattiMode) {
      return { message: "Il potere di Orsatti non conosce vincoli.", color: 'text-purple-400', isValid: true };
    }
    if (selectedRunes.length < 2) {
      return { message: `Seleziona almeno 2 rune (max ${maxRunes}).`, color: 'text-amber-400', isValid: false };
    }
    if (calculatedSpellCircle > 0) {
      return { message: `Incantesimo valido di Circolo ${calculatedSpellCircle}.`, color: 'text-green-400', isValid: true };
    }
    return { message: 'Crea un incantesimo valido.', color: 'text-amber-400', isValid: false };
  }, [selectedRunes.length, isOrsattiMode, calculatedSpellCircle, maxRunes]);

  return (
    <div className="magical-bg bg-slate-900 text-slate-200 min-h-screen font-sans">
      <audio ref={orsattiAudioRef} src="https://tzvwwovezxo6gwk4.public.blob.vercel-storage.com/AUD-20250910-WA0009.mp3" loop />
      {isOrsattiMode && <OrsattiWizard />}
      <div className="bg-slate-900/80 min-h-screen backdrop-blur-sm">
        <Header mode={mode} onModeChange={handleModeChange} />
        <main className="container mx-auto p-4 md:p-8">
            <div style={{ display: mode !== 'ai' ? 'block' : 'none' }}>
              <SpellCrafter
                  mode={mode}
                  isOrsattiAudioPlaying={isOrsattiAudioPlaying}
                  onTogglePlay={handleOrsattiAudioToggle}
                  highestDieValue={highestDieValue}
                  setHighestDieValue={setHighestDieValue}
                  skillBonus={skillBonus}
                  setSkillBonus={setSkillBonus}
                  skillBonusInput={skillBonusInput}
                  setSkillBonusInput={setSkillBonusInput}
                  employedRunicMagic={employedRunicMagic}
                  setEmployedRunicMagic={setEmployedRunicMagic}
                  employedRunicMagicInput={employedRunicMagicInput}
                  setEmployedRunicMagicInput={setEmployedRunicMagicInput}
                  customManaCost={customManaCost}
                  setCustomManaCost={setCustomManaCost}
                  customManaCostInput={customManaCostInput}
                  setCustomManaCostInput={setCustomManaCostInput}
                  customDiceSizeIncrease={customDiceSizeIncrease}
                  setCustomDiceSizeIncrease={setCustomDiceSizeIncrease}
                  customDiceSizeIncreaseInput={customDiceSizeIncreaseInput}
                  setCustomDiceSizeIncreaseInput={setCustomDiceSizeIncreaseInput}
                  manaCost={manaCost}
                  diceSizeIncrease={diceSizeIncrease}
                  diceProgressionString={diceProgressionString}
                  validationStatus={validationStatus}
                  selectedRunes={selectedRunes}
                  handleRuneClick={handleRuneClick}
                  clearSpell={clearSpell}
                  handleRemoveRune={handleRemoveRune}
                  maxRunes={maxRunes}
                  displaySpellCircle={displaySpellCircle}
              />
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
                spellCircle={spellCircle}
                setSpellCircle={setSpellCircle}
                spellCircleInput={spellCircleInput}
                setSpellCircleInput={setSpellCircleInput}
                employedRunicMagic={employedRunicMagic}
                setEmployedRunicMagic={setEmployedRunicMagic}
                employedRunicMagicInput={employedRunicMagicInput}
                setEmployedRunicMagicInput={setEmployedRunicMagicInput}
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
