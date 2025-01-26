import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING, TYPOGRAPHY } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, logoutUser } from '../firebase/auth';
import { PageContainer } from '../components/PageContainer';
import { loadHabits } from '../firebase/habits';
import { calculateAchievements } from '../utils/achievements';
import { Habit } from '../types/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ProfileStackParamList = {
  ProfileMain: undefined;
  UpdateEmail: undefined;
  UpdatePassword: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const ProfileScreen = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const loadedHabits = await loadHabits(user.uid);
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const achievements = calculateAchievements(habits);

  // Berechne Statistiken aus den echten Daten
  const stats = {
    daysActive: habits.reduce((acc, habit) => 
      acc + habit.history.filter(entry => entry.completed).length, 0),
    habitsCompleted: habits.filter(h => h.completedToday).length,
    longestStreak: Math.max(...habits.map(h => h.currentStreak || 0), 0),
  };

  return (
    <PageContainer>
      <Header title="Profil" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profil Header */}
        <View style={styles.profileHeader}>
          <View style={styles.emailContainer}>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('UpdateEmail')}
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('UpdatePassword')}
            style={styles.passwordLink}
          >
            <Text style={styles.passwordLinkText}>Passwort ändern</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiken */}
        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.daysActive}</Text>
              <Text style={styles.statLabel}>Aktive Tage</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.habitsCompleted}</Text>
              <Text style={styles.statLabel}>Heute erledigt</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.longestStreak}</Text>
              <Text style={styles.statLabel}>Längster Streak</Text>
            </View>
          </View>
        </Card>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.map(achievement => (
            <Card key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementHeader}>
                <View style={styles.achievementIcon}>
                  <Ionicons name={achievement.icon as any} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${achievement.progress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(achievement.progress * 100)}%
              </Text>
            </Card>
          ))}
        </View>

        {/* Abmelden Button */}
        <View style={styles.actions}>
          <Button
            title="Abmelden"
            variant="secondary"
            onPress={logoutUser}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  editButton: {
    padding: SPACING.xs,
  },
  passwordLink: {
    marginTop: SPACING.sm,
  },
  passwordLinkText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  statsCard: {
    marginHorizontal: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.border,
  },
  section: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  achievementCard: {
    marginBottom: SPACING.md,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...FONT.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  achievementDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  actions: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
}); 