import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  patientName: string;
  reportContent: string;
  visitDate: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, patientName, reportContent, visitDate }: EmailRequest = await req.json();

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    console.log('Sending email to:', to);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 10px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 30px;
      padding: 20px;
      background: #f3f4f6;
      border-radius: 10px;
      font-size: 14px;
      color: #6b7280;
    }
    h2 {
      color: #059669;
      margin-top: 25px;
    }
    h3 {
      color: #047857;
      margin-top: 20px;
    }
    strong {
      color: #1f2937;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🫀 Liver Wellness Report</h1>
    <p>Clinical Decision Support System</p>
  </div>

  <p>Dear ${patientName},</p>

  <p>Please find your liver health report from your visit on ${visitDate}.</p>

  <div class="content">
${reportContent.replace(/\n/g, '<br>').replace(/# /g, '<h2>').replace(/## /g, '<h3>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
  </div>

  <div class="footer">
    <p><strong>Important:</strong> This report has been reviewed and approved by your doctor. Please follow the recommendations discussed during your consultation.</p>
    <p>If you have any questions or concerns, please contact your healthcare provider.</p>
    <p style="margin-top: 20px; font-size: 12px;">This is an automated message from the Liver Wellness Portal. Please do not reply to this email.</p>
  </div>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Liver Wellness Portal <onboarding@resend.dev>',
        to: [to],
        subject: `Your Liver Health Report - ${visitDate}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }
      console.error('Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails
      });
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: errorDetails,
          status: response.status,
          info: 'Using onboarding@resend.dev requires verified recipient emails. Please add and verify your domain in Resend, or verify the recipient email address.'
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
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
