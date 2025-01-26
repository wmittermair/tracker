import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { COLORS, FONT, SPACING, TYPOGRAPHY } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { PageContainer } from '../components/PageContainer';

export const CoachScreen = () => {
  return (
    <PageContainer>
      <Header
        title="Coach"
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistik-Übersicht */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="analytics" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Analysen</Text>
              <Text style={styles.statDescription}>
                Personalisierte Auswertungen
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Verbesserungen</Text>
              <Text style={styles.statDescription}>
                Optimierte Habits
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Empfehlungen</Text>
              <Text style={styles.statDescription}>
                Neue Vorschläge
              </Text>
            </View>
          </Card>
        </View>

        {/* Hauptinhalt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tägliche Analyse</Text>
          <Card variant="elevated" style={styles.analysisCard}>
            <View style={styles.analysisContent}>
              <Ionicons name="analytics" size={24} color={COLORS.primary} />
              <Text style={styles.analysisTitle}>Ihre Fortschritte</Text>
              <Text style={styles.analysisText}>
                Hier werden bald Ihre personalisierten Analysen und Empfehlungen erscheinen.
              </Text>
            </View>
          </Card>
        </View>

        {/* Motivation */}
        <Card style={styles.motivationCard}>
          <View style={styles.motivationContent}>
            <Ionicons name="trophy" size={32} color={COLORS.warning} />
            <Text style={styles.motivationTitle}>Ihr persönlicher Coach</Text>
            <Text style={styles.motivationText}>
              Ich analysiere Ihre Habits und gebe Ihnen personalisierte Tipps, 
              um Ihre Ziele zu erreichen.
            </Text>
          </View>
        </Card>
      </ScrollView>
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
  statDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  analysisCard: {
    marginBottom: SPACING.md,
  },
  analysisContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  analysisTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  analysisText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  motivationCard: {
    margin: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  motivationContent: {
    alignItems: 'center',
    padding: SPACING.lg,
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
}); 