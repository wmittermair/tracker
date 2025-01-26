import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { COLORS, FONT, SPACING, TYPOGRAPHY } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { HabitHistory } from './HabitHistory';
import { HabitHistoryEntry } from '../types/types';

interface HabitCardProps {
  title: string;
  description?: string;
  completed: boolean;
  streak: number;
  category?: string;
  history: HabitHistoryEntry[];
  onPress?: () => void;
  onDelete?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  title,
  description,
  completed,
  streak,
  category,
  history,
  onPress,
  onDelete,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.mainContent}>
        <TouchableOpacity 
          onPress={onPress} 
          style={styles.checkButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={completed ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={completed ? COLORS.success : COLORS.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {streak > 0 && (
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={14} color={COLORS.error} />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}
          </View>
          {description && (
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowHistory(!showHistory)}
            style={styles.historyToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showHistory ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showHistory && (
        <View style={styles.historyContainer}>
          <HabitHistory history={history} />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.sm,
  },
  mainContent: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    ...FONT.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  description: {
    ...FONT.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  historyToggle: {
    padding: SPACING.xs,
  },
  historyContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  streakText: {
    ...FONT.medium,
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 4,
  },
}); 