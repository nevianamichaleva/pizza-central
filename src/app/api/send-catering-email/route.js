import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cateringData, adminEmail: adminEmailFromRequest, smtpConfig: smtpConfigFromRequest } = body;

    if (!cateringData) {
      return Response.json(
        { error: 'Missing catering data' },
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

    // Get event type label
    const eventTypeLabels = {
      'firmeno': 'Фирмено събитие',
      'rozhden-den': 'Рожден ден',
      'krushtene': 'Кръщене',
      'chastno-parti': 'Частно парти',
      'sreshta': 'Среща/Обучение',
      'prezentatsiya': 'Презентация',
      'kokteyl': 'Коктейл',
      'drugo': 'Друго',
    };
    const eventTypeLabel = eventTypeLabels[cateringData.eventType] || cateringData.eventType || 'Не е посочено';

    // Format catering details
    const emailSubject = `Нова заявка за кетъринг - ${cateringData.name || 'Без име'}`;
    const emailBody = `
Нова заявка за кетъринг е получена!

Детайли на заявката:
Име: ${cateringData.name || 'Не е посочено'}
Телефон: ${cateringData.phone || 'Не е посочено'}
Email: ${cateringData.email || 'Не е посочено'}
Дата на събитието: ${cateringData.date || 'Не е посочено'}
Брой гости: ${cateringData.people || 'Не е посочено'}
Вид събитие: ${eventTypeLabel}
${cateringData.message ? `Допълнителни уточнения:
${cateringData.message}` : ''}
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
      // Still return success to not block the catering process
      return Response.json({ 
        success: true, 
        message: 'Catering request saved, but email failed to send',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error in send-catering-email API:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

