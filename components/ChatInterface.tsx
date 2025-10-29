// File: components/ChatInterface.tsx
// --- FULL, FINAL, AND UNCOMMENTED CODE ---

'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { z } from 'zod';
import { sendMessage } from '@/app/actions';
import { PaperAirplaneIcon, ArrowPathIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import clsx from 'clsx';

// --- TYPE DEFINITIONS ---
const personaSchema = z.object({ id: z.string(), name: z.string(), instruction: z.string() });
type Persona = z.infer<typeof personaSchema>;
type Message = { id: string; role: 'user' | 'model'; content: string; isError?: boolean; };

// --- HELPER FUNCTIONS ---
const createUniqueId = () => `${Date.now()}-${Math.random()}`;
const getStorageKey = (personaId: string) => {
  const today = new Date().toISOString().split('T')[0];
  return `chat_history_${personaId}_${today}`;
};

// --- SUB-COMPONENT: MessageBubble ---
// This component handles the rendering and styling of a single chat message.
function MessageBubble({ message, onRetry, isLoading }: { message: Message; onRetry: () => void; isLoading: boolean }) {
  const isUser = message.role === 'user';
  const isError = message.isError;
  
  const bubbleClasses = clsx(
    'w-fit max-w-md lg:max-w-xl p-3 rounded-2xl shadow-md break-words',
    {
      'bg-blue-600 text-white rounded-br-lg': isUser,
      'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg': !isUser && !isError,
      'bg-red-500 text-white rounded-bl-lg': isError,
    }
  );

  return (
    <div className={clsx('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={bubbleClasses|| ''}>
        {isError ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5" />
              <p>{message.content}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-white/20 px-2 py-1 text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert prose-p:my-0 prose-pre:my-2 prose-pre:bg-gray-800 dark:prose-pre:bg-black/20 prose-pre:p-2 prose-pre:rounded-md">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: ChatInput ---
// This component handles the text area, auto-growing, and send logic.
function ChatInput({ isLoading, onSubmit }: { isLoading: boolean; onSubmit: (value: string) => void; }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(value);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background dark:border-gray-700">
      <div className="relative flex items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 p-2 pr-12 text-base resize-none border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute right-2 bottom-1.5 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}


// --- MAIN ChatInterface Component ---
export default function ChatInterface({ persona }: { persona: Persona }) {
  const getInitialMessage = (): Message[] => [{ id: createUniqueId(), role: 'model', content: `Hello! You are now chatting with ${persona.name}.` }];

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') {
      return getInitialMessage();
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
    return getInitialMessage();
  });
  
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want this to run specifically when the number of messages changes.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const getBotResponse = async (userMessageContent: string) => {
    setIsLoading(true);
    try {
      const historyForApi = messages.filter(m => !m.isError).slice(1).map(({ role, content }) => ({ role, content }));
      historyForApi.push({ role: 'user', content: userMessageContent });
      
      const botResponseContent = await sendMessage(persona.instruction, historyForApi, userMessageContent);
      
      const botMessage: Message = { id: createUniqueId(), role: 'model', content: botResponseContent };
      if (botResponseContent.includes('The model is overloaded')) {
        botMessage.isError = true;
      }
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { id: createUniqueId(), role: 'model', content: "Something went wrong. Please try again.", isError: true };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: createUniqueId(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    await getBotResponse(input);
  };

  const handleRetry = async () => {
    if (isLoading) return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;
    
    const historyWithoutError = messages.filter(m => !m.isError);
    setMessages(historyWithoutError);

    await getBotResponse(lastUserMessage.content);
  };

  const handleClearChat = () => {
    try {
      const storageKey = getStorageKey(persona.id);
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear chat history from localStorage", error);
    }
    setMessages(getInitialMessage());
  };

  return (
    <div className="relative flex flex-col h-full bg-background">
      <button
        type="button"
        onClick={handleClearChat}
        className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Clear conversation"
      >
        <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>

      <div className="flex-1 p-4 pt-16 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={handleRetry} isLoading={isLoading} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl rounded-bl-lg shadow-md bg-gray-200 dark:bg-gray-700">
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

      <ChatInput isLoading={isLoading} onSubmit={handleSendMessage} />
    </div>
  );
}