import { X } from 'lucide-react';

interface TermsOfServiceProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function TermsOfService({ onClose, showCloseButton = true }: TermsOfServiceProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="px-6 py-6 space-y-6 text-gray-700">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            <strong>Last Updated:</strong> January 30, 2026<br />
            <strong>Version:</strong> 1.0
          </p>
          <p className="mb-4">
            Welcome to the Liver Wellness Clinical Management System. By accessing or using this software,
            you agree to be bound by these Terms of Service.
          </p>
        </div>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
          <p className="mb-2">
            By creating an account and using this system, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Nature of Service</h3>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-3">
            <p className="font-semibold text-amber-900 mb-2">CRITICAL NOTICE: Clinical Decision Support Tool</p>
            <p className="text-amber-800">
              This software is a <strong>clinical decision support tool and documentation system</strong>.
              It is NOT a medical device, diagnostic system, or autonomous decision-making tool.
            </p>
          </div>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Performs calculations based on established medical formulas (FIB-4, APRI, NFS, FAST)</li>
            <li>Assists healthcare professionals with documentation and report generation</li>
            <li>Provides organizational tools for patient visit tracking</li>
            <li>Does NOT diagnose, treat, cure, or prevent any disease</li>
            <li>Does NOT replace professional medical judgment</li>
            <li>Requires physician review and approval for all reports</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Responsibilities</h3>
          <p className="mb-2">As a user of this system, you agree to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Be a qualified healthcare professional authorized to access patient information</li>
            <li>Maintain the confidentiality and security of your account credentials</li>
            <li>Verify all calculations and recommendations before clinical application</li>
            <li>Exercise independent professional judgment in all clinical decisions</li>
            <li>Comply with all applicable medical practice regulations and standards</li>
            <li>Report any errors, bugs, or security concerns immediately</li>
            <li>Use the system only for its intended purpose</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Limitations of Liability</h3>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-3">
            <p className="font-semibold text-red-900 mb-2">IMPORTANT LIABILITY NOTICE</p>
            <p className="text-red-800">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT ANY WARRANTIES.
            </p>
          </div>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The software provider is not liable for clinical decisions made using this tool</li>
            <li>Healthcare professionals retain full responsibility for patient care decisions</li>
            <li>No warranty is made regarding accuracy, completeness, or fitness for any particular purpose</li>
            <li>Users assume all risks associated with the use of this software</li>
            <li>The software provider is not liable for any direct, indirect, incidental, or consequential damages</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Data Accuracy and Validation</h3>
          <p className="mb-2">You acknowledge and agree that:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>You are responsible for verifying the accuracy of all data entered into the system</li>
            <li>Calculations are based on published medical formulas but may contain errors</li>
            <li>All results must be independently validated before clinical use</li>
            <li>The system does not guarantee error-free operation</li>
            <li>Software updates may occur without notice to fix bugs or improve functionality</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Professional Standards</h3>
          <p className="mb-2">
            This system is designed to support, not replace, the relationship between healthcare
            professionals and their patients. Users must:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Maintain appropriate professional standards of care</li>
            <li>Follow institutional protocols and guidelines</li>
            <li>Document clinical reasoning for all decisions</li>
            <li>Obtain appropriate informed consent from patients</li>
            <li>Maintain professional liability insurance</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Intellectual Property</h3>
          <p className="mb-2">
            All content, features, and functionality of this software are owned by the software provider
            and are protected by intellectual property laws. You may not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Copy, modify, or distribute the software</li>
            <li>Reverse engineer or decompile the system</li>
            <li>Remove any proprietary notices or labels</li>
            <li>Use the software for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Account Termination</h3>
          <p className="mb-2">
            We reserve the right to suspend or terminate your account if:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>You violate these Terms of Service</li>
            <li>You misuse the system or compromise security</li>
            <li>Your account remains inactive for an extended period</li>
            <li>We discontinue the service</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
          <p className="mb-2">
            We may modify these Terms of Service at any time. Changes will be effective immediately
            upon posting. Your continued use of the system constitutes acceptance of modified terms.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Governing Law</h3>
          <p className="mb-2">
            These Terms of Service are governed by the laws of India. Any disputes shall be subject
            to the jurisdiction of courts in the applicable region.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Information</h3>
          <p className="mb-2">
            For questions about these Terms of Service, please contact your system administrator.
          </p>
        </section>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <p className="text-sm font-semibold text-gray-900 mb-2">Acknowledgment</p>
          <p className="text-sm text-gray-700">
            By clicking "I Accept" or by using this system, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
