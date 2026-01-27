import { Database } from './supabase';
import { supabase } from './supabase';

type AnalysisResult = Database['public']['Tables']['rule_based_analysis']['Insert'];
type InputMeasurements = Database['public']['Tables']['input_measurements']['Row'];

export async function generatePatientExplanation(
  analysis: AnalysisResult,
  measurements: InputMeasurements
): Promise<string> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-patient-explanation`;

    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysis, measurements }),
    });

    if (!response.ok) {
      console.warn('AI generation failed, using template fallback');
      return generateTemplateExplanation(analysis, measurements);
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Error calling AI function:', error);
    return generateTemplateExplanation(analysis, measurements);
  }
}

function generateTemplateExplanation(
  analysis: AnalysisResult,
  measurements: InputMeasurements
): string {
  const sections: string[] = [];

  sections.push('# Your Liver Health Report\n');
  sections.push('**Important**: This explanation is for your understanding only and must be reviewed by your doctor before any action is taken.\n');

  sections.push('\n## Overall Liver Health Summary\n');
  sections.push(`Your liver health is currently rated as **${analysis.overall_liver_health_status}**. `);
  sections.push(`Your liver is functioning at approximately **${analysis.liver_function_efficiency_percent}%** of optimal capacity. `);
  sections.push(`${analysis.liver_longevity_outlook}.\n`);

  sections.push('\n## What the Results Show\n');
  sections.push(`**Fat in the Liver**: ${analysis.fat_level}. `);
  if (analysis.fat_level.includes('No fat')) {
    sections.push('This is excellent. Your liver has minimal fat, which is ideal for liver health.\n\n');
  } else if (analysis.fat_level.includes('Mild')) {
    sections.push('This means your liver has some extra fat, but it is still in the early stages. This can often be reversed with lifestyle changes.\n\n');
  } else {
    sections.push('This means your liver has accumulated a significant amount of fat. This is a condition that needs attention, but the good news is that lifestyle changes can help improve it.\n\n');
  }

  sections.push(`**Liver Scarring**: ${analysis.scarring_level}. `);
  if (analysis.scarring_level.includes('No scarring')) {
    sections.push('Your liver tissue is healthy with no scarring.\n\n');
  } else if (analysis.scarring_level.includes('Minimal')) {
    sections.push('Your liver shows minimal scarring. Early intervention can prevent this from progressing.\n\n');
  } else {
    sections.push('Your liver shows scarring, which is a sign that it has been under stress. It is important to work with your doctor to prevent further damage.\n\n');
  }

  sections.push('\n## What This Means for You\n');
  if (analysis.primary_risk_drivers && analysis.primary_risk_drivers.length > 0) {
    sections.push('The main factors affecting your liver health are:\n\n');
    analysis.primary_risk_drivers.forEach((driver: string) => {
      sections.push(`- ${driver}\n`);
    });
    sections.push('\n');
  }

  sections.push('Your body is telling us that it needs some support. The liver is an amazing organ that can heal itself when given the right conditions. Small, consistent changes in your daily habits can make a big difference.\n');

  sections.push('\n## What You Can Do Now\n');

  sections.push('\n### Food Choices\n');
  if (measurements.bmi_category === 'Obese' || measurements.visceral_fat_category === 'Obese') {
    sections.push('- Focus on eating more vegetables, fruits, and whole grains\n');
    sections.push('- Reduce portions gradually and avoid processed foods\n');
    sections.push('- Limit sugary drinks and snacks\n');
    sections.push('- Choose lean proteins like fish, chicken, and legumes\n');
  } else {
    sections.push('- Continue eating a balanced diet with plenty of vegetables and fruits\n');
    sections.push('- Keep your protein intake adequate\n');
    sections.push('- Limit processed and fried foods\n');
  }

  if (measurements.substance_usage.includes('Alcohol') || measurements.substance_usage.includes('Both')) {
    sections.push('- **Important**: Reduce or eliminate alcohol consumption as it directly affects liver health\n');
  }

  sections.push('\n### Physical Activity\n');
  if (measurements.exercise_spiritual === 'Low') {
    sections.push('- Start with 15-20 minutes of walking daily and gradually increase\n');
    sections.push('- Find activities you enjoy, whether it is dancing, gardening, or playing with family\n');
    sections.push('- Movement helps reduce liver fat and improves overall health\n');
  } else {
    sections.push('- Continue your current level of physical activity\n');
    sections.push('- Try to maintain consistency in your exercise routine\n');
  }

  sections.push('\n### Sleep & Stress Management\n');
  if (measurements.sleep_quality === 'Poor') {
    sections.push('- Aim for 7-8 hours of quality sleep each night\n');
    sections.push('- Try to maintain a regular sleep schedule\n');
    sections.push('- Create a calming bedtime routine\n');
  }
  if (measurements.stress_levels === 'High') {
    sections.push('- Practice stress-reduction techniques like deep breathing, meditation, or prayer\n');
    sections.push('- Make time for activities that bring you peace and joy\n');
    sections.push('- Consider talking to someone you trust about what is causing you stress\n');
  }

  if (measurements.substance_usage.includes('Smoking') || measurements.substance_usage.includes('Both')) {
    sections.push('\n### Substance Use\n');
    sections.push('- Consider quitting smoking as it affects your overall health and liver recovery\n');
    sections.push('- Ask your doctor about support programs for quitting\n');
  }

  sections.push('\n## Priority Actions (80/20 Rule)\n');
  sections.push('\nThese are the most important actions that will give you the biggest benefit:\n\n');

  sections.push('### Urgent and Important (Do These First)\n');
  if (analysis.priority_urgent_important && analysis.priority_urgent_important.length > 0) {
    analysis.priority_urgent_important.forEach((action: string) => {
      sections.push(`- ${action}\n`);
    });
  } else {
    sections.push('- Continue maintaining your healthy habits\n');
  }

  if (analysis.priority_urgent_not_important && analysis.priority_urgent_not_important.length > 0) {
    sections.push('\n### Important for Overall Wellness\n');
    analysis.priority_urgent_not_important.forEach((action: string) => {
      sections.push(`- ${action}\n`);
    });
  }

  sections.push('\n## Follow-Up Plan\n');
  sections.push(`Your doctor recommends seeing you again **${analysis.follow_up_frequency.toLowerCase()}** to monitor your progress and adjust your plan as needed.\n`);

  sections.push('\n## Remember\n');
  sections.push('- Your liver has an incredible ability to heal when given the right support\n');
  sections.push('- Small, consistent changes are more powerful than dramatic, short-term efforts\n');
  sections.push('- You are not alone in this journey - your healthcare team is here to support you\n');
  sections.push('- Progress takes time, so be patient and kind to yourself\n');

  sections.push('\n---\n');
  sections.push('\n**Doctor Review Required**: This explanation must be reviewed and approved by your doctor before any action is taken. Please discuss all recommendations with your healthcare provider.\n');

  return sections.join('');
}
