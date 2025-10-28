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

// --- STEP 1: ENHANCED MESSAGE TYPE ---
// Add a unique ID for React keys and an optional error flag.
type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
};

// --- HELPER FUNCTION TO CREATE UNIQUE IDS ---
const createUniqueId = () => `${Date.now()}-${Math.random()}`;

export default function ChatInterface({ persona }: { persona: Persona }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: createUniqueId(),
      role: 'model',
      content: `Hello! You are now chatting with ${persona.name}.`,
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this to run when message count changes.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // --- CORE LOGIC TO SUBMIT MESSAGE AND GET RESPONSE ---
  const getBotResponse = async (userMessageContent: string, history: Message[]) => {
    setIsLoading(true);
    try {
      // Prepare the history for the API call (all messages except the initial greeting)
      const historyForApi = history.slice(1).map(({ role, content }) => ({ role, content }));

      // --- STEP 2: IMPLEMENT 8-SECOND MINIMUM DELAY ---
      const minDelay = new Promise(resolve => setTimeout(resolve, 3000));
      const apiCall = sendMessage(persona.instruction, historyForApi, userMessageContent);

      // Wait for both the API call and the minimum delay to complete
      const [botResponseContent] = await Promise.all([apiCall, minDelay]);
      
      const botMessage: Message = {
        id: createUniqueId(),
        role: 'model',
        content: botResponseContent,
      };

      // --- STEP 3: CHECK FOR SPECIFIC ERROR MESSAGE ---
      if (botResponseContent.includes('The model is overloaded')) {
        botMessage.isError = true;
      }
      
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: createUniqueId(),
        role: 'model',
        content: "Something went wrong. Please check the console and try again.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: createUniqueId(),
      role: 'user',
      content: input,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const messageToSend = input;
    setInput('');

    await getBotResponse(messageToSend, newMessages);
  };

  // --- STEP 4: CREATE THE RETRY HANDLER ---
  const handleRetry = async () => {
    if (isLoading) return;

    // Find the last message sent by the user
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove the error message from the chat history
    const historyWithoutError = messages.filter(m => !m.isError);
    setMessages(historyWithoutError);

    // Resubmit the last user message
    await getBotResponse(lastUserMessage.content, historyWithoutError);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
         {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg whitespace-pre-wrap ${
                msg.isError 
                    ? 'bg-red-500 text-white' 
                    : msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {msg.content}
              {/* --- STEP 5: RENDER RETRY BUTTON ON ERROR --- */}
              {msg.isError && (
                <div className="mt-2 border-t border-red-300 pt-2">
                    <button 
                        type="button"
                        onClick={handleRetry}
                        disabled={isLoading}
                        className="w-full text-center text-sm font-semibold bg-white text-red-600 rounded px-2 py-1 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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