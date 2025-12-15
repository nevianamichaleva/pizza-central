import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingData, adminEmail: adminEmailFromRequest, smtpConfig: smtpConfigFromRequest } = body;

    if (!bookingData) {
      return Response.json(
        { error: 'Missing booking data' },
        { status: 400 }
      );
    }

    // Get recipient email from request or environment
    const recipientEmail = adminEmailFromRequest || process.env.ADMIN_EMAIL;

    if (!recipientEmail) {
      return Response.json(
        { error: 'No recipient email configured. Please set email in admin settings or ADMIN_EMAIL environment variable.' },
        { status: 400 }
      );
    }

    // Format booking details
    const emailSubject = `Нова резервация - ${bookingData.name || 'Без име'}`;
    const emailBody = `
Нова резервация е получена!

Детайли на резервацията:
Име: ${bookingData.name || 'Не е посочено'}
Email: ${bookingData.email || 'Не е посочено'}
Телефон: ${bookingData.phone || 'Не е посочено'}
Дата: ${bookingData.date || 'Не е посочено'}
Час: ${bookingData.time || 'Не е посочено'}
Брой хора: ${bookingData.people || 'Не е посочено'}
${bookingData.message ? `Съобщение:
${bookingData.message}` : ''}
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
      // Still return success to not block the booking process
      return Response.json({ 
        success: true, 
        message: 'Booking saved, but email failed to send',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error in send-booking-email API:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}




