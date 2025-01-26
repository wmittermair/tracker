import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../firebase/auth';
import { generateGeminiResponse, GeminiMessage, ChatContext } from '../services/gemini';
import { saveMessage, getChatHistory } from '../firebase/chat';
import { loadHabits } from '../firebase/habits';

export const CoachChatScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Lade Chat-Verlauf beim Start und wenn sich der User ändert
  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      setMessages([]);
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    try {
      console.log('Lade Chat-Verlauf...');
      const history = await getChatHistory(user.uid);
      console.log('Chat-Verlauf geladen:', history.length, 'Nachrichten');
      setMessages(history);
    } catch (error: any) {
      console.error('Fehler beim Laden des Chat-Verlaufs:', error);
      // Zeige Fehlermeldung nur an, wenn es nicht der Index-Fehler ist
      if (!error.message?.includes('Index fehlt')) {
        const errorMessage: GeminiMessage = {
          role: 'assistant',
          content: `Fehler beim Laden des Chat-Verlaufs: ${error.message}`,
          timestamp: Date.now(),
        };
        setMessages([errorMessage]);
      }
    } finally {
      setIsInitialLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const userMessage: GeminiMessage = {
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    try {
      setIsLoading(true);
      
      // Speichere User-Nachricht
      console.log('Speichere User-Nachricht:', userMessage);
      setMessages(prev => [...prev, userMessage]);
      const messageId = await saveMessage(user.uid, userMessage);
      console.log('User-Nachricht gespeichert mit ID:', messageId);
      setInputText('');

      // Hole Kontext für Gemini
      console.log('Lade Habits für Kontext...');
      const habits = await loadHabits(user.uid);
      console.log('Geladene Habits:', habits);
      
      const context: ChatContext = {
        habits,
        habitHistory: [], // TODO: Implementiere Habit-History
        userName: user.displayName || 'Nutzer',
      };

      console.log('Sende Anfrage an Gemini...');
      const aiResponse = await generateGeminiResponse([...messages, userMessage], context);
      console.log('Gemini Antwort erhalten:', aiResponse);
      
      const assistantMessage: GeminiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      };

      console.log('Speichere Assistenten-Nachricht:', assistantMessage);
      const assistantMessageId = await saveMessage(user.uid, assistantMessage);
      console.log('Assistenten-Nachricht gespeichert mit ID:', assistantMessageId);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Fehler im Chat:', error);
      // Zeige Fehlermeldung an
      const errorMessage: GeminiMessage = {
        role: 'assistant',
        content: `Entschuldigung, es gab einen Fehler: ${error.message}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: GeminiMessage }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.timestamp.toString()}
        style={styles.chatList}
        inverted={false}
        contentContainerStyle={styles.chatListContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nachricht an deinen Coach..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Senden</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatListContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
}); 