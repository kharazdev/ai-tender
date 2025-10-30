// File: components/SpeechSettings.tsx
// --- MODIFIED FILE ---

'use client';

import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

// Define the shape of the props this component expects
interface SpeechSettingsProps {
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onVoiceChange: (uri: string) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  // --- NEW PROPS FOR AUTO FEATURES ---
  autoSpeakEnabled: boolean;
  onAutoSpeakChange: (enabled: boolean) => void;
  autoSendEnabled: boolean;
  onAutoSendChange: (enabled: boolean) => void;
}

export default function SpeechSettings({
  voices,
  selectedVoiceURI,
  onVoiceChange,
  pitch,
  onPitchChange,
  rate,
  onRateChange,
  // --- NEW PROPS ---
  autoSpeakEnabled,
  onAutoSpeakChange,
  autoSendEnabled,
  onAutoSendChange,
}: SpeechSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (voices.length === 0) {
    return null;
  }

  return (
    <div className="relative p-4 border-t bg-background dark:border-gray-700">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <Cog6ToothIcon className="h-5 w-5" />
        Speech Settings
      </button>

      {isOpen && (
        <div className="mt-4 p-4 space-y-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
           <button 
             type="button"
             onClick={() => setIsOpen(false)}
             className="absolute top-10 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
           >
             <XMarkIcon className="h-5 w-5" />
           </button>
          
          <div>
            <label htmlFor="voice-select" className="block text-sm font-medium mb-1">
              Voice
            </label>
            <select
              id="voice-select"
              value={selectedVoiceURI}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-500"
            >
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {`${voice.name} (${voice.lang})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rate-slider" className="block text-sm font-medium mb-1">
              Speed: {rate.toFixed(1)}
            </label>
            <input
              id="rate-slider"
              type="range" min="0.5" max="2" step="0.1"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
            />
          </div>

          <div>
            <label htmlFor="pitch-slider" className="block text-sm font-medium mb-1">
              Pitch: {pitch.toFixed(1)}
            </label>
            <input
              id="pitch-slider"
              type="range" min="0" max="2" step="0.1"
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
            />
          </div>

          {/* --- NEW CHECKBOXES FOR AUTO FEATURES --- */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={autoSpeakEnabled}
                onChange={(e) => onAutoSpeakChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Auto-speak responses</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={autoSendEnabled}
                onChange={(e) => onAutoSendChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Auto-send after speaking</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}