import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SPACING } from '../theme/theme';
import { HabitHistoryEntry } from '../types/types';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, isSameMonth, isAfter, isBefore, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

interface HabitHistoryProps {
  history: HabitHistoryEntry[];
}

export const HabitHistory: React.FC<HabitHistoryProps> = ({ history }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  
  const startDate = startOfMonth(currentMonth);
  const endDate = isSameMonth(currentMonth, today) ? today : endOfMonth(currentMonth);
  
  // Erstelle ein Array mit allen Tagen im Intervall
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Erstelle eine Map für schnellen Zugriff auf die History-Einträge
  const historyMap = new Map(
    history.map(entry => [entry.date, entry.completed])
  );

  // Gruppiere die Tage nach Wochen
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  dateRange.forEach(date => {
    if (currentWeek.length === 0 && date.getDay() !== 1) {
      // Fülle die erste Woche mit leeren Tagen auf
      for (let i = 0; i < (date.getDay() || 7) - 1; i++) {
        currentWeek.push(null);
      }
    }
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    // Fülle die letzte Woche mit leeren Tagen auf
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (isBefore(nextMonth, addMonths(today, 1))) {
      setCurrentMonth(nextMonth);
    }
  };

  return (
    <View style={styles.container}>
      {/* Monats-Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navigationButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </Text>
        <TouchableOpacity 
          onPress={handleNextMonth} 
          style={styles.navigationButton}
          disabled={isSameMonth(currentMonth, today)}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={isSameMonth(currentMonth, today) ? COLORS.border : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Wochentage-Header */}
      <View style={styles.weekDays}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      {/* Kalender-Grid */}
      <View style={styles.calendar}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((date, dayIndex) => {
              if (!date) {
                return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.emptyDay} />;
              }

              const dateStr = format(date, 'yyyy-MM-dd');
              const isCompleted = historyMap.get(dateStr);
              const isToday = isSameDay(date, today);
              
              return (
                <View
                  key={dateStr}
                  style={[
                    styles.day,
                    isCompleted !== undefined && (
                      isCompleted ? styles.completedDay : styles.missedDay
                    ),
                    isToday && styles.today,
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    isToday && styles.todayText,
                  ]}>
                    {format(date, 'd', { locale: de })}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    width: '100%',
  },
  navigationButton: {
    padding: SPACING.xs,
  },
  monthTitle: {
    ...FONT.medium,
    fontSize: 16,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    gap: 4,
  },
  weekDay: {
    ...FONT.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  calendar: {
    gap: SPACING.xs,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  day: {
    width: 30,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  emptyDay: {
    width: 30,
    height: 30,
  },
  completedDay: {
    backgroundColor: COLORS.success,
  },
  missedDay: {
    backgroundColor: COLORS.border,
  },
  today: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayText: {
    ...FONT.regular,
    fontSize: 12,
    color: COLORS.text,
  },
  todayText: {
    ...FONT.medium,
    color: COLORS.primary,
  },
}); 