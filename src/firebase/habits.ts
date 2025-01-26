import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from './config';
import { Habit, HabitHistoryEntry } from '../types/types';

const COLLECTION_NAME = 'habits';

// Test-Funktion
export const testFirestore = async () => {
  try {
    const testData = {
      name: "Test Habit",
      createdAt: Timestamp.now(),
      streak: 0,
      lastCompletedDate: null,
      history: []
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), testData);
    console.log("Test-Dokument erstellt mit ID:", docRef.id);
    
    // Direkt wieder löschen
    await deleteDoc(doc(db, COLLECTION_NAME, docRef.id));
    console.log("Test-Dokument erfolgreich gelöscht");
    
    return true;
  } catch (error) {
    console.error("Firestore-Test fehlgeschlagen:", error);
    return false;
  }
};

// Habit hinzufügen
export const addHabit = async (userId: string, name: string): Promise<Habit> => {
  const habitData = {
    name,
    userId,
    completedToday: false,
    currentStreak: 0,
    history: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), habitData);
  return { ...habitData, id: docRef.id };
};

// Alle Habits laden
export const loadHabits = async (userId: string): Promise<Habit[]> => {
  const habitsQuery = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(habitsQuery);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  } as Habit));
};

// Berechnet den aktuellen Streak basierend auf der History
const calculateStreak = (history: HabitHistoryEntry[]): number => {
  const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
  const todayStr = localDate.toISOString().split('T')[0];
  
  // Wenn heute noch nicht erledigt, prüfe ab gestern
  let currentDate = todayStr;
  
  for (const entry of sortedHistory) {
    if (entry.date === currentDate && entry.completed) {
      streak++;
      // Berechne das vorherige Datum
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = prevDate.toISOString().split('T')[0];
    } else if (entry.date === currentDate && !entry.completed) {
      break;
    } else if (entry.date < currentDate) {
      break;
    }
  }
  
  return streak;
};

// Habit als erledigt/nicht erledigt markieren
export const toggleHabit = async (habit: Habit) => {
  // Erstelle ein Datum im lokalen Zeitzonenkontext
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
  const dateStr = localDate.toISOString().split('T')[0];

  const habitRef = doc(db, COLLECTION_NAME, habit.id);
  const newCompletedState = !habit.completedToday;
  
  const historyEntry = {
    date: dateStr,
    completed: newCompletedState,
    timestamp: new Date(),
  };

  // Entferne vorherige Einträge von heute
  const filteredHistory = habit.history.filter(entry => 
    entry.date !== dateStr
  );

  const updatedHistory = [...filteredHistory, historyEntry];
  const currentStreak = calculateStreak(updatedHistory);

  await updateDoc(habitRef, {
    completedToday: newCompletedState,
    history: updatedHistory,
    currentStreak,
    updatedAt: new Date(),
  });

  return {
    ...habit,
    completedToday: newCompletedState,
    history: updatedHistory,
    currentStreak,
    updatedAt: new Date(),
  };
};

// Habit löschen
export const deleteHabit = async (habitId: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, habitId));
};

export const getHabits = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Fehler beim Laden der Gewohnheiten:', error);
    throw error;
  }
}; 