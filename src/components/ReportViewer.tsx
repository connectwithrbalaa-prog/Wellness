import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, Download, Mail, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Fat Level</h4>
          <p className="text-gray-700">{analysis.fat_level}</p>
          <p className="text-sm text-gray-600 mt-1">FibroScan: {measurements.steatosis_grade}</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Scarring Level</h4>
          <p className="text-gray-700">{analysis.scarring_level}</p>
          <p className="text-sm text-gray-600 mt-1">FibroScan: {measurements.fibrosis_stage}</p>
        </div>
      </div>

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
