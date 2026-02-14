// app/page.tsx - Main chat interface for Eve v2

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { getDefaultMood } from '@/lib/mood';
import { getVoiceForMood } from '@/lib/voice';
import { Mood, Message, VoiceMode } from '@/types';
import AgeGate from './components/AgeGate';
import CookieBanner from './components/CookieBanner';
import MoodControl from './components/MoodControl';
import VoiceControl from './components/VoiceControl';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import SettingsPanel from './components/SettingsPanel';
import { LogOut, Settings } from 'lucide-react';

export default function Home() {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Agent state
  const [agentName, setAgentName] = useState('Eve');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // Mood & Voice state
  const [mood, setMood] = useState<Mood>(getDefaultMood());
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('auto');
  const [lockedVoiceId, setLockedVoiceId] = useState<string>();
  
  // UI state
  const [showMoodControls, setShowMoodControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      // Load agent name
      if (session) {
        const { data: agent } = await supabase
          .from('agents')
          .select('name')
          .eq('user_id', session.user.id)
          .eq('type', 'personal')
          .single();
        
        if (agent?.name) {
          setAgentName(agent.name);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Sign in with Google
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessages([]);
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!session) {
      alert('Please sign in to chat with Eve');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages,
          mood,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Optionally speak the response
      if (data.response) {
        speakText(data.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Text-to-speech
  const speakText = async (text: string) => {
    const voiceConfig = getVoiceForMood(mood, lockedVoiceId);
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: voiceConfig.settings,
          }),
        }
      );

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <>
        <AgeGate />
        <CookieBanner />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <Image
              src="/ijhana-logo-black.png"
              alt="IJHANA"
              width={300}
              height={100}
              className="mx-auto mb-8"
            />
            
            <h1 className="text-4xl font-bold mb-4">Welcome to Eve</h1>
            <p className="text-gray-600 mb-8">
              Your lifetime AI companion. Build a relationship that grows deeper over time 
              and can be passed to future generations.
            </p>

            <button
              onClick={handleSignIn}
              className="w-full bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all"
            >
              Sign in with Google
            </button>

            <p className="text-xs text-gray-500 mt-4">
              By signing in, you agree to our{' '}
              <a href="/terms" className="underline">Terms</a> and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </>
    );
  }

  // Main chat interface
  return (
    <>
      <AgeGate />
      <CookieBanner />
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/ijhana-logo-black.png"
                alt="IJHANA"
                width={120}
                height={40}
                priority
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Settings button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Settings"
              >
                <Settings size={20} />
              </button>

              {/* User info */}
              <div className="text-sm text-gray-700">
                {session.user.email}
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 max-w-7xl w-full mx-auto flex gap-4 p-4 overflow-hidden">
          {/* Sidebar (Mood & Voice controls) */}
          <aside className={`w-80 flex-shrink-0 overflow-y-auto ${showSettings ? '' : 'hidden lg:block'}`}>
            <div className="space-y-4 sticky top-0">
              <MoodControl
                mood={mood}
                onMoodChange={setMood}
                collapsed={!showMoodControls}
                onToggleCollapse={() => setShowMoodControls(!showMoodControls)}
              />

              <VoiceControl
                voiceMode={voiceMode}
                lockedVoiceId={lockedVoiceId}
                currentMood={mood}
                onVoiceModeChange={setVoiceMode}
                onLockedVoiceChange={setLockedVoiceId}
              />
            </div>
          </aside>

          {/* Chat area */}
          <main className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-2">Chat with {agentName}</h2>
                  <p className="text-gray-600">
                    Start a conversation. {agentName} remembers everything.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage
                    key={idx}
                    message={msg}
                    onSpeak={msg.role === 'assistant' ? speakText : undefined}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={isSending}
              placeholder={isSending ? `${agentName} is thinking...` : `Message ${agentName}...`}
            />
          </main>
        </div>

        {/* Settings Panel Modal */}
        {showSettings && (
          <SettingsPanel
            userId={session.user.id}
            onClose={() => setShowSettings(false)}
            onImportComplete={(agentId) => {
              setShowSettings(false);
              // Optionally refresh page or show success message
            }}
          />
        )}
      </div>
    </>
  );
}
