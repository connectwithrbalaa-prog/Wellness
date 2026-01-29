/*
  # Add FibroScan and Blood Test Parameters for Liver Health Calculations

  1. New Columns Added to input_measurements
    - `lsm_kpa` (numeric): Liver Stiffness Measurement in kPa for fibrosis staging
    - `cap_dbm` (numeric): Controlled Attenuation Parameter in dB/m for steatosis staging
    - `ast_ul` (numeric): Aspartate Aminotransferase in U/L
    - `alt_ul` (numeric): Alanine Aminotransferase in U/L
    - `platelets` (numeric): Platelet count in 10^9/L
    - `albumin_gl` (numeric): Albumin in g/L
    - `ggt_ul` (numeric): Gamma-Glutamyl Transferase in U/L
    - `hba1c_percent` (numeric): Hemoglobin A1c percentage
    - `bmi_value` (numeric): Body Mass Index value
    - `age_years` (integer): Patient age in years
    - `has_diabetes` (boolean): Diabetes status (yes/no)

  2. New Columns Added to rule_based_analysis
    - `lsm_metavir_stage` (text): METAVIR staging from LSM (F0-F4)
    - `cap_steatosis_stage` (text): Steatosis staging from CAP (S0-S3)
    - `fib4_score` (numeric): FIB-4 Index score
    - `fib4_risk` (text): FIB-4 risk category (Low/Indeterminate/High)
    - `nfs_score` (numeric): NAFLD Fibrosis Score
    - `nfs_risk` (text): NFS risk category (Low/Indeterminate/High)
    - `apri_score` (numeric): APRI score
    - `apri_risk` (text): APRI risk category (Low/Indeterminate/High)
    - `fast_score` (numeric): FAST score (FibroScan-AST)
    - `fast_risk` (text): FAST risk category (Low/Indeterminate/High)
    - `wellness_score` (numeric): Custom wellness score 0-100
    - `mortality_risk` (text): Mortality risk assessment based on LSM

  3. Security
    - Maintains existing RLS policies
    - All fields nullable to support gradual data entry
*/

-- Add FibroScan and blood test columns to input_measurements
ALTER TABLE input_measurements
ADD COLUMN IF NOT EXISTS lsm_kpa numeric,
ADD COLUMN IF NOT EXISTS cap_dbm numeric,
ADD COLUMN IF NOT EXISTS ast_ul numeric,
ADD COLUMN IF NOT EXISTS alt_ul numeric,
ADD COLUMN IF NOT EXISTS platelets numeric,
ADD COLUMN IF NOT EXISTS albumin_gl numeric,
ADD COLUMN IF NOT EXISTS ggt_ul numeric,
ADD COLUMN IF NOT EXISTS hba1c_percent numeric,
ADD COLUMN IF NOT EXISTS bmi_value numeric,
ADD COLUMN IF NOT EXISTS age_years integer,
ADD COLUMN IF NOT EXISTS has_diabetes boolean DEFAULT false;

-- Add calculated score columns to rule_based_analysis
ALTER TABLE rule_based_analysis
ADD COLUMN IF NOT EXISTS lsm_metavir_stage text,
ADD COLUMN IF NOT EXISTS cap_steatosis_stage text,
ADD COLUMN IF NOT EXISTS fib4_score numeric,
ADD COLUMN IF NOT EXISTS fib4_risk text,
ADD COLUMN IF NOT EXISTS nfs_score numeric,
ADD COLUMN IF NOT EXISTS nfs_risk text,
ADD COLUMN IF NOT EXISTS apri_score numeric,
ADD COLUMN IF NOT EXISTS apri_risk text,
ADD COLUMN IF NOT EXISTS fast_score numeric,
ADD COLUMN IF NOT EXISTS fast_risk text,
ADD COLUMN IF NOT EXISTS wellness_score numeric,
ADD COLUMN IF NOT EXISTS mortality_risk text;
