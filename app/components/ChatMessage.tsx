// app/components/ChatMessage.tsx - Individual chat message bubble

'use client';

import { Message } from '@/types';
import { Volume2 } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
  onSpeak?: (text: string) => void;
}

export default function ChatMessage({ message, onSpeak }: ChatMessageProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const isUser = message.role === 'user';

  const handleSpeak = async () => {
    if (onSpeak && !isSpeaking) {
      setIsSpeaking(true);
      await onSpeak(message.content);
      setIsSpeaking(false);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {/* Message bubble */}
        <div
          className={`chat-bubble ${
            isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* Metadata (time + speak button for assistant) */}
        <div className="flex items-center gap-2 mt-1 px-2">
          {message.timestamp && (
            <span className="text-xs text-gray-400">
              {formatTime(message.timestamp)}
            </span>
          )}
          
          {/* Speak button (only for assistant messages) */}
          {!isUser && onSpeak && (
            <button
              onClick={handleSpeak}
              disabled={isSpeaking}
              className={`text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1 ${
                isSpeaking ? 'animate-pulse-subtle' : ''
              }`}
              title="Speak this message"
            >
              <Volume2 size={14} />
              {isSpeaking ? 'Speaking...' : 'Speak'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
