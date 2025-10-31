// File: components/ChatView.tsx
// --- FINAL CORRECTED FILE ---
'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { z } from 'zod';
import { sendMessage } from '@/app/actions';
import ChatHeader from './ChatHeader';
import ChatInterface from './ChatInterface';

// --- TYPE DEFINITIONS ---
const personaSchema = z.object({
  id: z.string(), name: z.string(), instruction: z.string(),
  types: z.array(z.string()), categories: z.array(z.string()),
});
type Persona = z.infer<typeof personaSchema>;
type Message = { id: string; role: 'user' | 'model'; content: string; isError?: boolean; };

// --- HELPER FUNCTIONS ---
const createUniqueId = () => `${Date.now()}-${Math.random()}`;
const getStorageKey = (personaId: string) => `chat_history_${personaId}_${new Date().toISOString().split('T')[0]}`;

export default function ChatView({ persona }: { persona: Persona }) {
  // --- STATE MANAGEMENT ---
  const getInitialMessage = useCallback((): Message[] => [{ id: createUniqueId(), role: 'model', content: `Hello! You are now chatting with ${persona.name}.` }], [persona.name]);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return getInitialMessage();
    try {
      const savedHistory = window.localStorage.getItem(getStorageKey(persona.id));
      return savedHistory ? JSON.parse(savedHistory) : getInitialMessage();
    } catch (error) {
      console.error("Failed to load chat history:", error);
      return getInitialMessage();
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Speech Synthesis State
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [pitch, setPitch] = useState(1.6); // <-- UPDATED DEFAULT
  const [rate, setRate] = useState(1.1); // <-- UPDATED DEFAULT
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);

  // Speech Recognition State
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoSendEnabledRef = useRef(autoSendEnabled);

  // --- CORE LOGIC & HANDLERS ---
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

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); handleSendMessage(inputValue); setInputValue(''); };
  
  const handleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
            window.speechSynthesis.cancel(); // <-- ADD THIS LINE

      setInputValue('');
      recognitionRef.current.start();
    }
  };

  const handleRetry = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => !m.isError));
      await handleSendMessage(lastUserMessage.content);
    }
  };

  const handleClearChat = () => {
    window.speechSynthesis.cancel();
    window.localStorage.removeItem(getStorageKey(persona.id));
    setMessages(getInitialMessage());
  };

  // --- LIFECYCLE & EFFECTS ---
  useEffect(() => { handleSendMessageRef.current = handleSendMessage; autoSendEnabledRef.current = autoSendEnabled; }, [handleSendMessage, autoSendEnabled]);
  useEffect(() => { if (messages.length > 1) window.localStorage.setItem(getStorageKey(persona.id), JSON.stringify(messages)); }, [messages, persona.id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (autoSpeakEnabled && lastMessage?.role === 'model' && !lastMessage.isError) {
      handleSpeak(lastMessage.content);
    }
  }, [messages, autoSpeakEnabled, handleSpeak]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) { setSpeechRecognitionSupported(false); return; }
    setSpeechRecognitionSupported(true);
    
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = false; recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => { console.error('Speech recognition error:', event.error); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join('');
      setInputValue(transcript);
      if (event.results[event.results.length - 1].isFinal && autoSendEnabledRef.current && transcript.trim()) {
        handleSendMessageRef.current(transcript.trim());
        setInputValue('');
      }
    };
  }, []);

  useEffect(() => {
    setSpeechSynthesisSupported('speechSynthesis' in window);
    const populateVoiceList = () => {
      if (!('speechSynthesis' in window)) return;
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;

      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoiceURI) {
        const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'susan', 'fiona', 'samantha'];
        const femaleVoice = availableVoices.find(voice =>
          femaleKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
        );

        if (femaleVoice) {
          setSelectedVoiceURI(femaleVoice.voiceURI);
        } else {
          const defaultVoice = availableVoices.find(v => v.default);
          setSelectedVoiceURI(defaultVoice?.voiceURI || availableVoices[0].voiceURI);
        }
      }
    };
    
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    populateVoiceList();

  }, [selectedVoiceURI]);

  // --- RENDER ---
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      <ChatHeader
        persona={persona}
        onClearChat={handleClearChat}
        voices={voices}
        selectedVoiceURI={selectedVoiceURI}
        onVoiceChange={setSelectedVoiceURI}
        pitch={pitch}
        onPitchChange={setPitch}
        rate={rate}
        onRateChange={setRate}
        autoSpeakEnabled={autoSpeakEnabled}
        onAutoSpeakChange={setAutoSpeakEnabled}
        autoSendEnabled={autoSendEnabled}
        onAutoSendChange={setAutoSendEnabled}
      />
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        inputValue={inputValue}
        onValueChange={setInputValue}
        onSubmit={handleSubmit}
        onListen={handleListen}
        isListening={isListening}
        speechRecognitionSupported={speechRecognitionSupported}
        onRetry={handleRetry}
        onSpeak={handleSpeak}
        speechSynthesisSupported={speechSynthesisSupported}
        chatEndRef={chatEndRef}
      />
    </div>
  );
}