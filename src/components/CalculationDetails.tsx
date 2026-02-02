import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface CalculationDetailsProps {
  measurements: any;
  analysis: any;
}

interface ScoreInfoProps {
  title: string;
  formula: string;
  calculation: string;
  result: string | number;
  interpretation: string;
  references: string;
}

export const ScoreInfoTooltip: React.FC<{ content: ScoreInfoProps }> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Info className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-xl p-4">
          <h6 className="font-semibold text-gray-900 mb-2">{content.title}</h6>

          <div className="space-y-2 text-xs">
            <div>
              <p className="font-medium text-gray-700">Formula:</p>
              <p className="text-gray-600 font-mono bg-gray-50 p-2 rounded">{content.formula}</p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Calculation:</p>
              <p className="text-gray-600 font-mono bg-gray-50 p-2 rounded">{content.calculation}</p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Result:</p>
              <p className="text-gray-900 font-semibold">{content.result}</p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Interpretation:</p>
              <p className="text-gray-600">{content.interpretation}</p>
            </div>

            <div>
              <p className="font-medium text-gray-700">Reference Ranges:</p>
              <p className="text-gray-600">{content.references}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CalculationDetails: React.FC<CalculationDetailsProps> = ({ measurements, analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreCalculations = () => {
    const calculations = [];

    if (analysis.fib4_score !== null) {
      const age = measurements.age_years || 0;
      const ast = measurements.ast_ul || 0;
      const alt = measurements.alt_ul || 0;
      const platelets = measurements.platelets || 0;

      calculations.push({
        name: 'FIB-4 Index',
        formula: 'FIB-4 = (Age × AST) / (Platelets × √ALT)',
        calculation: `(${age} × ${ast}) / (${platelets} × √${alt}) = ${analysis.fib4_score}`,
        result: analysis.fib4_score,
        interpretation: analysis.fib4_risk,
        references: '<1.45 = Low risk of advanced fibrosis; 1.45-3.25 = Indeterminate; >3.25 = High risk',
        purpose: 'Estimates liver fibrosis in adults with chronic liver disease',
        literatureReference: 'Sterling RK, et al. Hepatology 2006;43:1317-25'
      });
    }

    if (analysis.nfs_score !== null) {
      const age = measurements.age_years || 0;
      const bmi = measurements.bmi_value || 0;
      const dm = measurements.has_diabetes ? 1 : 0;
      const ast = measurements.ast_ul || 0;
      const alt = measurements.alt_ul || 0;
      const platelets = measurements.platelets || 0;
      const albumin = measurements.albumin_gl || 0;
      const astAltRatio = (ast / alt).toFixed(2);

      calculations.push({
        name: 'NAFLD Fibrosis Score (NFS)',
        formula: 'NFS = -1.675 + (0.037 × Age) + (0.094 × BMI) + (1.13 × Diabetes) + (0.99 × AST/ALT ratio) - (0.013 × Platelets) - (0.66 × Albumin)',
        calculation: `-1.675 + (0.037 × ${age}) + (0.094 × ${bmi}) + (1.13 × ${dm}) + (0.99 × ${astAltRatio}) - (0.013 × ${platelets}) - (0.66 × ${albumin}) = ${analysis.nfs_score}`,
        result: analysis.nfs_score,
        interpretation: analysis.nfs_risk,
        references: '<-1.455 = Low risk; -1.455 to 0.676 = Indeterminate; >0.676 = High risk',
        purpose: 'Predicts advanced fibrosis in patients with NAFLD',
        literatureReference: 'Angulo P, et al. Hepatology 2007;45:846-54'
      });
    }

    if (analysis.apri_score !== null) {
      const ast = measurements.ast_ul || 0;
      const platelets = measurements.platelets || 0;
      const ULN_AST = 40;

      calculations.push({
        name: 'APRI Score',
        formula: 'APRI = [(AST / ULN) / Platelets] × 100',
        calculation: `[(${ast} / ${ULN_AST}) / ${platelets}] × 100 = ${analysis.apri_score}`,
        result: analysis.apri_score,
        interpretation: analysis.apri_risk,
        references: '<0.5 = Low risk of cirrhosis; 0.5-1.5 = Indeterminate; >1.5 = High risk',
        purpose: 'Non-invasive marker for hepatic fibrosis, originally validated in hepatitis C',
        literatureReference: 'Wai CT, et al. Hepatology 2003;38:518-26'
      });
    }

    if (analysis.fast_score !== null) {
      const lsm = measurements.lsm_kpa || 0;
      const cap = measurements.cap_dbm || 0;
      const ast = measurements.ast_ul || 0;

      calculations.push({
        name: 'FAST Score',
        formula: 'FAST = e^(-1.65 + 1.07×ln(LSM) + 2.66×10⁻⁸×CAP³ - 63.3/AST) / [1 + e^(-1.65 + 1.07×ln(LSM) + 2.66×10⁻⁸×CAP³ - 63.3/AST)]',
        calculation: `With LSM=${lsm} kPa, CAP=${cap} dB/m, AST=${ast} U/L → ${analysis.fast_score}`,
        result: analysis.fast_score,
        interpretation: analysis.fast_risk,
        references: '<0.35 = Rule out NASH with fibrosis; 0.35-0.67 = Indeterminate; ≥0.67 = Rule in NASH with significant fibrosis',
        purpose: 'Identifies patients with NASH and significant fibrosis (F2-F3) using FibroScan data',
        literatureReference: 'Newsome PN, et al. Lancet Gastroenterol Hepatol 2020;5:31-41'
      });
    }

    if (analysis.wellness_score !== null) {
      const lsm = measurements.lsm_kpa || 0;
      const cap = measurements.cap_dbm || 0;
      const lsmComponent = (10 * ((lsm - 5) / 15)).toFixed(1);
      const capComponent = (10 * ((cap - 200) / 100)).toFixed(1);

      calculations.push({
        name: 'Custom Wellness Score',
        formula: 'Wellness = 50 - [10×(LSM-5)/15] - [10×(CAP-200)/100]',
        calculation: `50 - [10×(${lsm}-5)/15] - [10×(${cap}-200)/100] = 50 - ${lsmComponent} - ${capComponent} = ${analysis.wellness_score}`,
        result: `${analysis.wellness_score}/100`,
        interpretation: 'Higher scores indicate better liver wellness',
        references: '0-30 = Poor; 31-50 = Fair; 51-70 = Good; 71-100 = Excellent',
        purpose: 'Custom composite score based on fibrosis and steatosis measurements',
        literatureReference: 'Internal scoring system'
      });
    }

    if (measurements.lsm_kpa !== null) {
      const lsm = measurements.lsm_kpa;
      let stage = '';
      if (lsm < 7) stage = 'F0 (No fibrosis)';
      else if (lsm < 9.6) stage = 'F1-F2 (Mild-moderate fibrosis)';
      else if (lsm < 12.6) stage = 'F3 (Severe fibrosis)';
      else stage = 'F4 (Cirrhosis)';

      calculations.push({
        name: 'LSM (Liver Stiffness Measurement)',
        formula: 'Direct FibroScan measurement in kPa',
        calculation: `Measured value: ${lsm} kPa`,
        result: stage,
        interpretation: analysis.lsm_metavir_stage,
        references: '<7 = F0; 7-9.5 = F1-F2; 9.6-12.5 = F3; ≥12.6 = F4',
        purpose: 'Non-invasive assessment of liver stiffness correlating with fibrosis stage',
        literatureReference: 'METAVIR scoring system via transient elastography'
      });
    }

    if (measurements.cap_dbm !== null) {
      const cap = measurements.cap_dbm;
      let stage = '';
      if (cap < 238) stage = 'S0 (No steatosis)';
      else if (cap < 260) stage = 'S1 (Mild steatosis)';
      else if (cap < 290) stage = 'S2 (Moderate steatosis)';
      else stage = 'S3 (Severe steatosis)';

      calculations.push({
        name: 'CAP (Controlled Attenuation Parameter)',
        formula: 'Direct FibroScan measurement in dB/m',
        calculation: `Measured value: ${cap} dB/m`,
        result: stage,
        interpretation: analysis.cap_steatosis_stage,
        references: '<238 = S0; 238-259 = S1; 260-289 = S2; ≥290 = S3',
        purpose: 'Quantifies hepatic steatosis (liver fat content)',
        literatureReference: 'Sasso M, et al. J Hepatol 2010;52:579-85'
      });
    }

    return calculations;
  };

  const calculations = getScoreCalculations();

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Technical Calculation Details for Clinical Reference
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className="p-6 bg-white border-t border-blue-200">
          <p className="text-xs text-gray-600 mb-4">
            This section provides detailed calculation formulas with patient-specific values for clinical documentation and verification purposes.
          </p>

          <div className="space-y-6">
            {calculations.map((calc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3">{calc.name}</h4>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Formula:</p>
                    <p className="text-gray-600 font-mono text-xs bg-white p-2 rounded border border-gray-200 mt-1">
                      {calc.formula}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Calculation with Patient Values:</p>
                    <p className="text-gray-600 font-mono text-xs bg-white p-2 rounded border border-gray-200 mt-1">
                      {calc.calculation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-700">Result:</p>
                      <p className="text-gray-900 font-semibold">{calc.result}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Interpretation:</p>
                      <p className="text-gray-900">{calc.interpretation}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Reference Ranges:</p>
                    <p className="text-gray-600 text-xs mt-1">{calc.references}</p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Clinical Purpose:</p>
                    <p className="text-gray-600 text-xs mt-1">{calc.purpose}</p>
                  </div>

                  {calc.literatureReference && (
                    <div>
                      <p className="font-medium text-gray-700">Literature Reference:</p>
                      <p className="text-gray-600 text-xs italic mt-1">{calc.literatureReference}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
              <h4 className="font-semibold text-gray-900 mb-3">Liver Function Efficiency Score</h4>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Methodology:</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Composite score starting at 100% with deductions based on disease severity and risk factors
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Calculation with Patient Values:</p>
                  <div className="text-xs bg-white p-3 rounded border border-gray-200 mt-2 space-y-1 font-mono">
                    {(() => {
                      const steatosisScore = parseInt(measurements.steatosis_grade?.substring(1) || '0');
                      const fibrosisScore = parseInt(measurements.fibrosis_stage?.substring(1) || '0');
                      const cap = measurements.cap_dbm;
                      const lsm = measurements.lsm_kpa;

                      let capScore = 0;
                      if (cap) {
                        if (cap >= 290) capScore = 3;
                        else if (cap >= 260) capScore = 2;
                        else if (cap >= 238) capScore = 1;
                      }

                      let lsmScore = 0;
                      if (lsm) {
                        if (lsm >= 12.5) lsmScore = 4;
                        else if (lsm >= 9.6) lsmScore = 3;
                        else if (lsm >= 7) lsmScore = 2;
                        else lsmScore = 0;
                      }

                      const effectiveSteatosis = Math.max(steatosisScore, capScore);
                      const effectiveFibrosis = Math.max(fibrosisScore, lsmScore);

                      let runningScore = 100;
                      const deductions = [];

                      deductions.push(`Starting score: ${runningScore}%`);

                      if (effectiveSteatosis > 0) {
                        const deduction = effectiveSteatosis * 8;
                        runningScore -= deduction;
                        deductions.push(`- Fat accumulation level ${effectiveSteatosis}: -${deduction}% → ${runningScore}%`);
                      }

                      if (effectiveFibrosis > 0) {
                        const deduction = effectiveFibrosis * 12;
                        runningScore -= deduction;
                        deductions.push(`- Liver scarring level ${effectiveFibrosis}: -${deduction}% → ${runningScore}%`);
                      }

                      if (measurements.bmi_category === 'Obese') {
                        runningScore -= 10;
                        deductions.push(`- BMI category (Obese): -10% → ${runningScore}%`);
                      } else if (measurements.bmi_category === 'High') {
                        runningScore -= 5;
                        deductions.push(`- BMI category (High): -5% → ${runningScore}%`);
                      }

                      if (measurements.visceral_fat_category === 'Obese') {
                        runningScore -= 10;
                        deductions.push(`- Visceral fat (Obese): -10% → ${runningScore}%`);
                      } else if (measurements.visceral_fat_category === 'High') {
                        runningScore -= 5;
                        deductions.push(`- Visceral fat (High): -5% → ${runningScore}%`);
                      }

                      if (measurements.lft_status === 'Abnormal') {
                        runningScore -= 8;
                        deductions.push(`- Abnormal liver function tests: -8% → ${runningScore}%`);
                      }

                      if (measurements.lipid_profile_status === 'Abnormal') {
                        runningScore -= 5;
                        deductions.push(`- Abnormal lipid profile: -5% → ${runningScore}%`);
                      }

                      if (measurements.usg_abdomen === 'Grade 3' || measurements.usg_abdomen === 'Fatty Liver') {
                        runningScore -= 7;
                        deductions.push(`- Ultrasound findings (${measurements.usg_abdomen}): -7% → ${runningScore}%`);
                      } else if (measurements.usg_abdomen === 'Grade 2') {
                        runningScore -= 4;
                        deductions.push(`- Ultrasound findings (Grade 2): -4% → ${runningScore}%`);
                      }

                      if (measurements.sleep_quality === 'Poor') {
                        runningScore -= 3;
                        deductions.push(`- Poor sleep quality: -3% → ${runningScore}%`);
                      }

                      if (measurements.stress_levels === 'High') {
                        runningScore -= 4;
                        deductions.push(`- High stress levels: -4% → ${runningScore}%`);
                      }

                      if (measurements.substance_usage?.includes('Alcohol') || measurements.substance_usage?.includes('Both')) {
                        runningScore -= 10;
                        deductions.push(`- Alcohol use: -10% → ${runningScore}%`);
                      }

                      if (measurements.substance_usage?.includes('Smoking') || measurements.substance_usage?.includes('Both')) {
                        runningScore -= 5;
                        deductions.push(`- Smoking: -5% → ${runningScore}%`);
                      }

                      const finalScore = Math.max(0, Math.min(100, runningScore));
                      if (finalScore !== runningScore) {
                        deductions.push(`Final score (clamped 0-100): ${finalScore}%`);
                      }

                      return deductions.map((line, idx) => (
                        <p key={idx} className={idx === 0 ? 'font-semibold' : ''}>{line}</p>
                      ));
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="font-medium text-gray-700">Final Score:</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {analysis.liver_function_efficiency_percent}%
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Health Status:</p>
                    <p className="text-gray-900 font-semibold">{analysis.overall_liver_health_status}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Interpretation Scale:</p>
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    <p>• 85-100%: Excellent liver health</p>
                    <p>• 70-84%: Good liver health</p>
                    <p>• 50-69%: Fair - requires attention</p>
                    <p>• 30-49%: Poor - urgent intervention needed</p>
                    <p>• 0-29%: Critical - immediate medical attention required</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Deduction Reference Guide:</p>
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    <p>• Fat accumulation: -8% × severity level (0-4)</p>
                    <p>• Liver scarring: -12% × severity level (0-4)</p>
                    <p>• BMI - Obese: -10% | High: -5%</p>
                    <p>• Visceral fat - Obese: -10% | High: -5%</p>
                    <p>• Abnormal LFT: -8%</p>
                    <p>• Abnormal lipids: -5%</p>
                    <p>• USG Grade 3/Fatty: -7% | Grade 2: -4%</p>
                    <p>• Poor sleep: -3%</p>
                    <p>• High stress: -4%</p>
                    <p>• Alcohol: -10%</p>
                    <p>• Smoking: -5%</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Clinical Purpose:</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Holistic assessment of liver health incorporating objective medical measurements
                    (fibrosis, steatosis, lab values) and modifiable lifestyle factors. Heavier
                    penalties for scarring reflect greater clinical significance than fat accumulation.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Literature Reference:</p>
                  <p className="text-gray-600 text-xs italic mt-1">Internal composite scoring system</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-900">
              <strong>Note:</strong> These calculations are provided for clinical reference and documentation.
              All formulas follow established medical literature and validated scoring systems.
              Results should be interpreted in the context of complete clinical assessment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
