import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, FileText, CheckCircle, FileCheck } from 'lucide-react';
import { PatientList } from './PatientList';
import { VisitForm } from './VisitForm';
import { ReportApproval } from './ReportApproval';
import { ApprovedReports } from './ApprovedReports';

type Tab = 'patients' | 'reports' | 'approved';

export const Dashboard: React.FC = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedVisitId(null);
  };

  const handleVisitCreated = (visitId: string) => {
    setSelectedVisitId(visitId);
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setSelectedVisitId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Liver Wellness Portal</h1>
                <p className="text-sm text-gray-600">Clinical Decision Support</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedPatientId && (
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('patients')}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'patients'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Patients & Visits</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reports'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Pending Approvals</span>
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'approved'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileCheck className="w-5 h-5" />
                <span>Approved Reports</span>
              </button>
            </nav>
          </div>
        )}

        <div>
          {selectedVisitId ? (
            <VisitForm visitId={selectedVisitId} onBack={handleBackToPatients} />
          ) : selectedPatientId ? (
            <PatientList
              selectedPatientId={selectedPatientId}
              onVisitCreated={handleVisitCreated}
              onBack={handleBackToPatients}
            />
          ) : activeTab === 'patients' ? (
            <PatientList onPatientSelect={handlePatientSelect} />
          ) : activeTab === 'reports' ? (
            <ReportApproval />
          ) : (
            <ApprovedReports />
          )}
        </div>
      </div>
    </div>
  );
};
