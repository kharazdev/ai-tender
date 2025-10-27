// File: components/ChatInterface.tsx

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
  role: 'user' | 'model';
  content: string;
};

export default function ChatInterface({ persona }: { persona: Persona }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello! You are now chatting with ${persona.name}.`,
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        // Prepare the history for the API call (without the initial greeting)
        const historyForApi = newMessages.slice(1);
        
        // Call the server action and wait for the response
        const botResponseContent = await sendMessage(persona.instruction, historyForApi, input);
        
        const botMessage: Message = { role: 'model', content: botResponseContent };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: Message = { role: 'model', content: "Something went wrong. Please try again." };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
         {messages.map((msg, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {msg.content}
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