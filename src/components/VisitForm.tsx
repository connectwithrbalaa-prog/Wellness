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
  const [hasExistingData, setHasExistingData] = useState(false);

  const [formData, setFormData] = useState<FormData>({
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

  const handleSave = async () => {
    setSaving(true);
    setError('');

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

      alert('Data saved successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

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

      alert('Analysis generated successfully and sent for approval!');
      onBack();
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

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">FibroScan Results</h3>
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
