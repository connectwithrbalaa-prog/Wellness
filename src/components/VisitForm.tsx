import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzePatientData } from '../lib/analysisEngine';
import { generatePatientExplanation } from '../lib/aiExplanation';

interface Props {
  visitId: string;
  onBack: () => void;
}

interface FormData {
  lsm_kpa: number | null;
  cap_dbm: number | null;
  ast_ul: number | null;
  alt_ul: number | null;
  platelets: number | null;
  albumin_gl: number | null;
  ggt_ul: number | null;
  hba1c_percent: number | null;
  bmi_value: number | null;
  age_years: number | null;
  has_diabetes: boolean;
  steatosis_grade: 'S0' | 'S1' | 'S2' | 'S3' | 'S4';
  fibrosis_stage: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
  bmi_category: 'Low' | 'Healthy' | 'High' | 'Obese';
  visceral_fat_category: 'Low' | 'Healthy' | 'High' | 'Obese';
  water_percentage_category: 'Low' | 'Healthy' | 'Optimal';
  protein_percentage_category: 'Low' | 'Healthy' | 'Optimal';
  usg_abdomen: 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Fatty Liver';
  lft_status: 'Normal' | 'Abnormal';
  lipid_profile_status: 'Normal' | 'Abnormal';
  diet_habits: string;
  sleep_quality: 'Poor' | 'Average' | 'Good';
  exercise_spiritual: 'Low' | 'Moderate' | 'Good';
  stress_levels: 'Low' | 'Medium' | 'High';
  substance_usage: string;
}

export const VisitForm: React.FC<Props> = ({ visitId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasExistingData, setHasExistingData] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    lsm_kpa: null,
    cap_dbm: null,
    ast_ul: null,
    alt_ul: null,
    platelets: null,
    albumin_gl: null,
    ggt_ul: null,
    hba1c_percent: null,
    bmi_value: null,
    age_years: null,
    has_diabetes: false,
    steatosis_grade: 'S0',
    fibrosis_stage: 'F0',
    bmi_category: 'Healthy',
    visceral_fat_category: 'Healthy',
    water_percentage_category: 'Healthy',
    protein_percentage_category: 'Healthy',
    usg_abdomen: 'Grade 1',
    lft_status: 'Normal',
    lipid_profile_status: 'Normal',
    diet_habits: '',
    sleep_quality: 'Average',
    exercise_spiritual: 'Moderate',
    stress_levels: 'Medium',
    substance_usage: 'None'
  });

  useEffect(() => {
    loadVisitData();
  }, [visitId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadVisitData = async () => {
    try {
      const { data, error } = await supabase
        .from('input_measurements')
        .select('*')
        .eq('visit_id', visitId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData(data);
        setHasExistingData(true);
      }
    } catch (err) {
      console.error('Error loading visit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = (): string | null => {
    if (formData.age_years !== null) {
      if (formData.age_years < 1 || formData.age_years > 120) {
        return 'Age must be between 1 and 120 years';
      }
    }

    if (formData.bmi_value !== null) {
      if (formData.bmi_value < 10 || formData.bmi_value > 70) {
        return 'BMI must be between 10 and 70';
      }

      if (formData.bmi_value < 18.5 && formData.bmi_category !== 'Low') {
        return 'BMI value suggests Low category, but category is set to ' + formData.bmi_category;
      }
      if (formData.bmi_value >= 18.5 && formData.bmi_value < 25 && formData.bmi_category !== 'Healthy') {
        return 'BMI value suggests Healthy category, but category is set to ' + formData.bmi_category;
      }
      if (formData.bmi_value >= 25 && formData.bmi_value < 30 && formData.bmi_category !== 'High') {
        return 'BMI value suggests High category, but category is set to ' + formData.bmi_category;
      }
      if (formData.bmi_value >= 30 && formData.bmi_category !== 'Obese') {
        return 'BMI value suggests Obese category, but category is set to ' + formData.bmi_category;
      }
    }

    if (formData.lsm_kpa !== null) {
      if (formData.lsm_kpa < 0 || formData.lsm_kpa > 75) {
        return 'LSM must be between 0 and 75 kPa';
      }

      if (formData.lsm_kpa < 7 && formData.fibrosis_stage !== 'F0') {
        return 'LSM < 7 suggests F0 fibrosis, but stage is set to ' + formData.fibrosis_stage;
      }
      if (formData.lsm_kpa >= 7 && formData.lsm_kpa < 9.6 && !['F1', 'F2'].includes(formData.fibrosis_stage)) {
        return 'LSM 7-9.5 suggests F1-F2 fibrosis, but stage is set to ' + formData.fibrosis_stage;
      }
      if (formData.lsm_kpa >= 9.6 && formData.lsm_kpa < 12.6 && formData.fibrosis_stage !== 'F2') {
        return 'LSM 9.6-12.5 suggests F2 fibrosis, but stage is set to ' + formData.fibrosis_stage;
      }
      if (formData.lsm_kpa >= 12.6 && formData.lsm_kpa < 14 && formData.fibrosis_stage !== 'F3') {
        return 'LSM 12.6-14 suggests F3 fibrosis, but stage is set to ' + formData.fibrosis_stage;
      }
      if (formData.lsm_kpa >= 14 && formData.fibrosis_stage !== 'F4') {
        return 'LSM >= 14 suggests F4 cirrhosis, but stage is set to ' + formData.fibrosis_stage;
      }
    }

    if (formData.cap_dbm !== null) {
      if (formData.cap_dbm < 100 || formData.cap_dbm > 400) {
        return 'CAP must be between 100 and 400 dB/m';
      }

      if (formData.cap_dbm < 238 && formData.steatosis_grade !== 'S0') {
        return 'CAP < 238 suggests S0 steatosis, but grade is set to ' + formData.steatosis_grade;
      }
      if (formData.cap_dbm >= 238 && formData.cap_dbm < 260 && formData.steatosis_grade !== 'S1') {
        return 'CAP 238-260 suggests S1 steatosis, but grade is set to ' + formData.steatosis_grade;
      }
      if (formData.cap_dbm >= 260 && formData.cap_dbm < 290 && formData.steatosis_grade !== 'S2') {
        return 'CAP 260-290 suggests S2 steatosis, but grade is set to ' + formData.steatosis_grade;
      }
      if (formData.cap_dbm >= 290 && !['S3', 'S4'].includes(formData.steatosis_grade)) {
        return 'CAP >= 290 suggests S3+ steatosis, but grade is set to ' + formData.steatosis_grade;
      }
    }

    if (formData.ast_ul !== null && (formData.ast_ul < 0 || formData.ast_ul > 1000)) {
      return 'AST must be between 0 and 1000 U/L';
    }

    if (formData.alt_ul !== null && (formData.alt_ul < 0 || formData.alt_ul > 1000)) {
      return 'ALT must be between 0 and 1000 U/L';
    }

    if (formData.platelets !== null && (formData.platelets < 0 || formData.platelets > 1000)) {
      return 'Platelets must be between 0 and 1000 10⁹/L';
    }

    if (formData.albumin_gl !== null && (formData.albumin_gl < 0 || formData.albumin_gl > 60)) {
      return 'Albumin must be between 0 and 60 g/L';
    }

    if (formData.ggt_ul !== null && (formData.ggt_ul < 0 || formData.ggt_ul > 1000)) {
      return 'GGT must be between 0 and 1000 U/L';
    }

    if (formData.hba1c_percent !== null) {
      if (formData.hba1c_percent < 3 || formData.hba1c_percent > 15) {
        return 'HbA1c must be between 3 and 15%';
      }

      if (formData.hba1c_percent >= 6.5 && !formData.has_diabetes) {
        return 'HbA1c >= 6.5% indicates diabetes, but diabetes status is set to No';
      }
    }

    if (formData.lft_status === 'Abnormal') {
      if (formData.ast_ul !== null && formData.alt_ul !== null) {
        if (formData.ast_ul <= 40 && formData.alt_ul <= 56) {
          return 'LFT status is Abnormal but both AST and ALT are in normal range';
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const validationError = validateFormData();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    try {
      if (hasExistingData) {
        const { error: updateError } = await supabase
          .from('input_measurements')
          .update(formData)
          .eq('visit_id', visitId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('input_measurements')
          .insert({ ...formData, visit_id: visitId });

        if (insertError) throw insertError;
        setHasExistingData(true);
      }

      setSuccessMessage('Data is Saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    const validationError = validateFormData();
    if (validationError) {
      setError(validationError);
      setGenerating(false);
      return;
    }

    try {
      if (!hasExistingData) {
        const { error: insertError } = await supabase
          .from('input_measurements')
          .insert({ ...formData, visit_id: visitId });

        if (insertError) throw insertError;
        setHasExistingData(true);
      }

      const measurements = { ...formData, visit_id: visitId, id: '', created_at: '' };
      const analysis = analyzePatientData(measurements as any);

      const { error: analysisError } = await supabase
        .from('rule_based_analysis')
        .upsert({ ...analysis, visit_id: visitId });

      if (analysisError) throw analysisError;

      const explanation = await generatePatientExplanation(analysis, measurements);

      const { error: reportError } = await supabase
        .from('patient_reports')
        .upsert({
          visit_id: visitId,
          genai_explanation: explanation,
          approval_status: 'pending'
        });

      if (reportError) throw reportError;

      const { error: statusError } = await supabase
        .from('visits')
        .update({ status: 'pending_approval' })
        .eq('id', visitId);

      if (statusError) throw statusError;

      setSuccessMessage('Analysis generated successfully and sent for approval!');
      setTimeout(() => onBack(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate analysis');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Loading visit data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Visit Data Entry</h2>
        <p className="text-sm text-gray-600 mt-1">Complete all required fields</p>
      </div>

      <div className="p-6 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-emerald-500 p-8 min-w-[300px]">
              <p className="text-center text-xl font-semibold text-gray-900">{successMessage}</p>
            </div>
          </div>
        )}

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (years)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age_years || ''}
                onChange={(e) => setFormData({ ...formData, age_years: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="e.g., 45"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BMI Value
              </label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="70"
                value={formData.bmi_value || ''}
                onChange={(e) => setFormData({ ...formData, bmi_value: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 26.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 18.5-24.9</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diabetes Status
              </label>
              <select
                value={formData.has_diabetes ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, has_diabetes: e.target.value === 'yes' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="no">No Diabetes</option>
                <option value="yes">Has Diabetes</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">FibroScan Measurements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LSM - Liver Stiffness (kPa)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="75"
                value={formData.lsm_kpa || ''}
                onChange={(e) => setFormData({ ...formData, lsm_kpa: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 8.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Reference: &lt;7 (F0), 7-9.5 (F1-F2), 9.6-12.5 (F3), &gt;12.5 (F4)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CAP - Controlled Attenuation (dB/m)
              </label>
              <input
                type="number"
                step="1"
                min="100"
                max="400"
                value={formData.cap_dbm || ''}
                onChange={(e) => setFormData({ ...formData, cap_dbm: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 285"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Reference: &lt;238 (S0), 238-260 (S1), 260-290 (S2), &gt;290 (S3)
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Test Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AST (U/L)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="1000"
                value={formData.ast_ul || ''}
                onChange={(e) => setFormData({ ...formData, ast_ul: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 32"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 10-40 U/L</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ALT (U/L)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="1000"
                value={formData.alt_ul || ''}
                onChange={(e) => setFormData({ ...formData, alt_ul: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 28"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 7-56 U/L</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platelets (10⁹/L)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="1000"
                value={formData.platelets || ''}
                onChange={(e) => setFormData({ ...formData, platelets: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 250"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 150-400 10⁹/L</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Albumin (g/L)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="60"
                value={formData.albumin_gl || ''}
                onChange={(e) => setFormData({ ...formData, albumin_gl: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 42"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 35-52 g/L</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GGT (U/L)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="1000"
                value={formData.ggt_ul || ''}
                onChange={(e) => setFormData({ ...formData, ggt_ul: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 35"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 0-51 U/L</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HbA1c (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="3"
                max="15"
                value={formData.hba1c_percent || ''}
                onChange={(e) => setFormData({ ...formData, hba1c_percent: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 5.6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: &lt;5.7%, Prediabetes: 5.7-6.4%</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">FibroScan Categorical (Optional)</h3>
          <p className="text-sm text-gray-600 mb-3">These will be auto-calculated from LSM/CAP if provided above</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Steatosis Grade *
              </label>
              <select
                value={formData.steatosis_grade}
                onChange={(e) => setFormData({ ...formData, steatosis_grade: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="S0">S0 - No Steatosis</option>
                <option value="S1">S1 - Mild</option>
                <option value="S2">S2 - Moderate</option>
                <option value="S3">S3 - Severe</option>
                <option value="S4">S4 - Very Severe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fibrosis Stage *
              </label>
              <select
                value={formData.fibrosis_stage}
                onChange={(e) => setFormData({ ...formData, fibrosis_stage: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="F0">F0 - No Fibrosis</option>
                <option value="F1">F1 - Mild</option>
                <option value="F2">F2 - Moderate</option>
                <option value="F3">F3 - Severe</option>
                <option value="F4">F4 - Cirrhosis</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Body & Metabolic Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BMI Category *
              </label>
              <select
                value={formData.bmi_category}
                onChange={(e) => setFormData({ ...formData, bmi_category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Healthy">Healthy</option>
                <option value="High">High</option>
                <option value="Obese">Obese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visceral Fat Category *
              </label>
              <select
                value={formData.visceral_fat_category}
                onChange={(e) => setFormData({ ...formData, visceral_fat_category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Healthy">Healthy</option>
                <option value="High">High</option>
                <option value="Obese">Obese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water Percentage Category *
              </label>
              <select
                value={formData.water_percentage_category}
                onChange={(e) => setFormData({ ...formData, water_percentage_category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Healthy">Healthy</option>
                <option value="Optimal">Optimal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein Percentage Category *
              </label>
              <select
                value={formData.protein_percentage_category}
                onChange={(e) => setFormData({ ...formData, protein_percentage_category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Healthy">Healthy</option>
                <option value="Optimal">Optimal</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Imaging & Lab Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USG Abdomen *
              </label>
              <select
                value={formData.usg_abdomen}
                onChange={(e) => setFormData({ ...formData, usg_abdomen: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Fatty Liver">Fatty Liver</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liver Function Test (LFT) *
              </label>
              <select
                value={formData.lft_status}
                onChange={(e) => setFormData({ ...formData, lft_status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lipid Profile *
              </label>
              <select
                value={formData.lipid_profile_status}
                onChange={(e) => setFormData({ ...formData, lipid_profile_status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle & Longevity Drivers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diet Habits
              </label>
              <textarea
                value={formData.diet_habits}
                onChange={(e) => setFormData({ ...formData, diet_habits: e.target.value })}
                rows={3}
                placeholder="Describe typical diet and eating patterns..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Quality *
              </label>
              <select
                value={formData.sleep_quality}
                onChange={(e) => setFormData({ ...formData, sleep_quality: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Poor">Poor</option>
                <option value="Average">Average</option>
                <option value="Good">Good</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise & Spiritual Well-being *
              </label>
              <select
                value={formData.exercise_spiritual}
                onChange={(e) => setFormData({ ...formData, exercise_spiritual: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="Good">Good</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stress Levels *
              </label>
              <select
                value={formData.stress_levels}
                onChange={(e) => setFormData({ ...formData, stress_levels: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Substance Usage *
              </label>
              <select
                value={formData.substance_usage}
                onChange={(e) => setFormData({ ...formData, substance_usage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="None">None</option>
                <option value="Alcohol">Alcohol</option>
                <option value="Smoking">Smoking</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving || generating}
            className="flex items-center space-x-2 px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={saving || generating}
            className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{generating ? 'Generating...' : 'Generate Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
