// File: components/ChatInterface.tsx
// --- MODIFIED FILE ---

'use client';

import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { sendMessage } from '@/app/actions';

const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  instruction: z.string(),
});
type Persona = z.infer<typeof personaSchema>;

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
};

const createUniqueId = () => `${Date.now()}-${Math.random()}`;

const getStorageKey = (personaId: string) => {
  const today = new Date().toISOString().split('T')[0];
  return `chat_history_${personaId}_${today}`;
};

export default function ChatInterface({ persona }: { persona: Persona }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') {
      return [{ id: createUniqueId(), role: 'model', content: `Hello! You are now chatting with ${persona.name}.` }];
    }
    try {
      const storageKey = getStorageKey(persona.id);
      const savedHistory = window.localStorage.getItem(storageKey);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          return parsedHistory;
        }
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
    return [{ id: createUniqueId(), role: 'model', content: `Hello! You are now chatting with ${persona.name}.` }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 1) {
      try {
        const storageKey = getStorageKey(persona.id);
        window.localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
      }
    }
  }, [messages, persona.id]);

  // --- FIX APPLIED HERE ---
  // We add the 'biome-ignore' comment to tell the linter that our dependency is intentional.
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want this to run specifically when the number of messages changes.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);
  // --- END OF FIX ---


  const getBotResponse = async (userMessageContent: string, history: Message[]) => {
    // ... (rest of the component is unchanged)
    setIsLoading(true);
    try {
      const historyForApi = history.slice(1).map(({ role, content }) => ({ role, content }));
      const minDelay = new Promise(resolve => setTimeout(resolve, 8000));
      const apiCall = sendMessage(persona.instruction, historyForApi, userMessageContent);
      const [botResponseContent] = await Promise.all([apiCall, minDelay]);
      
      const botMessage: Message = { id: createUniqueId(), role: 'model', content: botResponseContent };
      if (botResponseContent.includes('The model is overloaded')) {
        botMessage.isError = true;
      }
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { id: createUniqueId(), role: 'model', content: "Something went wrong. Please check the console and try again.", isError: true };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: createUniqueId(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const messageToSend = input;
    setInput('');
    await getBotResponse(messageToSend, newMessages);
  };

  const handleRetry = async () => {
    if (isLoading) return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;
    const historyWithoutError = messages.filter(m => !m.isError);
    setMessages(historyWithoutError);
    await getBotResponse(lastUserMessage.content, historyWithoutError);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg whitespace-pre-wrap ${
                msg.isError ? 'bg-red-500 text-white' : msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {msg.content}
              {msg.isError && (
                <div className="mt-2 border-t border-red-300 pt-2">
                    <button type="button" onClick={handleRetry} disabled={isLoading} className="w-full text-center text-sm font-semibold bg-white text-red-600 rounded px-2 py-1 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed">
                        Retry
                    </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                    <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed">
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}