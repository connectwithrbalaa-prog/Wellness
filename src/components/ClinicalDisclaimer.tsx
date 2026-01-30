import { AlertTriangle } from 'lucide-react';

interface ClinicalDisclaimerProps {
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

export function ClinicalDisclaimer({ variant = 'banner', className = '' }: ClinicalDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-gray-600 italic ${className}`}>
        This is a clinical decision support tool. All results must be reviewed and approved by a qualified physician.
      </p>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-amber-50 border-l-4 border-amber-400 p-4 ${className}`}>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-1">Clinical Decision Support Tool</p>
            <p className="text-amber-700">
              This software is a clinical calculator and documentation system designed to assist healthcare professionals.
              All calculations, interpretations, and recommendations must be reviewed and validated by a qualified physician
              before being used in clinical decision-making. This system does not replace professional medical judgment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border-t border-b border-blue-200 py-3 px-4 ${className}`}>
      <div className="flex items-center justify-center max-w-4xl mx-auto">
        <AlertTriangle className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          <strong>Clinical Tool Notice:</strong> This system assists healthcare professionals with calculations and documentation.
          All results require physician review and approval. Not a diagnostic device.
        </p>
      </div>
    </div>
  );
}
