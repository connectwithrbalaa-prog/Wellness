import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CreatePatientModal } from './CreatePatientModal';

interface Patient {
  id: string;
  medical_record_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  contact_phone: string | null;
  contact_email: string | null;
}

interface Visit {
  id: string;
  visit_date: string;
  visit_number: number;
  status: string;
}

interface Props {
  selectedPatientId?: string;
  onPatientSelect?: (patientId: string) => void;
  onVisitCreated?: (visitId: string) => void;
  onBack?: () => void;
}

export const PatientList: React.FC<Props> = ({
  selectedPatientId,
  onPatientSelect,
  onVisitCreated,
  onBack
}) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetails(selectedPatientId);
      loadVisits(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setSelectedPatient(data);
    } catch (error) {
      console.error('Error loading patient details:', error);
    }
  };

  const loadVisits = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error loading visits:', error);
    }
  };

  const createNewVisit = async () => {
    if (!selectedPatientId || !user) return;

    try {
      const visitNumber = visits.length + 1;
      const { data, error } = await supabase
        .from('visits')
        .insert({
          patient_id: selectedPatientId,
          visit_date: new Date().toISOString().split('T')[0],
          visit_number: visitNumber,
          status: 'draft',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      if (data && onVisitCreated) {
        onVisitCreated(data.id);
      }
    } catch (error) {
      console.error('Error creating visit:', error);
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.medical_record_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (selectedPatientId && selectedPatient) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Patients</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </h2>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>MRN: {selectedPatient.medical_record_number}</p>
                <p>DOB: {new Date(selectedPatient.date_of_birth).toLocaleDateString()}</p>
                <p>Gender: {selectedPatient.gender}</p>
                {selectedPatient.contact_phone && <p>Phone: {selectedPatient.contact_phone}</p>}
                {selectedPatient.contact_email && <p>Email: {selectedPatient.contact_email}</p>}
              </div>
            </div>
            <button
              onClick={createNewVisit}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Visit</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit History</h3>
          {visits.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No visits recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  onClick={() => onVisitCreated && onVisitCreated(visit.id)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Visit #{visit.visit_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        visit.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : visit.status === 'pending_approval'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {visit.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Patient</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients by name or MRN..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading patients...</p>
        ) : filteredPatients.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {searchTerm ? 'No patients found matching your search.' : 'No patients yet.'}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => onPatientSelect && onPatientSelect(patient.id)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">MRN: {patient.medical_record_number}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                    <p>{patient.gender}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadPatients();
          }}
        />
      )}
    </div>
  );
};
