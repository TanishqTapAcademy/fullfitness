export type Goal =
  | 'lose_fat'
  | 'build_muscle'
  | 'get_fit'
  | 'stay_healthy'
  | 'gain_energy'
  | 'mental';

export type Equipment = 'full_gym' | 'home' | 'bodyweight' | 'not_sure';

export type Level = 'beginner' | 'some' | 'consistent' | 'advanced';

export type QuitReason = 'boring' | 'time' | 'results' | 'motivation';

export interface GoalItem {
  id: Goal;
  icon: 'fire' | 'dumbbell' | 'target' | 'heart' | 'bolt' | 'brain';
  label: string;
  desc: string;
}

export interface EquipItem {
  id: Equipment;
  icon: 'gym' | 'home' | 'body' | 'question';
  label: string;
  desc: string;
}

export interface LevelItem {
  id: Level;
  label: string;
  desc: string;
}

export interface QuitOpt {
  id: QuitReason;
  label: string;
}

export const goalData: GoalItem[] = [
  { id: 'lose_fat', icon: 'fire', label: 'Lose fat', desc: 'Cut body fat, look leaner' },
  { id: 'build_muscle', icon: 'dumbbell', label: 'Build muscle', desc: 'Gain size and strength' },
  { id: 'get_fit', icon: 'target', label: 'Get fit', desc: 'Improve overall fitness' },
  { id: 'stay_healthy', icon: 'heart', label: 'Stay healthy', desc: 'Move daily, feel good' },
  { id: 'gain_energy', icon: 'bolt', label: 'More energy', desc: 'Beat fatigue, feel sharp' },
  { id: 'mental', icon: 'brain', label: 'Mental clarity', desc: 'Reduce stress, focus better' },
];

export const equipData: EquipItem[] = [
  { id: 'full_gym', icon: 'gym', label: 'Full gym', desc: 'Access to everything' },
  { id: 'home', icon: 'home', label: 'Home setup', desc: 'Some dumbbells / bands' },
  { id: 'bodyweight', icon: 'body', label: 'Bodyweight', desc: 'No equipment needed' },
  { id: 'not_sure', icon: 'question', label: 'Not sure', desc: "We'll figure it out" },
];

export const levelData: LevelItem[] = [
  { id: 'beginner', label: 'Beginner', desc: "New to training" },
  { id: 'some', label: 'Some experience', desc: 'Trained on and off' },
  { id: 'consistent', label: 'Consistent', desc: 'Train 2-3x a week' },
  { id: 'advanced', label: 'Advanced', desc: '4+ sessions weekly' },
];

export const quitOpts: QuitOpt[] = [
  { id: 'boring', label: 'Got bored' },
  { id: 'time', label: 'No time' },
  { id: 'results', label: 'No results' },
  { id: 'motivation', label: 'Lost motivation' },
];

export const ONBOARDING_STEPS = 8;
