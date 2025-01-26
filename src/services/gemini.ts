import axios from 'axios';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('EXPO_PUBLIC_GEMINI_API_KEY Umgebungsvariable ist nicht gesetzt');
}
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatContext {
  habits: any[]; // Wird später mit dem korrekten Habit-Typ ersetzt
  habitHistory: any[]; // Wird später mit dem korrekten History-Typ ersetzt
  userName: string;
}

export const generateGeminiResponse = async (
  messages: GeminiMessage[],
  context: ChatContext
): Promise<string> => {
  try {
    console.log('Sende Anfrage an Gemini mit Kontext:', context);
    
    // Bereite den Kontext für Gemini vor
    const contextPrompt = `
      Du bist ein persönlicher Coach für ${context.userName}.
      Aktuelle Gewohnheiten: ${JSON.stringify(context.habits)}
      Verlauf der Gewohnheiten: ${JSON.stringify(context.habitHistory)}
      
      Bitte berücksichtige diese Informationen in deiner Antwort.
      Antworte immer auf Deutsch und in einem motivierenden, unterstützenden Ton.
      Gib konkrete, personalisierte Ratschläge basierend auf den Gewohnheiten.
    `;

    // Füge den gesamten Chat-Verlauf hinzu
    const fullPrompt = `${contextPrompt}\n\nChat-Verlauf:\n${messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n')}`;

    console.log('Vollständiger Prompt:', fullPrompt);

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      }
    );

    console.log('Gemini Antwort:', response.data);

    if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Ungültige Antwortstruktur:', response.data);
      throw new Error('Ungültige Antwort von Gemini');
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Fehler bei der Gemini API-Anfrage:', error.response?.data || error);
    if (error.response?.data?.error?.message) {
      throw new Error(`Gemini Fehler: ${error.response.data.error.message}`);
    }
    throw new Error('Konnte keine Antwort von Gemini generieren');
  }
} 