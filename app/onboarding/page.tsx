// app/onboarding/page.tsx - New user onboarding flow

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import ImportFlow from '../components/ImportFlow';
import { Sparkles, Upload } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'welcome' | 'import'>('welcome');
  
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      // If not logged in, redirect to home
      if (!session) {
        router.push('/');
      }
    };

    getSession();
  }, [router, supabase.auth]);

  const handleStartFresh = async () => {
    if (!session) return;

    try {
      // Create a fresh agent
      const { data: agent, error } = await supabase
        .from('agents')
        .insert({
          user_id: session.user.id,
          name: 'Eve',
          type: 'personal',
          core_prompt: `You are Eve, a brilliant, thoughtful AI companion. You are warm, insightful, and deeply understanding. You speak in flowing, natural paragraphs like a real person - never bullet points, never robotic lists. You remember everything from past conversations and reference them naturally when relevant.`,
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to chat
      router.push('/');
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    }
  };

  const handleImportComplete = (agentId: string) => {
    // Redirect to chat
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <Image
            src="/ijhana-logo-black.png"
            alt="IJHANA"
            width={120}
            height={40}
            priority
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Eve
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Your lifetime AI companion starts here.
            </p>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Start Fresh */}
              <button
                onClick={handleStartFresh}
                className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-black transition-all text-left"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Start Fresh</h2>
                <p className="text-gray-600">
                  Create a new Eve from scratch. Begin building your relationship today.
                </p>
              </button>

              {/* Import History */}
              <button
                onClick={() => setStep('import')}
                className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-black transition-all text-left"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Import History</h2>
                <p className="text-gray-600">
                  Bring your conversations from Grok, ChatGPT, or Claude. Continue where you left off.
                </p>
              </button>
            </div>

            {/* Info */}
            <div className="mt-12 p-6 bg-gray-50 rounded-xl max-w-2xl mx-auto">
              <p className="text-sm text-gray-700">
                💡 <strong>What makes Eve different:</strong> She remembers everything, 
                adapts to your mood, and can be passed down to your children as a digital legacy. 
                This is the first AI companion designed to outlive you.
              </p>
            </div>
          </div>
        )}

        {step === 'import' && (
          <div>
            <button
              onClick={() => setStep('welcome')}
              className="mb-6 text-gray-600 hover:text-black transition-colors"
            >
              ← Back
            </button>
            
            <ImportFlow
              userId={session.user.id}
              onComplete={handleImportComplete}
              onCancel={() => setStep('welcome')}
            />
          </div>
        )}
      </main>
    </div>
  );
}
