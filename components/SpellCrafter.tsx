import React from 'react';
import { RUNES, DICE_OPTIONS } from '../constants';
import type { DiceOption } from '../constants';
import type { Mode } from '../types';
import Card from './Card';
import OrsattiAudioPlayer from './OrsattiAudioPlayer';
import RollHelper from './RollHelper';

interface SpellCrafterProps {
    mode: Mode;
    isOrsattiAudioPlaying: boolean;
    onTogglePlay: () => void;
    highestDieValue: number;
    setHighestDieValue: (value: number) => void;
    skillBonus: number;
    setSkillBonus: (value: number) => void;
    skillBonusInput: string;
    setSkillBonusInput: (value: string) => void;
    employedRunicMagic: number;
    setEmployedRunicMagic: (value: number) => void;
    employedRunicMagicInput: string;
    setEmployedRunicMagicInput: (value: string) => void;
    customManaCost: number;
    setCustomManaCost: (value: number) => void;
    customManaCostInput: string;
    setCustomManaCostInput: (value: string) => void;
    customDiceSizeIncrease: number;
    setCustomDiceSizeIncrease: (value: number) => void;
    customDiceSizeIncreaseInput: string;
    setCustomDiceSizeIncreaseInput: (value: string) => void;
    manaCost: number;
    diceSizeIncrease: number;
    diceProgressionString: string;
    validationStatus: { message: string; color: string; isValid: boolean; };
    selectedRunes: string[];
    handleRuneClick: (rune: string, event: React.MouseEvent<HTMLButtonElement>) => void;
    clearSpell: () => void;
    handleRemoveRune: (index: number) => void;
    maxRunes: number;
    displaySpellCircle: number;
}

const SpellCrafter: React.FC<SpellCrafterProps> = ({
    mode, isOrsattiAudioPlaying, onTogglePlay, highestDieValue, setHighestDieValue,
    skillBonus, setSkillBonus, skillBonusInput, setSkillBonusInput,
    employedRunicMagic, setEmployedRunicMagic, employedRunicMagicInput, setEmployedRunicMagicInput,
    customManaCost, setCustomManaCost, customManaCostInput, setCustomManaCostInput,
    customDiceSizeIncrease, setCustomDiceSizeIncrease, customDiceSizeIncreaseInput, setCustomDiceSizeIncreaseInput,
    manaCost, diceSizeIncrease, diceProgressionString, validationStatus,
    selectedRunes, handleRuneClick, clearSpell, handleRemoveRune, maxRunes,
    displaySpellCircle
}) => {
    const isOrsattiMode = mode === 'orsatti';
    const minEmployed = displaySpellCircle > 0 ? displaySpellCircle : 2;
    const finalDiceIncrease = isOrsattiMode ? customDiceSizeIncrease : diceSizeIncrease;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            {isOrsattiMode ? (
              <OrsattiAudioPlayer isPlaying={isOrsattiAudioPlaying} onTogglePlay={onTogglePlay} />
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
                    <p className="text-xs text-slate-400 mt-1">Determina il n. massimo di rune (max 9).</p>
                  </div>
                   <div>
                    <label htmlFor="employed-runic-magic" className="block text-sm font-medium text-slate-300 mb-1">Valore Magia Runica Impiegata</label>
                    <input 
                      id="employed-runic-magic" 
                      type="number" 
                      value={employedRunicMagicInput} 
                      min={minEmployed}
                      max={skillBonus}
                      onChange={(e) => { 
                        setEmployedRunicMagicInput(e.target.value); 
                        const value = parseInt(e.target.value, 10); 
                        setEmployedRunicMagic(isNaN(value) ? minEmployed : value); 
                      }} 
                      className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                    />
                    <p className="text-xs text-slate-400 mt-1">Determina il costo in mana (min {minEmployed}, max {skillBonus}).</p>
                  </div>
                </div>
              </Card>
            )}
            <Card className="text-center">
              <h2 className={`font-cinzel text-xl ${isOrsattiMode ? 'text-purple-400' : 'text-cyan-400'} mb-2`}>{isOrsattiMode ? 'Inserisci il mana che vuoi spendere' : 'Costo Punti Mana'}</h2>
              {isOrsattiMode ? <input type="number" value={customManaCostInput} onChange={(e) => { setCustomManaCostInput(e.target.value); const value = parseInt(e.target.value, 10); setCustomManaCost(isNaN(value) ? 0 : value); }} aria-label="Costo mana personalizzato" className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white text-6xl font-bold text-center text-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /> : <p className={`text-6xl font-bold text-cyan-300 transition-all duration-300 ${!validationStatus.isValid ? 'opacity-50' : 'opacity-100'}`} title={validationStatus.isValid ? `Costo: ${manaCost}` : 'Crea un incantesimo valido per vedere il costo finale'}>{validationStatus.isValid ? manaCost : '??'}</p>}
              <p className={`mt-2 text-sm ${validationStatus.color}`}>{validationStatus.message}</p>
              {(finalDiceIncrease > 0 || isOrsattiMode) && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  {isOrsattiMode ? (
                    <>
                      <h3 className="font-cinzel text-base text-amber-400">Aumento Taglia Dado</h3>
                      <p className="text-xs text-slate-400 mb-2">Inserisci le taglie che desideri</p>
                      <input type="number" value={customDiceSizeIncreaseInput} onChange={(e) => { setCustomDiceSizeIncreaseInput(e.target.value); const value = parseInt(e.target.value, 10); setCustomDiceSizeIncrease(isNaN(value) ? 0 : value); }} aria-label="Aumento taglia dado personalizzato" className="w-full bg-slate-900/50 border border-slate-700 rounded-md py-1 px-3 text-white text-2xl font-bold text-center text-amber-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      {customDiceSizeIncrease > 0 && (
                        <p className="text-xl font-bold text-amber-300 mt-2">
                          {diceProgressionString}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="font-cinzel text-base text-amber-400">Aumento Taglia Dado</h3>
                      <p className="text-2xl font-bold text-amber-300">+{diceSizeIncrease}</p>
                      <p className="text-xl font-bold text-amber-300 mt-1">
                        {diceProgressionString}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Ricorda di aggiungere al tiro il dado legame (se usato) e il Valore Magia Runica Impiegata ({employedRunicMagic}).
                      </p>
                    </>
                  )}
                </div>
              )}
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`font-cinzel text-2xl ${isOrsattiMode ? 'text-purple-400' : 'text-cyan-400'}`}>Componi Incantesimo</h2>
                {selectedRunes.length > 0 && <button onClick={clearSpell} className="text-sm bg-red-800/50 hover:bg-red-700/70 text-red-200 py-1 px-3 rounded-md transition-colors">Svuota</button>}
              </div>
              {isOrsattiMode && <p className="text-amber-300 italic text-sm text-center mb-4 border border-amber-500/50 bg-amber-900/20 p-3 rounded-md">"Sei nella modalita' Orsatti, il custode delle regole e delle verita', non esistono vincoli e catene per lui"</p>}
              <div className="bg-slate-900/50 border border-slate-700 rounded-md min-h-[80px] p-3 mb-6 flex flex-wrap gap-2 items-center">
                {selectedRunes.length === 0 ? <span className="text-slate-500">Seleziona le rune qui sotto...</span> : selectedRunes.map((rune, index) => <button key={`${rune}-${index}`} onClick={() => handleRemoveRune(index)} title={`Rimuovi ${rune}`} aria-label={`Rimuovi runa ${rune}`} className="group bg-cyan-900/70 text-cyan-200 font-bold py-1 pl-3 pr-2 rounded-full text-lg flex items-center transition-colors hover:bg-red-800/60 hover:text-red-100"><span>{rune}</span><span aria-hidden="true" className="ml-1.5 text-sm opacity-70 group-hover:opacity-100">×</span></button>)}
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-2">
                {RUNES.map(rune => { const isDisabled = !isOrsattiMode && selectedRunes.length >= maxRunes; return <button key={rune} onClick={(e) => handleRuneClick(rune, e)} disabled={isDisabled} className={`p-2 aspect-square rounded-md flex items-center justify-center font-bold text-lg transition-all duration-200 ${isOrsattiMode ? 'bg-slate-700 hover:bg-purple-500' : 'bg-slate-700 hover:bg-slate-600'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>{rune}</button>; })}
              </div>
              {(validationStatus.isValid || isOrsattiMode) && (
                <div className="mt-8 border-t border-slate-700 pt-6">
                    <RollHelper 
                        baseDiceString={diceProgressionString}
                        flatBonus={employedRunicMagic}
                        mode={mode}
                    />
                </div>
              )}
            </Card>
          </div>
        </div>
    );
};

export default SpellCrafter;
