import { Habit } from '../types/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
}

export const calculateAchievements = (habits: Habit[]): Achievement[] => {
  const achievements: Achievement[] = [];

  // Früher Vogel Achievement (Morgenroutine)
  const morningHabits = habits.filter(h => h.name.toLowerCase().includes('morgen') || 
                                         h.name.toLowerCase().includes('früh'));
  if (morningHabits.length > 0) {
    const completedDays = morningHabits.reduce((acc, habit) => 
      acc + habit.history.filter(entry => entry.completed).length, 0);
    const targetDays = 7;
    achievements.push({
      id: 'early_bird',
      title: 'Früher Vogel',
      description: '7 Tage in Folge Morgenroutine abgeschlossen',
      icon: 'sunny',
      progress: Math.min(completedDays / targetDays, 1),
    });
  }

  // Habit Master Achievement (längster Streak)
  const maxStreak = Math.max(...habits.map(h => h.currentStreak || 0));
  const targetStreak = 30;
  achievements.push({
    id: 'habit_master',
    title: 'Habit Master',
    description: '30 Tage Streak erreichen',
    icon: 'trophy',
    progress: Math.min(maxStreak / targetStreak, 1),
  });

  // Vielfältiger Achiever (Anzahl aktiver Habits)
  const targetHabits = 5;
  achievements.push({
    id: 'diverse_achiever',
    title: 'Vielfältiger Achiever',
    description: '5 aktive Habits pflegen',
    icon: 'grid',
    progress: Math.min(habits.length / targetHabits, 1),
  });

  // Perfektionist (100% Erfolgsquote an einem Tag)
  const hasCompletedAll = habits.length > 0 && 
    habits.every(h => h.completedToday);
  achievements.push({
    id: 'perfectionist',
    title: 'Perfektionist',
    description: 'Alle Habits an einem Tag abschließen',
    icon: 'checkmark-circle',
    progress: hasCompletedAll ? 1 : 
      habits.length > 0 ? habits.filter(h => h.completedToday).length / habits.length : 0,
  });

  // Beständiger Tracker (Gesamtzahl der Einträge)
  const totalEntries = habits.reduce((acc, habit) => 
    acc + habit.history.length, 0);
  const targetEntries = 100;
  achievements.push({
    id: 'consistent_tracker',
    title: 'Beständiger Tracker',
    description: '100 Habit-Einträge erstellen',
    icon: 'analytics',
    progress: Math.min(totalEntries / targetEntries, 1),
  });

  return achievements;
}; 