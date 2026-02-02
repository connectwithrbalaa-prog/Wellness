import { Database } from './supabase';

type InputMeasurements = Database['public']['Tables']['input_measurements']['Row'];
type AnalysisResult = Database['public']['Tables']['rule_based_analysis']['Insert'];

function calculateLSMStaging(lsm: number | null): string {
  if (!lsm) return 'Not assessed';
  if (lsm < 7) return 'F0 (No fibrosis)';
  if (lsm < 9.6) return 'F1-F2 (Mild-moderate fibrosis)';
  if (lsm < 12.6) return 'F3 (Severe fibrosis)';
  return 'F4 (Cirrhosis)';
}

function calculateCAPStaging(cap: number | null): string {
  if (!cap) return 'Not assessed';
  if (cap < 238) return 'S0 (No steatosis)';
  if (cap < 260) return 'S1 (Mild steatosis)';
  if (cap < 290) return 'S2 (Moderate steatosis)';
  return 'S3 (Severe steatosis)';
}

function calculateFIB4(age: number | null, ast: number | null, alt: number | null, platelets: number | null): { score: number | null, risk: string } {
  if (!age || !ast || !alt || !platelets) {
    return { score: null, risk: 'Cannot calculate - missing data' };
  }

  const score = (age * ast) / (platelets * Math.sqrt(alt));

  let risk: string;
  if (score < 1.45) risk = 'Low risk';
  else if (score <= 3.25) risk = 'Indeterminate';
  else risk = 'High risk';

  return { score: Math.round(score * 100) / 100, risk };
}

function calculateNFS(
  age: number | null,
  bmi: number | null,
  hasDiabetes: boolean | null,
  ast: number | null,
  alt: number | null,
  platelets: number | null,
  albumin: number | null
): { score: number | null, risk: string } {
  if (!age || !bmi || hasDiabetes === null || !ast || !alt || !platelets || !albumin) {
    return { score: null, risk: 'Cannot calculate - missing data' };
  }

  const astAltRatio = ast / alt;
  const dm = hasDiabetes ? 1 : 0;

  const score = -1.675 +
    (0.037 * age) +
    (0.094 * bmi) +
    (1.13 * dm) +
    (0.99 * astAltRatio) -
    (0.013 * platelets) -
    (0.66 * albumin);

  let risk: string;
  if (score < -1.455) risk = 'Low risk';
  else if (score <= 0.676) risk = 'Indeterminate';
  else risk = 'High risk';

  return { score: Math.round(score * 100) / 100, risk };
}

function calculateAPRI(ast: number | null, platelets: number | null): { score: number | null, risk: string } {
  if (!ast || !platelets) {
    return { score: null, risk: 'Cannot calculate - missing data' };
  }

  const ULN_AST = 40;
  const score = ((ast / ULN_AST) / platelets) * 100;

  let risk: string;
  if (score < 0.5) risk = 'Low risk';
  else if (score <= 1.5) risk = 'Indeterminate';
  else risk = 'High risk';

  return { score: Math.round(score * 100) / 100, risk };
}

function calculateFAST(lsm: number | null, cap: number | null, ast: number | null): { score: number | null, risk: string } {
  if (!lsm || !cap || !ast) {
    return { score: null, risk: 'Cannot calculate - missing data' };
  }

  const exponent = -1.65 + (1.07 * Math.log(lsm)) + (2.66e-8 * Math.pow(cap, 3)) - (63.3 / ast);
  const score = Math.exp(exponent) / (1 + Math.exp(exponent));

  let risk: string;
  if (score < 0.35) risk = 'Low risk';
  else if (score < 0.67) risk = 'Indeterminate';
  else risk = 'High risk';

  return { score: Math.round(score * 1000) / 1000, risk };
}

function calculateWellnessScore(lsm: number | null, cap: number | null): number | null {
  if (!lsm || !cap) return null;

  const lsmComponent = 10 * ((lsm - 5) / 15);
  const capComponent = 10 * ((cap - 200) / 100);

  const score = 50 - lsmComponent - capComponent;
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

function assessMortalityRisk(lsm: number | null): string {
  if (!lsm) return 'Not assessed';
  if (lsm >= 20) return 'High mortality risk (15.5% vs 2.1% baseline) - LSM ≥20 kPa';
  if (lsm >= 10) return 'Elevated mortality risk (HR 2.31) - LSM ≥10 kPa';
  return 'Standard mortality risk';
}

export function analyzePatientData(measurements: InputMeasurements): AnalysisResult {
  const analysis: Partial<AnalysisResult> = {
    visit_id: measurements.visit_id,
    primary_risk_drivers: [],
    priority_urgent_important: [],
    priority_urgent_not_important: [],
    priority_not_urgent_not_important: []
  };

  const lsm = measurements.lsm_kpa;
  const cap = measurements.cap_dbm;
  const ast = measurements.ast_ul;
  const alt = measurements.alt_ul;
  const platelets = measurements.platelets;
  const albumin = measurements.albumin_gl;
  const age = measurements.age_years;
  const bmi = measurements.bmi_value;
  const hasDiabetes = measurements.has_diabetes;

  analysis.lsm_metavir_stage = calculateLSMStaging(lsm);
  analysis.cap_steatosis_stage = calculateCAPStaging(cap);

  const fib4 = calculateFIB4(age, ast, alt, platelets);
  analysis.fib4_score = fib4.score;
  analysis.fib4_risk = fib4.risk;

  const nfs = calculateNFS(age, bmi, hasDiabetes, ast, alt, platelets, albumin);
  analysis.nfs_score = nfs.score;
  analysis.nfs_risk = nfs.risk;

  const apri = calculateAPRI(ast, platelets);
  analysis.apri_score = apri.score;
  analysis.apri_risk = apri.risk;

  const fast = calculateFAST(lsm, cap, ast);
  analysis.fast_score = fast.score;
  analysis.fast_risk = fast.risk;

  analysis.wellness_score = calculateWellnessScore(lsm, cap);
  analysis.mortality_risk = assessMortalityRisk(lsm);

  const steatosisScore = parseInt(measurements.steatosis_grade?.substring(1) || '0');
  const fibrosisScore = parseInt(measurements.fibrosis_stage?.substring(1) || '0');

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

  analysis.fat_level =
    effectiveSteatosis === 0 ? 'No fat accumulation' :
    effectiveSteatosis === 1 ? 'Mild fat accumulation' :
    effectiveSteatosis === 2 ? 'Moderate fat accumulation' :
    effectiveSteatosis === 3 ? 'Significant fat accumulation' :
    'Severe fat accumulation';

  analysis.scarring_level =
    effectiveFibrosis === 0 ? 'No scarring' :
    effectiveFibrosis === 1 ? 'Minimal scarring' :
    effectiveFibrosis === 2 ? 'Moderate scarring' :
    effectiveFibrosis === 3 ? 'Advanced scarring' :
    'Cirrhosis (severe scarring)';

  let liverHealthScore = 100;
  liverHealthScore -= effectiveSteatosis * 8;
  liverHealthScore -= effectiveFibrosis * 12;
  if (measurements.bmi_category === 'Obese') liverHealthScore -= 10;
  else if (measurements.bmi_category === 'High') liverHealthScore -= 5;
  if (measurements.visceral_fat_category === 'Obese') liverHealthScore -= 10;
  else if (measurements.visceral_fat_category === 'High') liverHealthScore -= 5;
  if (measurements.lft_status === 'Abnormal') liverHealthScore -= 8;
  if (measurements.lipid_profile_status === 'Abnormal') liverHealthScore -= 5;
  if (measurements.usg_abdomen === 'Grade 3' || measurements.usg_abdomen === 'Fatty Liver') liverHealthScore -= 7;
  else if (measurements.usg_abdomen === 'Grade 2') liverHealthScore -= 4;
  if (measurements.sleep_quality === 'Poor') liverHealthScore -= 3;
  if (measurements.stress_levels === 'High') liverHealthScore -= 4;
  if (measurements.substance_usage?.includes('Alcohol') || measurements.substance_usage?.includes('Both')) liverHealthScore -= 10;
  if (measurements.substance_usage?.includes('Smoking') || measurements.substance_usage?.includes('Both')) liverHealthScore -= 5;

  analysis.liver_function_efficiency_percent = Math.max(0, Math.min(100, liverHealthScore));

  if (analysis.liver_function_efficiency_percent >= 85) {
    analysis.overall_liver_health_status = 'Excellent';
    analysis.liver_longevity_outlook = 'Excellent long-term outlook';
  } else if (analysis.liver_function_efficiency_percent >= 70) {
    analysis.overall_liver_health_status = 'Good';
    analysis.liver_longevity_outlook = 'Good long-term outlook with minor improvements needed';
  } else if (analysis.liver_function_efficiency_percent >= 50) {
    analysis.overall_liver_health_status = 'Fair';
    analysis.liver_longevity_outlook = 'Requires attention and lifestyle changes';
  } else if (analysis.liver_function_efficiency_percent >= 30) {
    analysis.overall_liver_health_status = 'Poor';
    analysis.liver_longevity_outlook = 'Needs urgent intervention and close monitoring';
  } else {
    analysis.overall_liver_health_status = 'Critical';
    analysis.liver_longevity_outlook = 'Critical condition requiring immediate medical attention';
  }

  if (effectiveFibrosis >= 3 || (lsm && lsm >= 9.6)) {
    analysis.primary_risk_drivers?.push('Advanced liver scarring');
    analysis.priority_urgent_important?.push('Prevent further liver scarring');
  }
  if (effectiveSteatosis >= 3 || (cap && cap >= 290)) {
    analysis.primary_risk_drivers?.push('High liver fat accumulation');
    analysis.priority_urgent_important?.push('Reduce liver fat through diet and exercise');
  }
  if (measurements.bmi_category === 'Obese' || measurements.visceral_fat_category === 'Obese') {
    analysis.primary_risk_drivers?.push('Obesity and excess visceral fat');
    analysis.priority_urgent_important?.push('Weight loss program');
  }
  if (measurements.lft_status === 'Abnormal' || (ast && ast > 40) || (alt && alt > 40)) {
    analysis.primary_risk_drivers?.push('Abnormal liver function tests');
    analysis.priority_urgent_important?.push('Monitor and normalize liver enzymes');
  }
  if (fib4.score && fib4.score > 3.25) {
    analysis.primary_risk_drivers?.push('High FIB-4 score indicating advanced fibrosis');
    analysis.priority_urgent_important?.push('Hepatology consultation recommended');
  }
  if (fast.score && fast.score >= 0.67) {
    analysis.primary_risk_drivers?.push('High FAST score indicating NASH with fibrosis');
    analysis.priority_urgent_important?.push('Comprehensive metabolic evaluation needed');
  }
  if (measurements.substance_usage?.includes('Alcohol') || measurements.substance_usage?.includes('Both')) {
    analysis.primary_risk_drivers?.push('Alcohol consumption');
    analysis.priority_urgent_important?.push('Eliminate or significantly reduce alcohol intake');
  }
  if (lsm && lsm >= 20) {
    analysis.primary_risk_drivers?.push('Very high LSM with elevated mortality risk');
    analysis.priority_urgent_important?.push('Urgent hepatology referral and intervention');
  }

  if (measurements.lipid_profile_status === 'Abnormal') {
    analysis.priority_urgent_not_important?.push('Improve lipid profile through diet');
  }
  if (measurements.stress_levels === 'High') {
    analysis.priority_urgent_not_important?.push('Stress management techniques');
  }
  if (measurements.sleep_quality === 'Poor') {
    analysis.priority_urgent_not_important?.push('Improve sleep quality and duration');
  }

  if (measurements.exercise_spiritual === 'Low') {
    analysis.priority_not_urgent_not_important?.push('Increase physical activity and spiritual well-being');
  }
  if (measurements.water_percentage_category === 'Low') {
    analysis.priority_not_urgent_not_important?.push('Improve hydration');
  }
  if (measurements.protein_percentage_category === 'Low') {
    analysis.priority_not_urgent_not_important?.push('Optimize protein intake');
  }

  if (effectiveFibrosis >= 3 || analysis.liver_function_efficiency_percent < 40 || (lsm && lsm >= 12.5)) {
    analysis.follow_up_frequency = 'Weekly';
  } else if (effectiveFibrosis >= 2 || effectiveSteatosis >= 3 || analysis.liver_function_efficiency_percent < 60 || (lsm && lsm >= 9.6)) {
    analysis.follow_up_frequency = 'Monthly';
  } else {
    analysis.follow_up_frequency = 'Quarterly';
  }

  return analysis as AnalysisResult;
}
