// app/components/ApprovalPending.tsx
// Shows when user account is awaiting approval

'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ApprovalPending() {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Pending Approval
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Thank you for signing up! Your account is currently awaiting approval.
          We'll notify you via email once you've been approved and can start using EVE.
        </p>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your request has been received</li>
            <li>• We typically review accounts within 24 hours</li>
            <li>• You'll receive an email when approved</li>
            <li>• Check your spam folder just in case</li>
          </ul>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          Questions? Contact support at support@yourapp.com
        </p>
      </div>
    </div>
  );
}
