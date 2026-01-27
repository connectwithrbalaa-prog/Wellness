import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, User, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ReportViewer } from './ReportViewer';

interface PendingReport {
  id: string;
  visit_id: string;
  genai_explanation: string;
  approval_status: string;
  created_at: string;
  visit: {
    visit_date: string;
    visit_number: number;
    patient: {
      first_name: string;
      last_name: string;
      medical_record_number: string;
    };
  };
}

export const ReportApproval: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PendingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingReports();
  }, []);

  const loadPendingReports = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_reports')
        .select(`
          *,
          visit:visits (
            visit_date,
            visit_number,
            patient:patients (
              first_name,
              last_name,
              medical_record_number
            )
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data as any || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReport || !user) return;

    setProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from('patient_reports')
        .update({
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          doctor_notes: doctorNotes || null
        })
        .eq('id', selectedReport.id);

      if (updateError) throw updateError;

      const { error: visitError } = await supabase
        .from('visits')
        .update({ status: 'approved' })
        .eq('id', selectedReport.visit_id);

      if (visitError) throw visitError;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'approve_report',
        entity_type: 'report',
        entity_id: selectedReport.id,
        details: { visit_id: selectedReport.visit_id }
      });

      alert('Report approved successfully');
      setSelectedReport(null);
      setDoctorNotes('');
      loadPendingReports();
    } catch (error: any) {
      alert(error.message || 'Failed to approve report');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReport || !user) return;
    if (!doctorNotes.trim()) {
      alert('Please provide notes explaining why this report is being rejected');
      return;
    }

    setProcessing(true);
    try {
      const { error: updateError } = await supabase
        .from('patient_reports')
        .update({
          approval_status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          doctor_notes: doctorNotes
        })
        .eq('id', selectedReport.id);

      if (updateError) throw updateError;

      const { error: visitError } = await supabase
        .from('visits')
        .update({ status: 'draft' })
        .eq('id', selectedReport.visit_id);

      if (visitError) throw visitError;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'reject_report',
        entity_type: 'report',
        entity_id: selectedReport.id,
        details: { visit_id: selectedReport.visit_id, reason: doctorNotes }
      });

      alert('Report rejected. Visit returned to draft status.');
      setSelectedReport(null);
      setDoctorNotes('');
      loadPendingReports();
    } catch (error: any) {
      alert(error.message || 'Failed to reject report');
    } finally {
      setProcessing(false);
    }
  };

  if (selectedReport) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => {
              setSelectedReport(null);
              setDoctorNotes('');
            }}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Pending Reports
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedReport.visit.patient.first_name} {selectedReport.visit.patient.last_name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Visit #{selectedReport.visit.visit_number} - {new Date(selectedReport.visit.visit_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                MRN: {selectedReport.visit.patient.medical_record_number}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <ReportViewer visitId={selectedReport.visit_id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor Notes (Optional for approval, required for rejection)
            </label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={4}
              placeholder="Add any additional notes or modifications to the report..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReject}
              disabled={processing}
              className="flex items-center space-x-2 px-6 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Pending Report Approvals</h2>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve patient reports before sharing with patients
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading pending reports...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending reports to review</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  setDoctorNotes('');
                }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <FileText className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {report.visit.patient.first_name} {report.visit.patient.last_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>MRN: {report.visit.patient.medical_record_number}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Visit #{report.visit.visit_number}</span>
                        </span>
                        <span>{new Date(report.visit.visit_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
