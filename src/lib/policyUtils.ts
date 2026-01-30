import { supabase } from './supabase';

const CURRENT_POLICY_VERSION = '1.0';

export async function checkPolicyAcceptance(userId: string): Promise<{
  termsAccepted: boolean;
  privacyAccepted: boolean;
  needsAcceptance: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from('policy_acceptance')
      .select('policy_type, policy_version')
      .eq('user_id', userId)
      .eq('policy_version', CURRENT_POLICY_VERSION);

    if (error) {
      console.error('Error checking policy acceptance:', error);
      return { termsAccepted: false, privacyAccepted: false, needsAcceptance: true };
    }

    const termsAccepted = data?.some(
      (record) => record.policy_type === 'terms_of_service'
    ) || false;

    const privacyAccepted = data?.some(
      (record) => record.policy_type === 'privacy_policy'
    ) || false;

    const needsAcceptance = !termsAccepted || !privacyAccepted;

    return { termsAccepted, privacyAccepted, needsAcceptance };
  } catch (err) {
    console.error('Error checking policy acceptance:', err);
    return { termsAccepted: false, privacyAccepted: false, needsAcceptance: true };
  }
}

export async function recordPolicyAcceptance(
  userId: string,
  policyType: 'terms_of_service' | 'privacy_policy'
): Promise<boolean> {
  try {
    const { error } = await supabase.from('policy_acceptance').insert({
      user_id: userId,
      policy_type: policyType,
      policy_version: CURRENT_POLICY_VERSION,
    });

    if (error) {
      console.error('Error recording policy acceptance:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error recording policy acceptance:', err);
    return false;
  }
}
