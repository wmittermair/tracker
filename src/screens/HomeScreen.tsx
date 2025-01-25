import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { HabitItem } from '../components/HabitItem';
import { Habit } from '../types/types';
import { addHabit, loadHabits, toggleHabit, deleteHabit, testFirestore } from '../firebase/habits';

export const HomeScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Habits beim Start laden
  useEffect(() => {
    const init = async () => {
      try {
        // Firestore-Test durchführen
        const testResult = await testFirestore();
        if (!testResult) {
          setError('Firestore-Verbindung fehlgeschlagen');
          setLoading(false);
          return;
        }

        const loadedHabits = await loadHabits();
        setHabits(loadedHabits);
        setError(null);
      } catch (error) {
        console.error('Fehler beim Laden der Habits:', error);
        setError('Fehler beim Laden der Habits');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleAddHabit = async () => {
    if (newHabitName.trim()) {
      try {
        const newHabit = await addHabit(newHabitName.trim());
        setHabits([newHabit, ...habits]);
        setNewHabitName('');
        setError(null);
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Habits:', error);
        setError('Fehler beim Hinzufügen des Habits');
      }
    }
  };

  const handleToggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      try {
        await toggleHabit(habit);
        const updatedHabits = habits.map(h => {
          if (h.id === id) {
            const now = new Date();
            return {
              ...h,
              lastCompletedDate: h.lastCompletedDate ? null : now,
              streak: h.lastCompletedDate ? 0 : h.streak + 1,
              history: [
                ...h.history,
                {
                  date: now.toISOString().split('T')[0],
                  completed: !h.lastCompletedDate,
                  timestamp: now
                }
              ]
            };
          }
          return h;
        });
        setHabits(updatedHabits);
        setError(null);
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Habits:', error);
        setError('Fehler beim Aktualisieren des Habits');
      }
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits(habits.filter(habit => habit.id !== id));
      setError(null);
    } catch (error) {
      console.error('Fehler beim Löschen des Habits:', error);
      setError('Fehler beim Löschen des Habits');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newHabitName}
          onChangeText={setNewHabitName}
          placeholder="Neuer Habit..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddHabit}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.habitList}>
        {habits.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    margin: 10,
    borderRadius: 4,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  habitList: {
    flex: 1,
  },
}); 