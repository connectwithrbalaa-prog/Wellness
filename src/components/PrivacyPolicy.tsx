import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function PrivacyPolicy({ onClose, showCloseButton = true }: PrivacyPolicyProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
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
            This Privacy Policy describes how the Liver Wellness Clinical Management System collects,
            uses, and protects your information and patient data.
          </p>
        </div>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Healthcare Professional Information</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Professional credentials and role</li>
                <li>Account login information (encrypted)</li>
                <li>Usage data and activity logs</li>
                <li>IP addresses and device information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Patient Health Information (PHI)</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Medical record numbers</li>
                <li>Demographic information (name, date of birth, gender, contact)</li>
                <li>Clinical measurements and laboratory results</li>
                <li>Visit records and medical documentation</li>
                <li>Calculated health scores and assessments</li>
                <li>Doctor notes and recommendations</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
          <p className="mb-2">We use collected information for:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Clinical Support:</strong> To provide calculation tools and clinical decision support</li>
            <li><strong>Documentation:</strong> To maintain accurate patient records and visit histories</li>
            <li><strong>Authentication:</strong> To verify user identity and manage access controls</li>
            <li><strong>Security:</strong> To detect and prevent unauthorized access or misuse</li>
            <li><strong>Audit & Compliance:</strong> To maintain audit trails for regulatory compliance</li>
            <li><strong>System Improvement:</strong> To improve functionality and user experience</li>
            <li><strong>Legal Obligations:</strong> To comply with applicable healthcare regulations</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Data Security Measures</h3>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-3">
            <p className="font-semibold text-blue-900 mb-2">Security Commitment</p>
            <p className="text-blue-800">
              We implement industry-standard security measures to protect patient health information
              and comply with applicable data protection regulations.
            </p>
          </div>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Encryption:</strong> Data encrypted in transit (TLS) and at rest</li>
            <li><strong>Access Control:</strong> Role-based access with authentication required</li>
            <li><strong>Audit Logging:</strong> Comprehensive activity tracking for all user actions</li>
            <li><strong>Data Isolation:</strong> Patient data segregated with row-level security</li>
            <li><strong>Password Security:</strong> Strong password requirements and secure hashing</li>
            <li><strong>Regular Backups:</strong> Automated backups with disaster recovery procedures</li>
            <li><strong>Security Updates:</strong> Regular software updates to address vulnerabilities</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Sharing and Disclosure</h3>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-3">
            <p className="font-semibold text-green-900 mb-2">No Third-Party Sharing</p>
            <p className="text-green-800">
              We do not sell, rent, or share patient health information with third parties for
              marketing or commercial purposes.
            </p>
          </div>
          <p className="mb-2">Information may be disclosed only when:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Required by Law:</strong> Court orders, subpoenas, or legal obligations</li>
            <li><strong>Healthcare Operations:</strong> Among authorized healthcare professionals within your organization</li>
            <li><strong>Patient Consent:</strong> With explicit patient authorization</li>
            <li><strong>Emergency Situations:</strong> To prevent serious harm or protect public health</li>
            <li><strong>Service Providers:</strong> To essential service providers under strict confidentiality agreements (e.g., hosting providers)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Compliance with Indian Regulations</h3>
          <p className="mb-2">This system is designed to comply with:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Digital Information Security in Healthcare Act (DISHA):</strong> Patient data protection standards</li>
            <li><strong>Information Technology Act, 2000:</strong> Data security and privacy provisions</li>
            <li><strong>Clinical Establishment Act:</strong> Healthcare provider regulations</li>
            <li><strong>Medical Council of India Guidelines:</strong> Professional conduct standards</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Data Retention</h3>
          <p className="mb-2">We retain information as follows:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Patient Records:</strong> Maintained according to institutional policies and legal requirements (typically 7+ years)</li>
            <li><strong>Audit Logs:</strong> Retained for a minimum of 3 years for compliance purposes</li>
            <li><strong>User Accounts:</strong> Maintained while active; deactivated accounts retained per regulatory requirements</li>
            <li><strong>Backup Data:</strong> Retained according to backup retention schedules</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h3>
          <p className="mb-2">As a healthcare professional user, you have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access your account information</li>
            <li>Update your profile and credentials</li>
            <li>View audit logs of your activities</li>
            <li>Request account deactivation</li>
            <li>Report security concerns or data breaches</li>
          </ul>
          <p className="mt-3 mb-2">Patient rights (to be exercised through authorized healthcare providers):</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access to their medical records</li>
            <li>Correction of inaccurate information</li>
            <li>Information about data usage and disclosures</li>
            <li>Restriction of certain uses (where legally permitted)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies and Tracking</h3>
          <p className="mb-2">
            This system uses minimal tracking technologies:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Session Cookies:</strong> Required for authentication and system functionality</li>
            <li><strong>Security Cookies:</strong> To prevent unauthorized access and protect against attacks</li>
            <li><strong>No Marketing Cookies:</strong> We do not use cookies for advertising or marketing purposes</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Data Breach Notification</h3>
          <p className="mb-2">
            In the event of a security breach that compromises patient health information, we will:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Notify affected users and patients as required by law</li>
            <li>Report to relevant regulatory authorities within mandated timeframes</li>
            <li>Take immediate steps to contain and remediate the breach</li>
            <li>Conduct a thorough investigation and implement corrective measures</li>
            <li>Provide information about steps individuals can take to protect themselves</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Children's Privacy</h3>
          <p className="mb-2">
            This system is intended for use by healthcare professionals only. While the system may
            contain information about pediatric patients, it is not designed for direct use by children
            under the age of 18.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Changes to Privacy Policy</h3>
          <p className="mb-2">
            We may update this Privacy Policy to reflect changes in our practices or applicable laws.
            Material changes will be communicated through:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>In-system notifications</li>
            <li>Email notifications to registered users</li>
            <li>Updated policy version and date</li>
          </ul>
          <p className="mt-3">
            Your continued use of the system after changes are posted constitutes acceptance of the
            updated policy.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">12. Contact Information</h3>
          <p className="mb-2">
            For privacy-related questions, concerns, or requests, please contact:
          </p>
          <ul className="list-none space-y-1 ml-4">
            <li><strong>System Administrator:</strong> Your institutional contact</li>
            <li><strong>Privacy Officer:</strong> As designated by your organization</li>
            <li><strong>Security Incidents:</strong> Report immediately through your system administrator</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">13. Consent</h3>
          <p className="mb-2">
            By using this system, you consent to the collection, use, and processing of information
            as described in this Privacy Policy. You acknowledge that:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>You have read and understood this Privacy Policy</li>
            <li>You will handle patient information in accordance with applicable laws</li>
            <li>You will maintain appropriate security measures when accessing the system</li>
            <li>You will report any suspected privacy violations or security incidents</li>
          </ul>
        </section>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <p className="text-sm font-semibold text-gray-900 mb-2">Acknowledgment</p>
          <p className="text-sm text-gray-700">
            By clicking "I Accept" or by using this system, you acknowledge that you have read,
            understood, and agree to this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
