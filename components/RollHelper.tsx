import React, { useState, useMemo } from 'react';
import { DICE_OPTIONS } from '../constants';
import { performAdvancedRoll } from '../logic';
import type { AdvancedRollResult } from '../logic';
import type { Mode } from '../types';

interface RollHelperProps {
  baseDiceString: string;
  flatBonus: number;
  mode: Mode;
}

type RollResult = AdvancedRollResult;

const RollHelper: React.FC<RollHelperProps> = ({ baseDiceString, flatBonus, mode }) => {
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
  
  const colors = {
    standard: { text: 'text-cyan-400', ring: 'focus:ring-cyan-500', border: 'focus:border-cyan-500', button: 'bg-cyan-600 hover:bg-cyan-500', formula: 'text-cyan-300' },
    orsatti: { text: 'text-purple-400', ring: 'focus:ring-purple-500', border: 'focus:border-purple-500', button: 'bg-purple-600 hover:bg-purple-500', formula: 'text-purple-300' },
    ai: { text: 'text-amber-400', ring: 'focus:ring-amber-500', border: 'focus:border-amber-500', button: 'bg-amber-600 hover:bg-amber-500', formula: 'text-amber-300' },
  };
  const theme = colors[mode] || colors.standard;
  
  return (
    <>
      <h3 className={`font-cinzel text-xl ${theme.text} mb-3 text-center`}>Assistente al Tiro Finale</h3>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label htmlFor="bonus-die-select" className="block text-xs font-medium text-slate-300 mb-1">Dado Aggiuntivo</label>
          <select id="bonus-die-select" value={bonusDie} onChange={(e) => setBonusDie(Number(e.target.value))} className={`w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 ${theme.ring} ${theme.border} text-sm`}>
            {diceOptionsWithNone.map(opt => <option key={`bonus-${opt.label}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="bond-die-select" className="block text-xs font-medium text-slate-300 mb-1">Dado Legame</label>
          <select id="bond-die-select" value={bondDie} onChange={(e) => setBondDie(Number(e.target.value))} className={`w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 ${theme.ring} ${theme.border} text-sm`}>
            {diceOptionsWithNone.map(opt => <option key={`bond-${opt.label}`} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex-shrink-0">
          <button onClick={handleRoll} disabled={bonusDie === 0} title={bonusDie === 0 ? "Seleziona un Dado Aggiuntivo per tirare" : "Tira i dadi!"} className={`w-full sm:w-auto ${theme.button} text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:opacity-50 h-[38px] flex items-center justify-center`}>
              Tira!
          </button>
        </div>
      </div>

       <div className="text-center mt-3">
        <p className="text-xs text-slate-400">Formula: <span className={`text-sm font-bold ${theme.formula}`}>{finalFormula}</span></p>
      </div>

      {bonusDie === 0 && <p className="text-xs text-amber-400 mt-2 text-center">Seleziona il dado aggiuntivo per tirare</p>}

      {rollResult && (
        <div className="mt-4 text-center animate-result-appear w-full">
          <div className="border-t border-slate-700/50 my-3"></div>
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
    </>
  );
};

export default RollHelper;
