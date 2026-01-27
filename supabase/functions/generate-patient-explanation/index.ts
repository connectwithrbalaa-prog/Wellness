import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  analysis: {
    overall_liver_health_status: string;
    fat_level: string;
    scarring_level: string;
    liver_function_efficiency_percent: number;
    liver_longevity_outlook: string;
    primary_risk_drivers: string[];
    priority_urgent_important: string[];
    priority_urgent_not_important: string[];
    priority_not_urgent_not_important: string[];
    follow_up_frequency: string;
  };
  measurements: {
    steatosis_grade: string;
    fibrosis_stage: string;
    bmi_category: string;
    visceral_fat_category: string;
    water_percentage_category: string;
    protein_percentage_category: string;
    usg_abdomen: string;
    lft_status: string;
    lipid_profile_status: string;
    diet_habits: string;
    sleep_quality: string;
    exercise_spiritual: string;
    stress_levels: string;
    substance_usage: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { analysis, measurements }: GenerateRequest = await req.json();

    const prompt = `You are a compassionate medical communicator helping patients understand their liver health results.

CRITICAL INSTRUCTIONS:
- Write in simple, reassuring language for a non-medical audience
- Avoid medical jargon; if you must use a medical term, explain it in plain words
- Be encouraging and motivational, never alarming
- Focus on lifestyle changes and patient empowerment
- Do not prescribe medications
- Emphasize that the liver can heal with proper support

ANALYSIS DATA:
- Overall Status: ${analysis.overall_liver_health_status}
- Fat Level: ${analysis.fat_level}
- Scarring Level: ${analysis.scarring_level}
- Liver Function: ${analysis.liver_function_efficiency_percent}%
- Outlook: ${analysis.liver_longevity_outlook}
- Risk Drivers: ${analysis.primary_risk_drivers.join(', ')}
- Follow-up: ${analysis.follow_up_frequency}

PATIENT MEASUREMENTS:
- FibroScan: ${measurements.steatosis_grade} (fat), ${measurements.fibrosis_stage} (scarring)
- BMI: ${measurements.bmi_category}
- Visceral Fat: ${measurements.visceral_fat_category}
- Sleep: ${measurements.sleep_quality}
- Exercise: ${measurements.exercise_spiritual}
- Stress: ${measurements.stress_levels}
- Substances: ${measurements.substance_usage}
- Diet: ${measurements.diet_habits || 'Not specified'}

Generate a comprehensive patient report with these sections:

# Your Liver Health Report

**Important**: This explanation is for your understanding only and must be reviewed by your doctor before any action is taken.

## Overall Liver Health Summary
[Explain the overall status in simple terms, include liver function percentage and what it means]

## What the Results Show
[Explain fat level and scarring in simple, understandable terms. Use analogies if helpful]

## What This Means for You
[List the main factors affecting their liver health. Be specific but encouraging]

## What You Can Do Now

### Food Choices
[Specific, actionable dietary advice based on their measurements]

### Physical Activity
[Specific exercise recommendations based on their current level]

### Sleep & Stress Management
[Advice on sleep and stress based on their reported levels]

[Include substance use section if applicable]

## Priority Actions (80/20 Rule)

### Urgent and Important (Do These First)
[List from priority_urgent_important array]

### Important for Overall Wellness
[List from priority_urgent_not_important array]

## Follow-Up Plan
[Explain the follow-up frequency and why it matters]

## Remember
- Your liver has an incredible ability to heal when given the right support
- Small, consistent changes are more powerful than dramatic, short-term efforts
- You are not alone in this journey - your healthcare team is here to support you
- Progress takes time, so be patient and kind to yourself

---

**Doctor Review Required**: This explanation must be reviewed and approved by your doctor before any action is taken. Please discuss all recommendations with your healthcare provider.`;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      console.log('OpenAI API key not configured, using template generation');
      const templateExplanation = generateTemplateExplanation(analysis, measurements);
      return new Response(
        JSON.stringify({ explanation: templateExplanation }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate medical communication expert specializing in liver health education. You explain medical information in simple, encouraging terms that empower patients without alarming them.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      const templateExplanation = generateTemplateExplanation(analysis, measurements);
      return new Response(
        JSON.stringify({ explanation: templateExplanation }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ explanation }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function generateTemplateExplanation(analysis: any, measurements: any): string {
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
