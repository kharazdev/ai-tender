// File: components/ChatInterface.tsx
// --- UPDATED AND SIMPLIFIED FILE ---
'use client';

import { FormEvent, RefObject, useEffect, useRef } from 'react';
import { z } from 'zod';
import { 
  PaperAirplaneIcon, ArrowPathIcon, ExclamationCircleIcon, 
  SpeakerWaveIcon, MicrophoneIcon 
} from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import clsx from 'clsx';

// --- TYPE DEFINITIONS ---
type Message = { id: string; role: 'user' | 'model'; content: string; isError?: boolean; };

// --- SUB-COMPONENT: MessageBubble (Unchanged) ---
function MessageBubble({ message, onRetry, isLoading, onSpeak, speechSynthesisSupported }: { 
  message: Message; onRetry: () => void; isLoading: boolean; onSpeak: (text: string) => void; speechSynthesisSupported: boolean;
}) {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const bubbleClasses = clsx('w-fit max-w-md lg:max-w-xl p-3 rounded-2xl shadow-md break-words', {
    'bg-blue-600 text-white rounded-br-lg': isUser,
    'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg': !isUser && !isError,
    'bg-red-500 text-white rounded-bl-lg': isError,
  });
  return (
    <div className={clsx('flex w-full items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && !isError && speechSynthesisSupported && (
        <button type="button" onClick={() => onSpeak(message.content)} className="p-2 text-gray-400 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Read message aloud">
          <SpeakerWaveIcon className="h-5 w-5" />
        </button>
      )}
      <div className={bubbleClasses || ''}>
        {isError ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-2"><ExclamationCircleIcon className="h-5 w-5" /><p>{message.content}</p></div>
            <button type="button" onClick={onRetry} disabled={isLoading} className="mt-2 flex items-center justify-center gap-2 rounded-md bg-white/20 px-2 py-1 text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50">
              <ArrowPathIcon className="h-4 w-4" /> Retry
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

// --- SUB-COMPONENT: ChatInput (Unchanged) ---
function ChatInput({ isLoading, value, onValueChange, onSubmit, onListen, isListening, speechRecognitionSupported }: { 
  isLoading: boolean; value: string; onValueChange: (value: string) => void; onSubmit: (e: FormEvent) => void; onListen: () => void; isListening: boolean; speechRecognitionSupported: boolean; 
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; } }, [value]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e); } };
  return (
    <form onSubmit={onSubmit} className="p-4 border-t bg-background dark:border-gray-700">
      <div className="relative flex items-end gap-2">
        {speechRecognitionSupported && (
          <button type="button" onClick={onListen} className={clsx("p-2 rounded-full transition-colors", isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600')} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
            <MicrophoneIcon className="h-5 w-5" />
          </button>
        )}
        <textarea ref={textareaRef} value={value} onChange={(e) => onValueChange(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} placeholder="Type or click the mic to talk..." rows={1} className="flex-1 p-2 pr-12 text-base resize-none border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <button type="submit" disabled={isLoading || !value.trim()} className="absolute right-2 bottom-1.5 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

// --- PROPS FOR THE MAIN COMPONENT ---
interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  inputValue: string;
  onValueChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onListen: () => void;
  isListening: boolean;
  speechRecognitionSupported: boolean;
  onRetry: () => void;
  onSpeak: (text: string) => void;
  speechSynthesisSupported: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
}

// --- MAIN (SIMPLIFIED) ChatInterface Component ---
export default function ChatInterface({
  messages, isLoading, inputValue, onValueChange, onSubmit, onListen, 
  isListening, speechRecognitionSupported, onRetry, onSpeak, 
  speechSynthesisSupported, chatEndRef
}: ChatInterfaceProps) {
  return (
    <main className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onRetry={onRetry} isLoading={isLoading} onSpeak={onSpeak} speechSynthesisSupported={speechSynthesisSupported} />
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
      <ChatInput
        isLoading={isLoading}
        value={inputValue}
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        onListen={onListen}
        isListening={isListening}
        speechRecognitionSupported={speechRecognitionSupported}
      />
    </main>
  );
}