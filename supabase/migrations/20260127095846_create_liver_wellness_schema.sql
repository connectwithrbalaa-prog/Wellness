/*
  # Liver Wellness Application Database Schema

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `medical_record_number` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `date_of_birth` (date)
      - `gender` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
    
    - `visits`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `visit_date` (date)
      - `visit_number` (integer)
      - `status` (text) - draft, pending_approval, approved, archived
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
    
    - `input_measurements`
      - `id` (uuid, primary key)
      - `visit_id` (uuid, references visits)
      - `steatosis_grade` (text) - S0, S1, S2, S3, S4
      - `fibrosis_stage` (text) - F0, F1, F2, F3, F4
      - `bmi_category` (text) - Low, Healthy, High, Obese
      - `visceral_fat_category` (text) - Low, Healthy, High, Obese
      - `water_percentage_category` (text) - Low, Healthy, Optimal
      - `protein_percentage_category` (text) - Low, Healthy, Optimal
      - `usg_abdomen` (text) - Grade 1, Grade 2, Grade 3, Fatty Liver
      - `lft_status` (text) - Normal, Abnormal
      - `lipid_profile_status` (text) - Normal, Abnormal
      - `diet_habits` (text)
      - `sleep_quality` (text) - Poor, Average, Good
      - `exercise_spiritual` (text) - Low, Moderate, Good
      - `stress_levels` (text) - Low, Medium, High
      - `substance_usage` (text) - None, Alcohol, Smoking, Both
      - `created_at` (timestamptz)
    
    - `rule_based_analysis`
      - `id` (uuid, primary key)
      - `visit_id` (uuid, references visits, unique)
      - `overall_liver_health_status` (text)
      - `fat_level` (text)
      - `scarring_level` (text)
      - `liver_function_efficiency_percent` (integer)
      - `liver_longevity_outlook` (text)
      - `primary_risk_drivers` (jsonb)
      - `priority_urgent_important` (jsonb)
      - `priority_urgent_not_important` (jsonb)
      - `priority_not_urgent_not_important` (jsonb)
      - `follow_up_frequency` (text) - Weekly, Monthly, Quarterly
      - `created_at` (timestamptz)
    
    - `patient_reports`
      - `id` (uuid, primary key)
      - `visit_id` (uuid, references visits, unique)
      - `genai_explanation` (text)
      - `doctor_notes` (text)
      - `approval_status` (text) - pending, approved, rejected
      - `approved_by` (uuid, references auth.users)
      - `approved_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated staff users
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  contact_phone text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  visit_number integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create input_measurements table
CREATE TABLE IF NOT EXISTS input_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES visits(id) ON DELETE CASCADE UNIQUE NOT NULL,
  steatosis_grade text NOT NULL,
  fibrosis_stage text NOT NULL,
  bmi_category text NOT NULL,
  visceral_fat_category text NOT NULL,
  water_percentage_category text NOT NULL,
  protein_percentage_category text NOT NULL,
  usg_abdomen text NOT NULL,
  lft_status text NOT NULL,
  lipid_profile_status text NOT NULL,
  diet_habits text,
  sleep_quality text NOT NULL,
  exercise_spiritual text NOT NULL,
  stress_levels text NOT NULL,
  substance_usage text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create rule_based_analysis table
CREATE TABLE IF NOT EXISTS rule_based_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES visits(id) ON DELETE CASCADE UNIQUE NOT NULL,
  overall_liver_health_status text NOT NULL,
  fat_level text NOT NULL,
  scarring_level text NOT NULL,
  liver_function_efficiency_percent integer NOT NULL,
  liver_longevity_outlook text NOT NULL,
  primary_risk_drivers jsonb NOT NULL,
  priority_urgent_important jsonb NOT NULL,
  priority_urgent_not_important jsonb NOT NULL,
  priority_not_urgent_not_important jsonb NOT NULL,
  follow_up_frequency text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create patient_reports table
CREATE TABLE IF NOT EXISTS patient_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES visits(id) ON DELETE CASCADE UNIQUE NOT NULL,
  genai_explanation text NOT NULL,
  doctor_notes text,
  approval_status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE input_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_based_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for patients table
CREATE POLICY "Staff can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Staff can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for visits table
CREATE POLICY "Staff can view all visits"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert visits"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Staff can update visits"
  ON visits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for input_measurements table
CREATE POLICY "Staff can view all measurements"
  ON input_measurements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert measurements"
  ON input_measurements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update measurements"
  ON input_measurements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for rule_based_analysis table
CREATE POLICY "Staff can view all analysis"
  ON rule_based_analysis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert analysis"
  ON rule_based_analysis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update analysis"
  ON rule_based_analysis FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for patient_reports table
CREATE POLICY "Staff can view all reports"
  ON patient_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert reports"
  ON patient_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update reports"
  ON patient_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for audit_logs table
CREATE POLICY "Staff can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_measurements_visit_id ON input_measurements(visit_id);
CREATE INDEX IF NOT EXISTS idx_analysis_visit_id ON rule_based_analysis(visit_id);
CREATE INDEX IF NOT EXISTS idx_reports_visit_id ON patient_reports(visit_id);
CREATE INDEX IF NOT EXISTS idx_reports_approval_status ON patient_reports(approval_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
