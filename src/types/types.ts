import { Timestamp } from 'firebase/firestore';

// Einzelner Eintrag in der History eines Habits
export interface HabitEntry {
  date: string;
  completed: boolean;
  timestamp: Date;
}

// Hauptstruktur eines Habits
export interface Habit {
  id: string;
  name: string;
  createdAt: Date | Timestamp;
  streak: number;
  lastCompletedDate: Date | null;
  history: HabitEntry[];
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