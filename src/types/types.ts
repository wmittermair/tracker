import { Timestamp } from 'firebase/firestore';

// Einzelner Eintrag in der History eines Habits
export interface HabitHistoryEntry {
  date: string;
  completed: boolean;
  timestamp: Date;
}

// Hauptstruktur eines Habits
export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  completedToday: boolean;
  currentStreak: number;
  userId: string;
  history: HabitHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// Props für die HabitItem Komponente
export interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// Props für die HabitList Komponente
export interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// Form-Daten für das Erstellen eines neuen Habits
export interface NewHabitFormData {
  name: string;
} 