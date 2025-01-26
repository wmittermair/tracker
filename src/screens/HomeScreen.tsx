import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { COLORS, FONT, SPACING, TYPOGRAPHY } from '../theme/theme';
import { Header } from '../components/Header';
import { HabitCard } from '../components/HabitCard';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../firebase/auth';
import { addHabit, loadHabits, toggleHabit, deleteHabit } from '../firebase/habits';
import { Habit } from '../types/types';
import { Button } from '../components/Button';
import { AddHabitDialog } from '../components/AddHabitDialog';
import { PageContainer } from '../components/PageContainer';

export const HomeScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHabitData();
    } else {
      setHabits([]);
    }
  }, [user]);

  const loadHabitData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const loadedHabits = await loadHabits(user.uid);
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Fehler beim Laden der Habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async (name: string) => {
    if (!user) return;
    try {
      const newHabit = await addHabit(user.uid, name);
      setHabits(prevHabits => [newHabit, ...prevHabits]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Habits:', error);
    }
  };

  const handleToggleHabit = async (habit: Habit) => {
    try {
      const updatedHabit = await toggleHabit(habit);
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habit.id ? updatedHabit : h
        )
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Habits:', error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Habits:', error);
    }
  };

  // Berechne Statistiken aus den echten Daten
  const stats = {
    completionRate: habits.length > 0 
      ? Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100)
      : 0,
    currentStreak: Math.max(...habits.map(h => h.currentStreak || 0), 0),
    totalHabits: habits.length,
  };

  return (
    <PageContainer>
      <Header
        title="Meine Habits"
        rightAction={{
          icon: 'add-circle',
          onPress: () => setShowAddDialog(true),
          size: 48,
          color: '#6c5ce7',
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistik-Übersicht */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>Erfolgsquote</Text>
              <Text style={styles.statDescription}>
                Prozentsatz der heute erledigten Habits
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Längster Streak</Text>
              <Text style={styles.statDescription}>
                Längste Serie aller Habits
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="list" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.totalHabits}</Text>
              <Text style={styles.statLabel}>Habits</Text>
              <Text style={styles.statDescription}>
                Aktive Habits
              </Text>
            </View>
          </Card>
        </View>

        {/* Tägliche Übersicht */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Heute</Text>
        </View>

        {/* Habit Cards */}
        <View style={styles.habitsContainer}>
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              title={habit.name}
              description={habit.description}
              completed={habit.completedToday}
              streak={habit.currentStreak}
              category={habit.category}
              history={habit.history}
              onPress={() => handleToggleHabit(habit)}
              onDelete={() => handleDeleteHabit(habit.id)}
            />
          ))}

          {habits.length === 0 && !isLoading && (
            <Card style={styles.emptyStateCard}>
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={48} color={COLORS.primary} />
                <Text style={styles.emptyStateTitle}>Keine Habits vorhanden</Text>
                <Text style={styles.emptyStateText}>
                  Fügen Sie Ihren ersten Habit hinzu, um Ihre Ziele zu erreichen.
                </Text>
                <Button
                  title="Habit hinzufügen"
                  onPress={() => setShowAddDialog(true)}
                  style={styles.emptyStateButton}
                />
              </View>
            </Card>
          )}

          {habits.length > 0 && (
            <Card style={styles.motivationCard}>
              <View style={styles.motivationContent}>
                <Ionicons name="trophy" size={32} color={COLORS.warning} />
                <Text style={styles.motivationTitle}>Gut gemacht!</Text>
                <Text style={styles.motivationText}>
                  Sie sind auf dem besten Weg, Ihre Ziele zu erreichen. Machen Sie weiter so!
                </Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      <AddHabitDialog
        visible={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddHabit}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: SPACING.md,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  habitsContainer: {
    padding: SPACING.md,
  },
  emptyStateCard: {
    margin: SPACING.md,
    padding: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  motivationCard: {
    margin: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  motivationContent: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  motivationTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  motivationText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  statDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
}); 