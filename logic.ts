export const calculateManaCost = (highestDieValue: number, skillBonus: number, selectedRunes: string[]): number => {
    const baseCost = highestDieValue + Math.min(selectedRunes.length, skillBonus);
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
