import React, { useMemo, useState, useEffect } from 'react';
import { calculateManaCost, calculateDiceSizeIncrease, getDiceProgressionString, performAdvancedRoll } from './logic';
import type { AdvancedRollResult } from './logic';
import { DICE_OPTIONS } from './constants';
import type { DiceOption } from './constants';
import type { AIResponse } from './useRunicAI';
import { generateAudio } from './tts';


interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

interface RollHelperProps {
  baseDiceString: string;
  flatBonus: number;
}
type RollResult = AdvancedRollResult;

const RollHelper: React.FC<RollHelperProps> = ({ baseDiceString, flatBonus }) => {
  const [bonusDie, setBonusDie] = useState<number>(0);
  const [bondDie, setBondDie] = useState<number>(0);
  const [rollResult, setRollResult] = useState<RollResult | null>(null);

  const actualBaseDice = useMemo(() => {
    const parts = baseDiceString.split('→');
    return parts[parts.length - 1].trim();
  }, [baseDiceString]);
  
  const handleRoll = () => {
    const diceToRoll: { sides: number; label: string }[] = [];
    const baseDiceParts = actualBaseDice.match(/D\d+/g);
    if (baseDiceParts) {
      baseDiceParts.forEach(part => {
        const sides = parseInt(part.substring(1), 10);
        if (!isNaN(sides)) diceToRoll.push({ sides, label: `D${sides}` });
      });
    }

    if (bonusDie > 0) diceToRoll.push({ sides: bonusDie, label: `D${bonusDie} (Aggiuntivo)` });
    if (bondDie > 0) diceToRoll.push({ sides: bondDie, label: `D${bondDie} (Legame)` });

    const result = performAdvancedRoll(diceToRoll, flatBonus);
    setRollResult(result);
  };
  
  const finalFormula = useMemo(() => {
    let formula = actualBaseDice;
    if (bonusDie > 0) formula += ` + D${bonusDie}`;
    if (bondDie > 0) formula += ` + D${bondDie}`;
    if (flatBonus > 0) formula += ` + ${flatBonus}`;
    return formula;
  }, [actualBaseDice, bonusDie, bondDie, flatBonus]);

  const diceOptionsWithNone = [{ label: 'Nessuno', value: 0 }, ...DICE_OPTIONS];
  
  return (
    <>
      <h2 className="font-cinzel text-2xl text-amber-400 mb-4 text-center">Assistente al Tiro Finale</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div>
            <label htmlFor="bonus-die-select-ai" className="block text-sm font-medium text-slate-300 mb-1">Dado Aggiuntivo</label>
            <select id="bonus-die-select-ai" value={bonusDie} onChange={(e) => setBonusDie(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              {diceOptionsWithNone.map(opt => <option key={`bonus-${opt.label}`} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bond-die-select-ai" className="block text-sm font-medium text-slate-300 mb-1">Dado Legame</label>
            <select id="bond-die-select-ai" value={bondDie} onChange={(e) => setBondDie(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              {diceOptionsWithNone.map(opt => <option key={`bond-${opt.label}`} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-md p-4 flex flex-col items-center justify-center h-full">
           <p className="text-sm text-slate-400">Formula di Tiro</p>
           <p className="text-lg font-bold text-amber-300 text-center mb-3">{finalFormula}</p>
           <button onClick={handleRoll} disabled={bonusDie === 0} title={bonusDie === 0 ? "Seleziona un Dado Aggiuntivo per tirare" : "Tira i dadi!"} className="w-full bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition-colors hover:bg-amber-500 disabled:bg-slate-600 disabled:opacity-50">
             Tira i Dadi!
           </button>
           {bonusDie === 0 && <p className="text-xs text-amber-400 mt-2">Seleziona il dado aggiuntivo</p>}
           {rollResult && (
             <div className="mt-4 text-center animate-result-appear w-full">
               <p className="text-sm text-slate-400">Risultato Finale</p>
               <p className="text-4xl font-bold text-white">{rollResult.total}</p>
               <p className="text-xs text-slate-400 truncate" title={rollResult.breakdown}>({rollResult.breakdown})</p>
               {rollResult.history && rollResult.history.length > 0 && (
                <div className="mt-3 text-left bg-slate-800/50 p-2 rounded-md max-h-32 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-300 mb-1 sticky top-0 bg-slate-800/50">Cronologia del Tiro:</p>
                    <ul className="text-xs text-slate-400 space-y-1">
                    {rollResult.history.map((log, index) => (
                        <li key={index} className="whitespace-normal">{log}</li>
                    ))}
                    </ul>
                </div>
               )}
             </div>
           )}
        </div>
      </div>
    </>
  );
};


interface AIWizardProps {
    isActive: boolean;
    highestDieValue: number;
    setHighestDieValue: (value: number) => void;
    skillBonus: number;
    setSkillBonus: (value: number) => void;
    skillBonusInput: string;
    setSkillBonusInput: (value: string) => void;
    spellCircle: number;
    setSpellCircle: (value: number) => void;
    spellCircleInput: string;
    setSpellCircleInput: (value: string) => void;
    employedRunicMagic: number;
    setEmployedRunicMagic: (value: number) => void;
    employedRunicMagicInput: string;
    setEmployedRunicMagicInput: (value: string) => void;
    aiPrompt: string;
    setAiPrompt: (value: string) => void;
    aiResponse: AIResponse | null;
    isLoadingAI: boolean;
    aiError: string | null;
    generateSpell: (prompt: string, spellCircle: number) => void;
}

const MagicParameters: React.FC<Pick<AIWizardProps, 'highestDieValue' | 'setHighestDieValue' | 'skillBonus' | 'skillBonusInput' | 'setSkillBonusInput' | 'setSkillBonus' | 'spellCircle' | 'setSpellCircle' | 'spellCircleInput' | 'setSpellCircleInput' | 'employedRunicMagic' | 'setEmployedRunicMagic' | 'employedRunicMagicInput' | 'setEmployedRunicMagicInput'>> = ({
    highestDieValue,
    setHighestDieValue,
    skillBonus,
    skillBonusInput,
    setSkillBonusInput,
    setSkillBonus,
    spellCircle,
    setSpellCircle,
    spellCircleInput,
    setSpellCircleInput,
    employedRunicMagic,
    setEmployedRunicMagic,
    employedRunicMagicInput,
    setEmployedRunicMagicInput
}) => (
  <Card>
    <h2 className="font-cinzel text-2xl text-amber-400 mb-4">Parametri Magici</h2>
    <div className="space-y-4">
      <div>
        <label htmlFor="dice-select-ai" className="block text-sm font-medium text-slate-300 mb-1">Dado più Alto</label>
        <select id="dice-select-ai" value={highestDieValue} onChange={(e) => setHighestDieValue(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
          {DICE_OPTIONS.map((opt: DiceOption) => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="skill-bonus-ai" className="block text-sm font-medium text-slate-300 mb-1">Valore Magia Runica</label>
        <input id="skill-bonus-ai" type="number" value={skillBonusInput} onChange={(e) => { setSkillBonusInput(e.target.value); const value = parseInt(e.target.value, 10); setSkillBonus(isNaN(value) ? 0 : value); }} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
        <p className="text-xs text-slate-400 mt-1">Determina il massimo per i campi sottostanti.</p>
      </div>
      <div>
        <label htmlFor="spell-circle-ai" className="block text-sm font-medium text-slate-300 mb-1">Circolo Incantesimo</label>
        <input 
          id="spell-circle-ai" 
          type="number" 
          value={spellCircleInput} 
          min="2"
          max={Math.max(2, Math.min(9, skillBonus))}
          onChange={(e) => { 
            setSpellCircleInput(e.target.value); 
            const value = parseInt(e.target.value, 10); 
            setSpellCircle(isNaN(value) ? 2 : value); 
          }} 
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
        />
        <p className="text-xs text-slate-400 mt-1">N. esatto di rune per l'AI (max {Math.max(2, Math.min(9, skillBonus))}).</p>
      </div>
       <div>
        <label htmlFor="employed-runic-magic-ai" className="block text-sm font-medium text-slate-300 mb-1">Valore Magia Runica Impiegata</label>
        <input 
          id="employed-runic-magic-ai" 
          type="number" 
          value={employedRunicMagicInput} 
          min={spellCircle}
          max={skillBonus}
          onChange={(e) => { 
            setEmployedRunicMagicInput(e.target.value); 
            const value = parseInt(e.target.value, 10); 
            setEmployedRunicMagic(isNaN(value) ? spellCircle : value); 
          }} 
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
        />
        <p className="text-xs text-slate-400 mt-1">Determina il costo in mana (min {spellCircle}, max {skillBonus}).</p>
      </div>
    </div>
  </Card>
);


const AILoadingAnimation: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-amber-300 h-full">
        <svg className="animate-spin h-12 w-12 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-cinzel text-lg">Il Mago sta meditando...</p>
    </div>
);

const AIWizard: React.FC<AIWizardProps> = (props) => {
    const { 
        isActive,
        aiPrompt, 
        setAiPrompt, 
        aiResponse, 
        isLoadingAI, 
        aiError, 
        generateSpell, 
        highestDieValue, 
        employedRunicMagic,
        spellCircle
    } = props;
    
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        if (!isActive) {
            setCurrentAudio(null);
        }
    }, [isActive]);
    
    useEffect(() => {
        const audioToCleanUp = currentAudio;
        return () => {
            if (audioToCleanUp) {
                audioToCleanUp.pause();
                URL.revokeObjectURL(audioToCleanUp.src);
            }
        };
    }, [currentAudio]);

    const handlePlayAudio = async (text: string) => {
        setIsAudioLoading(true);
        setAudioError(null);
        setCurrentAudio(null);

        try {
            const audio = await generateAudio(text);
            
            audio.onended = () => setCurrentAudio(null);
            audio.onerror = () => {
                setAudioError("Errore durante la riproduzione dell'audio.");
                setCurrentAudio(null);
            };

            setCurrentAudio(audio);
            await audio.play();

        } catch (error) {
            console.error("OpenAI TTS error:", error);
            setAudioError(error instanceof Error ? error.message : "Impossibile generare la narrazione. Riprova.");
            setCurrentAudio(null);
        } finally {
            setIsAudioLoading(false);
        }
    };

    const calculatedCost = useMemo(() => {
        if (!aiResponse) return 0;
        const runes = aiResponse.runes.split(' ').filter(r => r);
        return calculateManaCost(highestDieValue, employedRunicMagic, runes);
    }, [aiResponse, highestDieValue, employedRunicMagic]);

    const calculatedDiceIncrease = useMemo(() => {
        if (!aiResponse) return 0;
        const runes = aiResponse.runes.split(' ').filter(r => r);
        return calculateDiceSizeIncrease(runes);
    }, [aiResponse]);
    
    const diceProgressionString = useMemo(() => {
        return getDiceProgressionString(highestDieValue, calculatedDiceIncrease);
    }, [highestDieValue, calculatedDiceIncrease]);

    const handleGenerateClick = () => {
        generateSpell(aiPrompt, spellCircle);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
                <MagicParameters {...props} />
                <Card>
                    <h2 className="font-cinzel text-2xl text-amber-400 mb-4">Intenzione Magica</h2>
                    <p className="text-slate-400 text-sm mb-4">Descrivi l'effetto che vuoi ottenere. Il Mago Runico forgerà un incantesimo per te.</p>
                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Es: Voglio creare una piccola illusione per distrarre una guardia..."
                        rows={6}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoadingAI || !aiPrompt.trim()}
                        className="w-full mt-4 bg-amber-600 text-white font-bold py-3 px-4 rounded-md transition-colors hover:bg-amber-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingAI ? 'Meditando...' : 'Crea Magia'}
                    </button>
                    {aiError && <p className="text-red-400 text-sm mt-4 text-center">{aiError}</p>}
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="min-h-[300px] flex flex-col">
                    {isLoadingAI ? (
                        <AILoadingAnimation />
                    ) : aiResponse ? (
                        <div className="flex flex-col h-full">
                             <div className={`grid ${calculatedDiceIncrease > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-6`}>
                                <div className="bg-slate-900/50 p-4 rounded-md text-center">
                                    <h3 className="font-cinzel text-sm text-cyan-400 mb-1">Costo Mana Stimato</h3>
                                    <p className="text-4xl font-bold text-cyan-300">{calculatedCost}</p>
                                </div>
                                {calculatedDiceIncrease > 0 && (
                                    <div className="bg-slate-900/50 p-4 rounded-md text-center">
                                        <h3 className="font-cinzel text-sm text-amber-400 mb-1">Aumento Taglia Dado</h3>
                                        <p className="text-3xl font-bold text-amber-300">+{calculatedDiceIncrease}</p>
                                        <p className="text-lg font-bold text-amber-300 mt-1">
                                            {diceProgressionString}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Ricorda di aggiungere al tiro il dado legame (se usato) e il Valore Magia Runica Impiegata ({employedRunicMagic}).
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6 flex-grow">
                                <div>
                                    <h3 className="font-cinzel text-xl text-amber-400 mb-2">Rune Utilizzate</h3>
                                    <div className="bg-slate-900/50 p-3 rounded-md font-mono text-cyan-300 text-lg tracking-wider flex flex-wrap gap-x-3 gap-y-1">
                                        {aiResponse.runes.split(' ').filter(r => r).map((rune, index) => (
                                            <span
                                                key={`${rune}-${index}`}
                                                className="animate-rune-appear"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                {rune}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-cinzel text-xl text-amber-400 mb-2">Pronuncia</h3>
                                    <p className="font-bold text-2xl text-slate-100">{aiResponse.pronunciation}</p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-cinzel text-xl text-amber-400">Descrizione Scenica</h3>
                                        <button 
                                            onClick={() => handlePlayAudio(aiResponse.pronunciation +': '+ aiResponse.description)} 
                                            disabled={isAudioLoading}
                                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-amber-300 py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Ascolta la descrizione"
                                        >
                                            {isAudioLoading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Generando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Ascolta</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-slate-300 italic">{aiResponse.description}</p>
                                    {audioError && <p className="text-red-400 text-sm mt-2">{audioError}</p>}
                                </div>
                                <div>
                                    <h3 className="font-cinzel text-xl text-amber-400 mb-2">Spiegazione</h3>
                                    <p className="text-slate-400 text-sm">{aiResponse.explanation}</p>
                                </div>
                            </div>
                            <div className="mt-8 border-t border-slate-700 pt-6">
                                <RollHelper 
                                    baseDiceString={diceProgressionString}
                                    flatBonus={employedRunicMagic}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-slate-500 h-full">
                            <h2 className="font-cinzel text-2xl">La Pergamena è Vuota</h2>
                            <p className="mt-2">Scrivi la tua intenzione e il Mago la riempirà con un nuovo incantesimo.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AIWizard;