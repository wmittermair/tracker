import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SPACING, TYPOGRAPHY } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { PageContainer } from '../components/PageContainer';
import { useAuth } from '../firebase/auth';
import { loadHabits } from '../firebase/habits';
import { Habit } from '../types/types';
import { generateGeminiResponse, GeminiMessage, ChatContext } from '../services/gemini';
import { saveMessage, getChatHistory } from '../firebase/chat';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const CoachChatScreen = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserHabits();
      loadChatHistory();
    }
  }, [user]);

  const loadUserHabits = async () => {
    if (!user) return;
    const loadedHabits = await loadHabits(user.uid);
    setHabits(loadedHabits);
  };

  const loadChatHistory = async () => {
    if (!user) return;
    try {
      const history = await getChatHistory(user.uid);
      setMessages(history);
    } catch (error) {
      console.error('Fehler beim Laden des Chat-Verlaufs:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const userMessage: GeminiMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, userMessage]);
      await saveMessage(user.uid, userMessage);
      setMessage('');

      const context: ChatContext = {
        habits,
        habitHistory: [],
        userName: user.displayName || 'Nutzer',
      };

      const aiResponse = await generateGeminiResponse([...messages, userMessage], context);
      
      const assistantMessage: GeminiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      };

      await saveMessage(user.uid, assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header title="Coach Chat" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chat-Bereich */}
        <View style={styles.section}>
          {messages.length > 0 ? (
            <>
              {messages.map((msg, index) => {
                const messageDate = new Date(msg.timestamp);
                const showDate = index === 0 || new Date(messages[index - 1].timestamp).toDateString() !== messageDate.toDateString();
                
                return (
                  <React.Fragment key={msg.timestamp}>
                    {showDate && (
                      <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>
                          {format(messageDate, 'd.M.yyyy', { locale: de })}
                        </Text>
                      </View>
                    )}
                    <View 
                      style={[
                        styles.messageContainer,
                        msg.role === 'user' ? styles.userMessageContainer : styles.coachMessageContainer
                      ]}
                    >
                      <View style={msg.role === 'user' ? styles.userMessage : styles.coachMessage}>
                        <Text style={msg.role === 'user' ? styles.userMessageText : styles.messageText}>
                          {msg.content}
                        </Text>
                        <Text style={[
                          styles.timeText,
                          msg.role === 'user' ? styles.userTimeText : styles.coachTimeText
                        ]}>
                          {format(messageDate, 'HH:mm')}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}

              {isLoading && (
                <View style={[styles.messageContainer, styles.coachMessageContainer]}>
                  <View style={[styles.coachMessage, { width: '80%' }]}>
                    <Text style={styles.messageText}>Coach schreibt gerade...</Text>
                    <Text style={styles.coachTimeText}>
                      {format(new Date(), 'HH:mm')}
                    </Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              <Card variant="elevated" style={styles.chatCard}>
                <View style={styles.messageContainer}>
                  <View style={styles.coachMessage}>
                    <Text style={styles.messageText}>
                      Hallo! Ich bin dein persönlicher Coach. Wie kann ich dir heute helfen?
                    </Text>
                    <Text style={styles.coachTimeText}>
                      {format(new Date(), 'HH:mm')}
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Tipps - nur anzeigen wenn noch keine Nachrichten existieren */}
              <Card variant="elevated" style={styles.tipsCard}>
                <View style={styles.tipContent}>
                  <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                  <Text style={styles.tipTitle}>So nutzt du den Coach</Text>
                  <Text style={styles.tipText}>
                    • Stelle konkrete Fragen zu deinen Habits{'\n'}
                    • Bitte um Tipps zur Verbesserung{'\n'}
                    • Teile deine Erfolge und Herausforderungen
                  </Text>
                </View>
              </Card>
            </>
          )}
        </View>
      </ScrollView>

      {/* Chat Input */}
      <Card style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Schreibe eine Nachricht..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim() || isLoading}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={!message.trim() || isLoading ? COLORS.textSecondary : COLORS.background} 
          />
        </TouchableOpacity>
      </Card>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: COLORS.border + '30',
  },
  section: {
    padding: SPACING.md,
  },
  messageContainer: {
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  coachMessageContainer: {
    alignItems: 'flex-start',
  },
  coachMessage: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    borderRadius: 12,
    maxWidth: '80%',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    borderRadius: 12,
    maxWidth: '80%',
    borderTopRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 20,
  },
  userMessageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    lineHeight: 20,
  },
  chatCard: {
    backgroundColor: 'transparent',
    marginBottom: SPACING.md,
    shadowOpacity: 0,
  },
  tipsCard: {
    marginTop: SPACING.lg,
  },
  tipContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  tipTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'left',
    marginTop: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    maxHeight: 100,
    padding: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  sendButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.border + '50',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  userTimeText: {
    color: COLORS.background + '90',
  },
  coachTimeText: {
    color: COLORS.textSecondary,
  },
}); 