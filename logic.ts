export const calculateManaCost = (highestDieValue: number, employedRunicMagic: number, selectedRunes: string[]): number => {
    const baseCost = highestDieValue + employedRunicMagic;
    return selectedRunes.reduce((cost, rune) => {
      const upperRune = rune.toUpperCase();
      if (upperRune === 'VAS') {
        return cost * 2;
      }
      if (upperRune === 'UUS') {
        return cost * 3;
      }
      return cost;
    }, baseCost);
};

export const calculateDiceSizeIncrease = (selectedRunes: string[]): number => {
    return selectedRunes.reduce((increase, rune) => {
      const upperRune = rune.toUpperCase();
      if (upperRune === 'VAS') {
        return increase + 2;
      }
      if (upperRune === 'UUS') {
        return increase + 3;
      }
      return increase;
    }, 0);
};

const DICE_PROGRESSION = [2, 4, 6, 8, 10, 12, 20];
export const DICE_LABELS: { [key: number]: string } = {
  2: 'D2', 4: 'D4', 6: 'D6', 8: 'D8', 10: 'D10', 12: 'D12', 20: 'D20', 100: 'D100'
};

const formatDiceList = (dice: number[]): string => {
  return dice
    .map(d => DICE_LABELS[d] || `D${d}`)
    .join(' + ');
};

export const getDiceProgressionString = (originalDieValue: number, increase: number): string => {
  if (increase <= 0) {
    return DICE_LABELS[originalDieValue] || `D${originalDieValue}`;
  }

  if (originalDieValue === 100 || DICE_PROGRESSION.indexOf(originalDieValue) === -1) {
    return DICE_LABELS[originalDieValue] || `D${originalDieValue}`;
  }

  const progression: string[] = [];
  let currentDice: number[] = [originalDieValue];
  
  progression.push(formatDiceList(currentDice));
  
  for (let i = 0; i < increase; i++) {
    const smallestDieValue = Math.min(...currentDice);
    const dieToUpgradeIndex = currentDice.indexOf(smallestDieValue);
    
    const progressionIndex = DICE_PROGRESSION.indexOf(smallestDieValue);

    if (progressionIndex === -1 || progressionIndex === DICE_PROGRESSION.length - 1) {
      currentDice.push(originalDieValue);
    } else {
      currentDice[dieToUpgradeIndex] = DICE_PROGRESSION[progressionIndex + 1];
    }
    
    currentDice.sort((a, b) => b - a);
    progression.push(formatDiceList(currentDice));
  }

  const uniqueProgression = [...new Set(progression)];
  return uniqueProgression.join(' → ');
};

export const rollDie = (sides: number): number => {
  if (sides <= 1) return sides > 0 ? 1 : 0;
  return Math.floor(Math.random() * sides) + 1;
};


export interface AdvancedRollResult {
  total: number;
  breakdown: string;
  history: string[];
}

export const performAdvancedRoll = (
  diceToRoll: { sides: number; label: string }[],
  flatBonus: number
): AdvancedRollResult => {
  const history: string[] = [];
  const breakdownParts: string[] = [];
  
  if (diceToRoll.length === 0) {
    history.push('Nessun dado da tirare.');
    if (flatBonus > 0) {
       breakdownParts.push(`${flatBonus} (Fisso)`);
    }
    return {
      total: flatBonus,
      breakdown: breakdownParts.join(''),
      history,
    };
  }
  
  const initialRolls = diceToRoll.map(d => ({ ...d, result: rollDie(d.sides) }));
  const initialRollValues = initialRolls.map(r => r.result);
  
  history.push(`Tiro iniziale: ${initialRolls.map(r => `${r.result} [${r.label}]`).join(', ')}`);
  initialRolls.forEach(r => breakdownParts.push(`${r.result} [${r.label}]`));

  const allRolledValues = [...initialRollValues];
  
  const counts: { [key: number]: number } = {};
  initialRollValues.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  
  let shouldExplode = Object.values(counts).some(count => count > 1);

  if (shouldExplode) {
    const highestDieSides = Math.max(...diceToRoll.map(d => d.sides));

    while (shouldExplode) {
      history.push('💥 Scoppia! Che culo!');
      
      const extraDieRoll = rollDie(highestDieSides);
      history.push(`Tiro extra (D${highestDieSides}): Risultato ${extraDieRoll}`);
      
      breakdownParts.push(`${extraDieRoll} [D${highestDieSides} Esplosivo!]`);
      
      allRolledValues.push(extraDieRoll);

      if (
        initialRollValues.includes(extraDieRoll) ||
        extraDieRoll === 1 ||
        extraDieRoll === highestDieSides
      ) {
        // Loop continues
      } else {
        shouldExplode = false;
      }
    }
  }

  const totalFromDice = allRolledValues.reduce((sum, value) => sum + value, 0);
  const total = totalFromDice + flatBonus;
  
  if (flatBonus > 0) {
    breakdownParts.push(`${flatBonus} (Fisso)`);
  }
  
  const breakdown = breakdownParts.join(' + ');

  return { total, breakdown, history };
};
