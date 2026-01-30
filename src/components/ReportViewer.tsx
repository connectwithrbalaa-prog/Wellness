import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, Download, Mail, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import { CalculationDetails, ScoreInfoTooltip } from './CalculationDetails';
import { ClinicalDisclaimer } from './ClinicalDisclaimer';

interface Props {
  visitId: string;
  showActions?: boolean;
}

interface ReportData {
  measurements: any;
  analysis: any;
  report: any;
  visit: any;
  patient: any;
}

export const ReportViewer: React.FC<Props> = ({ visitId, showActions = false }) => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    loadReportData();
  }, [visitId]);

  const loadReportData = async () => {
    try {
      const [measurementsRes, analysisRes, reportRes, visitRes] = await Promise.all([
        supabase.from('input_measurements').select('*').eq('visit_id', visitId).single(),
        supabase.from('rule_based_analysis').select('*').eq('visit_id', visitId).single(),
        supabase.from('patient_reports').select('*').eq('visit_id', visitId).single(),
        supabase.from('visits').select('*, patient:patients(*)').eq('id', visitId).single()
      ]);

      if (measurementsRes.error) throw measurementsRes.error;
      if (analysisRes.error) throw analysisRes.error;
      if (reportRes.error) throw reportRes.error;
      if (visitRes.error) throw visitRes.error;

      setData({
        measurements: measurementsRes.data,
        analysis: analysisRes.data,
        report: reportRes.data,
        visit: visitRes.data,
        patient: visitRes.data.patient
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const { patient, visit, analysis, report } = data;

    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Liver Wellness Report', margin, yPos);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Patient: ${patient.first_name} ${patient.last_name}`, margin, yPos);
    yPos += 5;
    doc.text(`MRN: ${patient.medical_record_number}`, margin, yPos);
    yPos += 5;
    doc.text(`Visit Date: ${new Date(visit.visit_date).toLocaleDateString()}`, margin, yPos);

    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Overall Status', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Health Status: ${analysis.overall_liver_health_status}`, margin, yPos);
    yPos += 5;
    doc.text(`Liver Function: ${analysis.liver_function_efficiency_percent}%`, margin, yPos);
    yPos += 5;
    doc.text(`Follow-up: ${analysis.follow_up_frequency}`, margin, yPos);

    yPos += 15;
    doc.setFontSize(12);
    doc.text('Patient Explanation', margin, yPos);
    yPos += 7;

    doc.setFontSize(9);
    const textLines = doc.splitTextToSize(
      report.genai_explanation.replace(/[#*]/g, '').replace(/\n+/g, '\n'),
      contentWidth
    );

    textLines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    doc.save(`liver-report-${patient.last_name}-${new Date(visit.visit_date).toISOString().split('T')[0]}.pdf`);
  };

  const sendEmail = async () => {
    if (!data || !data.patient.contact_email) {
      setEmailError('Patient email not found');
      return;
    }

    setEmailLoading(true);
    setEmailError('');
    setEmailSuccess(false);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-patient-report`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.patient.contact_email,
          patientName: `${data.patient.first_name} ${data.patient.last_name}`,
          reportContent: data.report.genai_explanation,
          visitDate: new Date(data.visit.visit_date).toLocaleDateString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (error: any) {
      setEmailError(error.message || 'Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading report...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-red-600">Failed to load report</div>;
  }

  const { measurements, analysis, report } = data;

  return (
    <div className="space-y-6">
      <ClinicalDisclaimer variant="card" />

      {showActions && data && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
          <div>
            <h3 className="font-medium text-gray-900">Share Report</h3>
            <p className="text-sm text-gray-600">Download or email the approved report</p>
          </div>
          <div className="flex items-center space-x-3">
            {emailSuccess && (
              <span className="text-sm text-green-600 font-medium">Email sent successfully!</span>
            )}
            {emailError && (
              <span className="text-sm text-red-600">{emailError}</span>
            )}
            <button
              onClick={generatePDF}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            {data.patient.contact_email && (
              <button
                onClick={sendEmail}
                disabled={emailLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {emailLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>{emailLoading ? 'Sending...' : 'Email to Patient'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-100 p-3 rounded-full">
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Liver Health Status: {analysis.overall_liver_health_status}
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Liver Function Efficiency</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {analysis.liver_function_efficiency_percent}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Follow-Up Frequency</p>
                <p className="text-lg font-semibold text-gray-900">
                  {analysis.follow_up_frequency}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg border border-emerald-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">How the Efficiency Score is Calculated</h4>
              <p className="text-xs text-gray-700 mb-2">
                The Liver Function Efficiency score starts at 100% and is reduced based on various health factors:
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Fat accumulation: -8% per severity level</li>
                <li>• Liver scarring: -12% per severity level</li>
                <li>• Obesity/High BMI: -5% to -10%</li>
                <li>• High visceral fat: -5% to -10%</li>
                <li>• Abnormal liver enzymes: -8%</li>
                <li>• Abnormal lipid profile: -5%</li>
                <li>• Ultrasound findings: -4% to -7%</li>
                <li>• Poor sleep quality: -3%</li>
                <li>• High stress: -4%</li>
                <li>• Alcohol use: -10%</li>
                <li>• Smoking: -5%</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2 italic">
                The final score reflects overall liver health, with higher percentages indicating better function.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Fat Level</h4>
          <p className="text-gray-700">{analysis.fat_level}</p>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            {measurements.cap_dbm && (
              <p>CAP: {measurements.cap_dbm} dB/m - {analysis.cap_steatosis_stage}</p>
            )}
            {measurements.steatosis_grade && (
              <p>Grade: {measurements.steatosis_grade}</p>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Scarring Level</h4>
          <p className="text-gray-700">{analysis.scarring_level}</p>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            {measurements.lsm_kpa && (
              <p>LSM: {measurements.lsm_kpa} kPa - {analysis.lsm_metavir_stage}</p>
            )}
            {measurements.fibrosis_stage && (
              <p>Grade: {measurements.fibrosis_stage}</p>
            )}
          </div>
        </div>
      </div>

      {(analysis.fib4_score || analysis.nfs_score || analysis.apri_score || analysis.fast_score) && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validated Clinical Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysis.fib4_score !== null && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <h5 className="text-xs font-medium text-gray-600 mb-1">FIB-4 Index</h5>
                  <ScoreInfoTooltip
                    content={{
                      title: 'FIB-4 Index',
                      formula: 'FIB-4 = (Age × AST) / (Platelets × √ALT)',
                      calculation: `(${measurements.age_years} × ${measurements.ast_ul}) / (${measurements.platelets} × √${measurements.alt_ul}) = ${analysis.fib4_score}`,
                      result: analysis.fib4_score,
                      interpretation: analysis.fib4_risk,
                      references: '<1.45 = Low risk; 1.45-3.25 = Indeterminate; >3.25 = High risk'
                    }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analysis.fib4_score}</p>
                <p className={`text-sm font-medium mt-1 ${
                  analysis.fib4_risk === 'Low risk' ? 'text-green-600' :
                  analysis.fib4_risk === 'High risk' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {analysis.fib4_risk}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  &lt;1.45 low, &gt;3.25 high
                </p>
              </div>
            )}

            {analysis.nfs_score !== null && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <h5 className="text-xs font-medium text-gray-600 mb-1">NAFLD Fibrosis Score</h5>
                  <ScoreInfoTooltip
                    content={{
                      title: 'NAFLD Fibrosis Score',
                      formula: 'NFS = -1.675 + (0.037×Age) + (0.094×BMI) + (1.13×Diabetes) + (0.99×AST/ALT) - (0.013×Platelets) - (0.66×Albumin)',
                      calculation: `-1.675 + (0.037×${measurements.age_years}) + (0.094×${measurements.bmi_value}) + (1.13×${measurements.has_diabetes ? 1 : 0}) + (0.99×${(measurements.ast_ul / measurements.alt_ul).toFixed(2)}) - (0.013×${measurements.platelets}) - (0.66×${measurements.albumin_gl}) = ${analysis.nfs_score}`,
                      result: analysis.nfs_score,
                      interpretation: analysis.nfs_risk,
                      references: '<-1.455 = Low risk; -1.455 to 0.676 = Indeterminate; >0.676 = High risk'
                    }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analysis.nfs_score}</p>
                <p className={`text-sm font-medium mt-1 ${
                  analysis.nfs_risk === 'Low risk' ? 'text-green-600' :
                  analysis.nfs_risk === 'High risk' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {analysis.nfs_risk}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  &lt;-1.455 low, &gt;0.676 high
                </p>
              </div>
            )}

            {analysis.apri_score !== null && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <h5 className="text-xs font-medium text-gray-600 mb-1">APRI Score</h5>
                  <ScoreInfoTooltip
                    content={{
                      title: 'APRI Score',
                      formula: 'APRI = [(AST / ULN) / Platelets] × 100',
                      calculation: `[(${measurements.ast_ul} / 40) / ${measurements.platelets}] × 100 = ${analysis.apri_score}`,
                      result: analysis.apri_score,
                      interpretation: analysis.apri_risk,
                      references: '<0.5 = Low risk; 0.5-1.5 = Indeterminate; >1.5 = High risk'
                    }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analysis.apri_score}</p>
                <p className={`text-sm font-medium mt-1 ${
                  analysis.apri_risk === 'Low risk' ? 'text-green-600' :
                  analysis.apri_risk === 'High risk' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {analysis.apri_risk}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  &lt;0.5 low, &gt;1.5 high
                </p>
              </div>
            )}

            {analysis.fast_score !== null && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <h5 className="text-xs font-medium text-gray-600 mb-1">FAST Score</h5>
                  <ScoreInfoTooltip
                    content={{
                      title: 'FAST Score',
                      formula: 'FAST = e^X / (1 + e^X), where X = -1.65 + 1.07×ln(LSM) + 2.66×10⁻⁸×CAP³ - 63.3/AST',
                      calculation: `With LSM=${measurements.lsm_kpa} kPa, CAP=${measurements.cap_dbm} dB/m, AST=${measurements.ast_ul} U/L → ${analysis.fast_score}`,
                      result: analysis.fast_score,
                      interpretation: analysis.fast_risk,
                      references: '<0.35 = Rule out; 0.35-0.67 = Indeterminate; ≥0.67 = Rule in NASH with fibrosis'
                    }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analysis.fast_score}</p>
                <p className={`text-sm font-medium mt-1 ${
                  analysis.fast_risk === 'Low risk' ? 'text-green-600' :
                  analysis.fast_risk === 'High risk' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {analysis.fast_risk}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  &lt;0.35 low, ≥0.67 high
                </p>
              </div>
            )}
          </div>

          {analysis.wellness_score !== null && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-1">Custom Wellness Score</h5>
                  <p className="text-3xl font-bold text-emerald-600">{analysis.wellness_score}/100</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-32">
                    <svg viewBox="0 0 36 36" className="transform -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray={`${analysis.wellness_score}, 100`}
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on LSM and CAP measurements (0-100 scale)
              </p>
            </div>
          )}

          {analysis.mortality_risk && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-1">Mortality Risk Assessment</h5>
              <p className="text-sm text-blue-900">{analysis.mortality_risk}</p>
            </div>
          )}
        </div>
      )}

      {(analysis.fib4_score || analysis.nfs_score || analysis.apri_score || analysis.fast_score) && (
        <CalculationDetails measurements={measurements} analysis={analysis} />
      )}

      {analysis.primary_risk_drivers && analysis.primary_risk_drivers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Primary Risk Drivers</h4>
              <ul className="space-y-1">
                {analysis.primary_risk_drivers.map((driver: string, idx: number) => (
                  <li key={idx} className="text-gray-700">• {driver}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Priority Actions</h4>

        {analysis.priority_urgent_important && analysis.priority_urgent_important.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-red-600 mb-2">Urgent & Important</h5>
            <ul className="space-y-1">
              {analysis.priority_urgent_important.map((action: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-700">• {action}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.priority_urgent_not_important && analysis.priority_urgent_not_important.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-yellow-600 mb-2">Important</h5>
            <ul className="space-y-1">
              {analysis.priority_urgent_not_important.map((action: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-700">• {action}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.priority_not_urgent_not_important && analysis.priority_not_urgent_not_important.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-2">Supporting Actions</h5>
            <ul className="space-y-1">
              {analysis.priority_not_urgent_not_important.map((action: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-700">• {action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Explanation</h3>
        <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-6">
          <div
            className="whitespace-pre-wrap text-gray-700"
            dangerouslySetInnerHTML={{
              __html: report.genai_explanation
                .replace(/^# /gm, '<h1 class="text-xl font-bold mb-4">')
                .replace(/\n$/gm, '</h1>')
                .replace(/^## /gm, '<h2 class="text-lg font-semibold mt-6 mb-3">')
                .replace(/^### /gm, '<h3 class="text-base font-semibold mt-4 mb-2">')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/^- /gm, '• ')
            }}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Clinical Note:</strong> This report combines rule-based analysis with patient-friendly explanations.
          All recommendations are lifestyle-based and do not include medication prescriptions.
          Doctor review and approval is required before sharing with the patient.
        </p>
      </div>
    </div>
  );
};
