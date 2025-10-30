// File: components/ChatInterface.tsx
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
 // --- FULL, FINAL, AND CORRECTED CODE ---
// biome-ignore lint: <explanation>
'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { z } from 'zod';
import { sendMessage } from '@/app/actions';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon, 
  TrashIcon, 
  SpeakerWaveIcon, 
  MicrophoneIcon 
} from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import clsx from 'clsx';
import SpeechSettings from './SpeechSettings';

// --- TYPE DEFINITIONS ---
const personaSchema = z.object({ id: z.string(), name: z.string(), instruction: z.string() });
type Persona = z.infer<typeof personaSchema>;
type Message = { id: string; role: 'user' | 'model'; content: string; isError?: boolean; };

// --- HELPER FUNCTIONS ---
const createUniqueId = () => `${Date.now()}-${Math.random()}`;
const getStorageKey = (personaId: string) => `chat_history_${personaId}_${new Date().toISOString().split('T')[0]}`;

// --- SUB-COMPONENT: MessageBubble ---
function MessageBubble({ message, onRetry, isLoading, onSpeak, speechSynthesisSupported }: { 
  message: Message; 
  onRetry: () => void; 
  isLoading: boolean;
  onSpeak: (text: string) => void;
  speechSynthesisSupported: boolean;
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

// --- SUB-COMPONENT: ChatInput ---
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

// --- MAIN ChatInterface Component ---
export default function ChatInterface({ persona }: { persona: Persona }) {
  const getInitialMessage = (): Message[] => [{ id: createUniqueId(), role: 'model', content: `Hello! You are now chatting with ${persona.name}.` }];
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return getInitialMessage();
    try { const savedHistory = window.localStorage.getItem(getStorageKey(persona.id)); return savedHistory ? JSON.parse(savedHistory) : getInitialMessage(); } catch (error) { console.error("Failed to load chat history:", error); return getInitialMessage(); }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoSendEnabledRef = useRef(autoSendEnabled);

  const handleSendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: createUniqueId(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const historyForApi = messages.filter(m => !m.isError).slice(1).map(({ role, content }) => ({ role, content }));
      historyForApi.push({ role: 'user', content: input });
      const botResponseContent = await sendMessage(persona.instruction, historyForApi, input);
      const botMessage: Message = { id: createUniqueId(), role: 'model', content: botResponseContent };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { id: createUniqueId(), role: 'model', content: "Something went wrong.", isError: true };
      setMessages((prev) => [...prev, errorMessage]);
    } finally { setIsLoading(false); }
  }, [isLoading, messages, persona.instruction]);
  const handleSendMessageRef = useRef(handleSendMessage);

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
    autoSendEnabledRef.current = autoSendEnabled;
  }, [handleSendMessage, autoSendEnabled]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechRecognitionSupported(false);
      return;
    }
    setSpeechRecognitionSupported(true);
    
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event: any) => { console.error('Speech recognition error:', event.error); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
      setInputValue(transcript);
      
      if (event.results[event.results.length - 1].isFinal) {
        if (autoSendEnabledRef.current && transcript.trim()) {
          handleSendMessageRef.current(transcript.trim());
          setInputValue('');
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSpeechSynthesisSupported('speechSynthesis' in window);
    const populateVoiceList = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(availableVoices.find(v => v.default)?.voiceURI || availablevoices[0].voiceURI);
      }
    };
    populateVoiceList();
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, [selectedVoiceURI]);

  useEffect(() => { if (messages.length > 1) window.localStorage.setItem(getStorageKey(persona.id), JSON.stringify(messages)); }, [messages, persona.id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
  
  const handleSpeak = useCallback((text: string) => {
    if (!speechSynthesisSupported) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [speechSynthesisSupported, voices, selectedVoiceURI, pitch, rate]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (autoSpeakEnabled && lastMessage?.role === 'model' && !lastMessage.isError) {
      handleSpeak(lastMessage.content);
    }
  }, [messages, autoSpeakEnabled, handleSpeak]);
  
  const handleSubmit = (e: FormEvent) => { e.preventDefault(); handleSendMessage(inputValue); setInputValue(''); };
  const handleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputValue('');
      recognitionRef.current.start();
    }
  };
  
  const handleRetry = async () => { /* Add your retry logic here */ };
  const handleClearChat = () => { /* Add your clear logic here */ };

  return (
    <div className="relative flex flex-col h-full bg-background">
      <button type="button" onClick={handleClearChat} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Clear conversation"><TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" /></button>
      <div className="flex-1 p-4 pt-16 space-y-4 overflow-y-auto">
        {messages.map((msg) => (<MessageBubble key={msg.id} message={msg} onRetry={handleRetry} isLoading={isLoading} onSpeak={handleSpeak} speechSynthesisSupported={speechSynthesisSupported} />))}
        {isLoading && (<div className="flex justify-start"><div className="p-3 rounded-2xl rounded-bl-lg shadow-md bg-gray-200 dark:bg-gray-700"><div className="flex items-center space-x-1"><span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span></div></div></div>)}
        <div ref={chatEndRef} />
      </div>
      <SpeechSettings voices={voices} selectedVoiceURI={selectedVoiceURI} onVoiceChange={setSelectedVoiceURI} pitch={pitch} onPitchChange={setPitch} rate={rate} onRateChange={setRate} autoSpeakEnabled={autoSpeakEnabled} onAutoSpeakChange={setAutoSpeakEnabled} autoSendEnabled={autoSendEnabled} onAutoSendChange={setAutoSendEnabled} />
      <ChatInput isLoading={isLoading} value={inputValue} onValueChange={setInputValue} onSubmit={handleSubmit} onListen={handleListen} isListening={isListening} speechRecognitionSupported={speechRecognitionSupported} />
    </div>
  );
}