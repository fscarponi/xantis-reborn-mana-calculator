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
        return increase + 1;
      }
      if (upperRune === 'UUS') {
        return increase + 2;
      }
      return increase;
    }, 0);
};

const DICE_PROGRESSION = [2, 4, 6, 8, 10, 12, 20];
export const DICE_LABELS: { [key: number]: string } = {
  2: 'D2', 4: 'D4', 6: 'D6', 8: 'D8', 10: 'D10', 12: 'D12', 20: 'D20', 100: 'D100'
};

const getDiceStepString = (mainDieValue: number, extraDieValue: number | null): string => {
  const mainDieLabel = DICE_LABELS[mainDieValue] || `D${mainDieValue}`;
  if (extraDieValue !== null) {
    const extraDieLabel = DICE_LABELS[extraDieValue] || `D${extraDieValue}`;
    return `${mainDieLabel} + ${extraDieLabel}`;
  }
  return mainDieLabel;
};

export const getDiceProgressionString = (originalDieValue: number, increase: number): string => {
  if (increase <= 0) {
    return DICE_LABELS[originalDieValue] || `D${originalDieValue}`;
  }

  if (originalDieValue === 100 || DICE_PROGRESSION.indexOf(originalDieValue) === -1) {
    return getDiceStepString(originalDieValue, null);
  }

  const progression: string[] = [];
  let mainDieValue = originalDieValue;
  let extraDieValue: number | null = null;
  
  progression.push(getDiceStepString(mainDieValue, extraDieValue));
  
  for (let i = 0; i < increase; i++) {
    if (extraDieValue !== null) {
      const extraDieIndex = DICE_PROGRESSION.indexOf(extraDieValue);
      if (extraDieIndex !== -1 && extraDieIndex < DICE_PROGRESSION.length - 1) {
        extraDieValue = DICE_PROGRESSION[extraDieIndex + 1];
      }
    } else {
      const mainDieIndex = DICE_PROGRESSION.indexOf(mainDieValue);
      if (mainDieIndex !== -1 && mainDieIndex < DICE_PROGRESSION.length - 1) {
        mainDieValue = DICE_PROGRESSION[mainDieIndex + 1];
      } else if (mainDieValue === 20) {
        extraDieValue = originalDieValue;
      }
    }
    progression.push(getDiceStepString(mainDieValue, extraDieValue));
  }

  const uniqueProgression = [...new Set(progression)];
  return uniqueProgression.join(' → ');
};

export const rollDie = (sides: number): number => {
  if (sides <= 1) return sides > 0 ? 1 : 0;
  return Math.floor(Math.random() * sides) + 1;
};