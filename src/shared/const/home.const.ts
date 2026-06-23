export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

export type SampleMeal = {
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Tell us about you',
    description:
      'Enter your height, weight, age and gender. It takes less than a minute and stays private to your account.',
  },
  {
    step: '02',
    title: 'Pick your goal',
    description:
      'Lose weight, gain muscle, maintain, or just eat healthier. Your plan is tuned to the goal you choose.',
  },
  {
    step: '03',
    title: 'Get your 7-day plan',
    description:
      'AI builds a full week of meals with calories, macros, ingredients and step-by-step recipes — instantly.',
  },
];

export const SAMPLE_DAY: SampleMeal[] = [
  { type: 'Breakfast', name: 'Greek Yogurt Power Bowl', calories: 520, protein: 38, carbs: 54, fat: 14 },
  { type: 'Lunch', name: 'Grilled Chicken & Quinoa', calories: 680, protein: 52, carbs: 62, fat: 20 },
  { type: 'Dinner', name: 'Salmon, Sweet Potato & Greens', calories: 720, protein: 46, carbs: 58, fat: 28 },
  { type: 'Snack', name: 'Almonds & Apple', calories: 280, protein: 8, carbs: 30, fat: 16 },
];
