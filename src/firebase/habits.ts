import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from './config';
import { Habit, HabitEntry } from '../types/types';

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
export const addHabit = async (name: string): Promise<Habit> => {
  const habitData = {
    name,
    createdAt: Timestamp.now(),
    streak: 0,
    lastCompletedDate: null,
    history: []
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), habitData);
  return {
    id: docRef.id,
    ...habitData,
    history: []
  };
};

// Alle Habits laden
export const loadHabits = async (): Promise<Habit[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Habit[];
};

// Habit als erledigt/nicht erledigt markieren
export const toggleHabit = async (habit: Habit): Promise<void> => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Wenn der Habit bereits heute abgeschlossen wurde
  const lastCompletedDate = habit.lastCompletedDate ? new Date(habit.lastCompletedDate) : null;
  const lastCompletedDay = lastCompletedDate?.toISOString().split('T')[0];
  
  const entry: HabitEntry = {
    date: today,
    completed: !habit.lastCompletedDate || lastCompletedDay !== today,
    timestamp: now
  };

  // Streak-Logik
  let newStreak = habit.streak;
  if (!habit.lastCompletedDate || lastCompletedDay !== today) {
    // Wenn der Habit noch nicht heute abgeschlossen wurde, erhöhe den Streak
    newStreak = habit.streak + 1;
  } else {
    // Wenn der Habit bereits heute abgeschlossen wurde, setze den Streak zurück
    newStreak = 0;
  }

  const docRef = doc(db, COLLECTION_NAME, habit.id);
  await updateDoc(docRef, {
    lastCompletedDate: !habit.lastCompletedDate || lastCompletedDay !== today ? now : null,
    streak: newStreak,
    history: [...habit.history, entry]
  });
};

// Habit löschen
export const deleteHabit = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}; 