import { useState } from 'react';
import { TermsOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';
import { supabase } from '../lib/supabase';

interface PolicyAcceptanceModalProps {
  onAccept: () => void;
}

export function PolicyAcceptanceModal({ onAccept }: PolicyAcceptanceModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!termsAccepted || !privacyAccepted) {
      setError('You must accept both Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const acceptanceRecords = [
        {
          user_id: user.id,
          policy_type: 'terms_of_service',
          policy_version: '1.0',
        },
        {
          user_id: user.id,
          policy_type: 'privacy_policy',
          policy_version: '1.0',
        },
      ];

      const { error: insertError } = await supabase
        .from('policy_acceptance')
        .insert(acceptanceRecords);

      if (insertError) {
        throw insertError;
      }

      onAccept();
    } catch (err: any) {
      console.error('Error saving policy acceptance:', err);
      setError('Failed to save acceptance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = termsAccepted && privacyAccepted;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">Welcome to Liver Wellness System</h2>
          <p className="text-sm text-blue-100 mt-1">
            Please review and accept our policies to continue
          </p>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'terms'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Terms of Service
            {termsAccepted && <span className="ml-2 text-green-600">✓</span>}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'privacy'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Privacy Policy
            {privacyAccepted && <span className="ml-2 text-green-600">✓</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'terms' ? (
            <TermsOfService showCloseButton={false} />
          ) : (
            <PrivacyPolicy showCloseButton={false} />
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                I have read and accept the <strong>Terms of Service</strong>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                I have read and accept the <strong>Privacy Policy</strong>
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                You must accept both policies to use this system
              </p>
              <button
                onClick={handleAccept}
                disabled={!canProceed || isSubmitting}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  canProceed && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Accept & Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
