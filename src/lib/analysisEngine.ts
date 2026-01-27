import { Database } from './supabase';

type InputMeasurements = Database['public']['Tables']['input_measurements']['Row'];
type AnalysisResult = Database['public']['Tables']['rule_based_analysis']['Insert'];

export function analyzePatientData(measurements: InputMeasurements): AnalysisResult {
  const analysis: Partial<AnalysisResult> = {
    visit_id: measurements.visit_id,
    primary_risk_drivers: [],
    priority_urgent_important: [],
    priority_urgent_not_important: [],
    priority_not_urgent_not_important: []
  };

  const steatosisScore = parseInt(measurements.steatosis_grade.substring(1));
  const fibrosisScore = parseInt(measurements.fibrosis_stage.substring(1));

  analysis.fat_level =
    steatosisScore === 0 ? 'No fat accumulation' :
    steatosisScore === 1 ? 'Mild fat accumulation' :
    steatosisScore === 2 ? 'Moderate fat accumulation' :
    steatosisScore === 3 ? 'Significant fat accumulation' :
    'Severe fat accumulation';

  analysis.scarring_level =
    fibrosisScore === 0 ? 'No scarring' :
    fibrosisScore === 1 ? 'Minimal scarring' :
    fibrosisScore === 2 ? 'Moderate scarring' :
    fibrosisScore === 3 ? 'Advanced scarring' :
    'Cirrhosis (severe scarring)';

  let liverHealthScore = 100;
  liverHealthScore -= steatosisScore * 8;
  liverHealthScore -= fibrosisScore * 12;
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
  if (measurements.substance_usage.includes('Alcohol') || measurements.substance_usage.includes('Both')) liverHealthScore -= 10;
  if (measurements.substance_usage.includes('Smoking') || measurements.substance_usage.includes('Both')) liverHealthScore -= 5;

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

  if (fibrosisScore >= 3) {
    analysis.primary_risk_drivers?.push('Advanced liver scarring');
    analysis.priority_urgent_important?.push('Prevent further liver scarring');
  }
  if (steatosisScore >= 3) {
    analysis.primary_risk_drivers?.push('High liver fat accumulation');
    analysis.priority_urgent_important?.push('Reduce liver fat through diet and exercise');
  }
  if (measurements.bmi_category === 'Obese' || measurements.visceral_fat_category === 'Obese') {
    analysis.primary_risk_drivers?.push('Obesity and excess visceral fat');
    analysis.priority_urgent_important?.push('Weight loss program');
  }
  if (measurements.lft_status === 'Abnormal') {
    analysis.primary_risk_drivers?.push('Abnormal liver function tests');
    analysis.priority_urgent_important?.push('Monitor and normalize liver enzymes');
  }
  if (measurements.substance_usage.includes('Alcohol') || measurements.substance_usage.includes('Both')) {
    analysis.primary_risk_drivers?.push('Alcohol consumption');
    analysis.priority_urgent_important?.push('Eliminate or significantly reduce alcohol intake');
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

  if (fibrosisScore >= 3 || analysis.liver_function_efficiency_percent < 40) {
    analysis.follow_up_frequency = 'Weekly';
  } else if (fibrosisScore >= 2 || steatosisScore >= 3 || analysis.liver_function_efficiency_percent < 60) {
    analysis.follow_up_frequency = 'Monthly';
  } else {
    analysis.follow_up_frequency = 'Quarterly';
  }

  return analysis as AnalysisResult;
}
