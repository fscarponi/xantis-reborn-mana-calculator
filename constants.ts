export const RUNES: string[] = [
  'An', 'Bet', 'Corp', 'Des', 'Ex', 'Flam', 'Grau', 'Hur', 'In', 'Jux', 
  'Kal', 'Lor', 'Many', 'Nox', 'Ort', 'Por', 'Quas', 'Rel', 'Sance', 
  'Tim', 'Uus', 'Vas', 'Wis', 'Xen', 'Ylem', 'Zu'
];

export interface DiceOption {
  label: string;
  value: number;
}

export const DICE_OPTIONS: DiceOption[] = [
  { label: 'D2', value: 2 },
  { label: 'D4', value: 4 },
  { label: 'D6', value: 6 },
  { label: 'D8', value: 8 },
  { label: 'D10', value: 10 },
  { label: 'D12', value: 12 },
  { label: 'D20', value: 20 },
  { label: 'D100', value: 100 },
];
