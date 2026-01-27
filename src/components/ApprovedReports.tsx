import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, User, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ReportViewer } from './ReportViewer';

interface ApprovedReport {
  id: string;
  visit_id: string;
  created_at: string;
  approved_at: string;
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

export const ApprovedReports: React.FC = () => {
  const [reports, setReports] = useState<ApprovedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ApprovedReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovedReports();
  }, []);

  const loadApprovedReports = async () => {
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
        .eq('approval_status', 'approved')
        .order('approved_at', { ascending: false });

      if (error) throw error;
      setReports(data as any || []);
    } catch (error) {
      console.error('Error loading approved reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedReport) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedReport(null)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approved Reports</span>
          </button>
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
            <p className="text-sm text-green-600 mt-2 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Approved on {new Date(selectedReport.approved_at).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="p-6">
          <ReportViewer visitId={selectedReport.visit_id} showActions={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Approved Reports</h2>
        <p className="text-sm text-gray-600 mt-1">
          View, download, or email approved patient reports
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No approved reports yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
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
                  <div className="text-right text-sm text-gray-600">
                    <p>Approved</p>
                    <p>{new Date(report.approved_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
