/*
  # Enhance Audit Logs and Add Policy Acceptance

  ## Overview
  This migration enhances the existing audit_logs table and adds policy acceptance tracking
  for legal compliance.

  ## Changes to Existing Tables

  ### 1. `audit_logs` - Enhanced with IP tracking
  Added columns:
  - `ip_address` (text, nullable) - User's IP address for security tracking
  - `user_agent` (text, nullable) - User's browser/device info

  ## New Tables

  ### 2. `policy_acceptance`
  Tracks user acceptance of Terms of Service and Privacy Policy
  - `id` (uuid, primary key) - Unique acceptance record
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `policy_type` (text) - Type of policy (terms_of_service, privacy_policy)
  - `policy_version` (text) - Version of policy accepted (e.g., "1.0")
  - `accepted_at` (timestamptz) - When user accepted
  - `ip_address` (text, nullable) - IP address at time of acceptance
  - `user_agent` (text, nullable) - Browser/device at time of acceptance

  ## Security
  - Maintain existing RLS on audit_logs
  - Enable RLS on policy_acceptance
  - Users can view and insert their own policy acceptances
  - Admins can view all policy acceptances

  ## Important Notes
  1. Audit logs remain append-only for integrity
  2. Policy acceptance creates immutable records
  3. Both tables support compliance audits and legal requirements
*/

-- Add IP tracking columns to existing audit_logs table
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Create additional indexes for audit_logs if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Create policy_acceptance table
CREATE TABLE IF NOT EXISTS policy_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_type text NOT NULL CHECK (policy_type IN ('terms_of_service', 'privacy_policy')),
  policy_version text NOT NULL DEFAULT '1.0',
  accepted_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  UNIQUE(user_id, policy_type, policy_version)
);

-- Create indexes for policy_acceptance
CREATE INDEX IF NOT EXISTS idx_policy_acceptance_user_id ON policy_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acceptance_type ON policy_acceptance(policy_type);

-- Enable RLS on policy_acceptance
ALTER TABLE policy_acceptance ENABLE ROW LEVEL SECURITY;

-- Users can view their own policy acceptances
CREATE POLICY "Users can view own policy acceptances"
  ON policy_acceptance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own policy acceptances
CREATE POLICY "Users can accept policies"
  ON policy_acceptance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);