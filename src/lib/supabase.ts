import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          medical_record_number: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          contact_phone: string | null;
          contact_email: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      visits: {
        Row: {
          id: string;
          patient_id: string;
          visit_date: string;
          visit_number: number;
          status: 'draft' | 'pending_approval' | 'approved' | 'archived';
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['visits']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['visits']['Insert']>;
      };
      input_measurements: {
        Row: {
          id: string;
          visit_id: string;
          steatosis_grade: 'S0' | 'S1' | 'S2' | 'S3' | 'S4';
          fibrosis_stage: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
          bmi_category: 'Low' | 'Healthy' | 'High' | 'Obese';
          visceral_fat_category: 'Low' | 'Healthy' | 'High' | 'Obese';
          water_percentage_category: 'Low' | 'Healthy' | 'Optimal';
          protein_percentage_category: 'Low' | 'Healthy' | 'Optimal';
          usg_abdomen: 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Fatty Liver';
          lft_status: 'Normal' | 'Abnormal';
          lipid_profile_status: 'Normal' | 'Abnormal';
          diet_habits: string | null;
          sleep_quality: 'Poor' | 'Average' | 'Good';
          exercise_spiritual: 'Low' | 'Moderate' | 'Good';
          stress_levels: 'Low' | 'Medium' | 'High';
          substance_usage: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['input_measurements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['input_measurements']['Insert']>;
      };
      rule_based_analysis: {
        Row: {
          id: string;
          visit_id: string;
          overall_liver_health_status: string;
          fat_level: string;
          scarring_level: string;
          liver_function_efficiency_percent: number;
          liver_longevity_outlook: string;
          primary_risk_drivers: string[];
          priority_urgent_important: string[];
          priority_urgent_not_important: string[];
          priority_not_urgent_not_important: string[];
          follow_up_frequency: 'Weekly' | 'Monthly' | 'Quarterly';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rule_based_analysis']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['rule_based_analysis']['Insert']>;
      };
      patient_reports: {
        Row: {
          id: string;
          visit_id: string;
          genai_explanation: string;
          doctor_notes: string | null;
          approval_status: 'pending' | 'approved' | 'rejected';
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patient_reports']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patient_reports']['Insert']>;
      };
    };
  };
};
