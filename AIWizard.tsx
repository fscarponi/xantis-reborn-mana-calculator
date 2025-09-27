import React, { useMemo } from 'react';
import { calculateManaCost, calculateDiceSizeIncrease } from './logic';
import { DICE_OPTIONS } from './constants';
import type { DiceOption } from './constants';
import type { AIResponse } from './useRunicAI';


interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

interface AIWizardProps {
    highestDieValue: number;
    setHighestDieValue: (value: number) => void;
    skillBonus: number;
    setSkillBonus: (value: number) => void;
    skillBonusInput: string;
    setSkillBonusInput: (value: string) => void;
    aiPrompt: string;
    setAiPrompt: (value: string) => void;
    aiResponse: AIResponse | null;
    isLoadingAI: boolean;
    aiError: string | null;
    generateSpell: (prompt: string) => void;
}

const MagicParameters: React.FC<AIWizardProps> = ({
    highestDieValue,
    setHighestDieValue,
    skillBonusInput,
    setSkillBonusInput,
    setSkillBonus
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
        <p className="text-xs text-slate-400 mt-1">Usato per calcolare il costo finale in mana.</p>
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
        aiPrompt, 
        setAiPrompt, 
        aiResponse, 
        isLoadingAI, 
        aiError, 
        generateSpell, 
        highestDieValue, 
        skillBonus 
    } = props;

    const calculatedCost = useMemo(() => {
        if (!aiResponse) return 0;
        const runes = aiResponse.runes.split(' ').filter(r => r);
        return calculateManaCost(highestDieValue, skillBonus, runes);
    }, [aiResponse, highestDieValue, skillBonus]);

    const calculatedDiceIncrease = useMemo(() => {
        if (!aiResponse) return 0;
        const runes = aiResponse.runes.split(' ').filter(r => r);
        return calculateDiceSizeIncrease(runes);
    }, [aiResponse]);
    
    const handleGenerateClick = () => {
        generateSpell(aiPrompt);
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
                                        <p className="text-4xl font-bold text-amber-300">+{calculatedDiceIncrease}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6 flex-grow">
                                <div>
                                    <h3 className="font-cinzel text-xl text-amber-400 mb-2">Rune Utilizzate</h3>
                                    <p className="bg-slate-900/50 p-3 rounded-md font-mono text-cyan-300 text-lg tracking-wider">{aiResponse.runes}</p>
                                </div>
                                <div>
                                    <h3 className="font-cinzel text-xl text-amber-400 mb-2">Pronuncia</h3>
                                    <p className="font-bold text-2xl text-slate-100">{aiResponse.pronunciation}</p>
                                </div>
                                <div>
                                    <h3 className="font-cinzel text-xl text-amber-400 mb-2">Descrizione Scenica</h3>
                                    <p className="text-slate-300 italic">{aiResponse.description}</p>
                                </div>
                                <div>
                                    <h3 className="font-cinzel text-xl text-amber-400 mb-2">Spiegazione</h3>
                                    <p className="text-slate-400 text-sm">{aiResponse.explanation}</p>
                                </div>
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