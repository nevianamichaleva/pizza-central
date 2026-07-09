import { validateContactAntiBot } from '@/lib/contactAntiBot';
import { getClientIp, verifyTurnstileToken } from '@/lib/verifyTurnstile';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      contactData,
      adminEmail: adminEmailFromRequest,
      smtpConfig: smtpConfigFromRequest,
      antiBot,
      turnstileToken,
    } = body;

    if (!contactData) {
      return Response.json(
        { error: 'Missing contact data' },
        { status: 400 }
      );
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      console.error('TURNSTILE_SECRET_KEY is not configured');
      return Response.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const turnstile = await verifyTurnstileToken(turnstileToken, getClientIp(request));
    if (!turnstile.success) {
      return Response.json({ error: 'Bot verification failed' }, { status: 403 });
    }

    const botCheck = validateContactAntiBot(antiBot);
    if (!botCheck.ok) {
      if (botCheck.code === 'honeypot') {
        return Response.json({ success: true, message: 'OK' });
      }
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get recipient email from request or environment
    const recipientEmail = adminEmailFromRequest || process.env.ADMIN_EMAIL;

    if (!recipientEmail) {
      return Response.json(
        { error: 'No recipient email configured. Please set email in admin settings or ADMIN_EMAIL environment variable.' },
        { status: 400 }
      );
    }

    // Format contact details
    const emailSubject = `Ново съобщение от контактна форма - ${contactData.subject || 'Без тема'}`;
    const emailBody = `
Ново съобщение е получено от контактната форма!

Детайли:
Име: ${contactData.name || 'Не е посочено'}
Email: ${contactData.email || 'Не е посочено'}
Телефон: ${contactData.phone || 'Не е посочено'}
Тема: ${contactData.subject || 'Не е посочено'}
Съобщение:
${contactData.message || 'Няма съобщение'}
    `.trim();

    // Try to send email using nodemailer
    try {
      let transporter;
      
      // Get SMTP config from request, environment variables, or Firebase
      let smtpHost = smtpConfigFromRequest?.smtpHost || process.env.SMTP_HOST;
      let smtpPort = smtpConfigFromRequest?.smtpPort || process.env.SMTP_PORT || '587';
      let smtpUser = smtpConfigFromRequest?.smtpUser || process.env.SMTP_USER;
      let smtpPassword = smtpConfigFromRequest?.smtpPassword || process.env.SMTP_PASSWORD;
      let smtpSecure = smtpConfigFromRequest?.smtpSecure || process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
      let fromEmail = smtpConfigFromRequest?.fromEmail || process.env.SMTP_FROM || process.env.SMTP_USER;
      
      // Check if SMTP configuration is available
      if (smtpHost && smtpUser && smtpPassword) {
        // Use environment variables for SMTP
        transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });

        // Send email
        const mailOptions = {
          from: fromEmail,
          to: recipientEmail,
          subject: emailSubject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br>'),
        };

        await transporter.sendMail(mailOptions);

        return Response.json({ success: true, message: 'Email sent successfully' });
      } else {
        // Fallback: Log the email
        console.log('Email notification (SMTP not configured):', {
          to: recipientEmail,
          subject: emailSubject,
          body: emailBody,
        });

        return Response.json({ 
          success: true, 
          message: 'Email logged (configure SMTP environment variables for actual sending)',
          logged: true 
        });
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Still return success to not block the contact process
      return Response.json({ 
        success: true, 
        message: 'Contact saved, but email failed to send',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error in send-contact-email API:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}




