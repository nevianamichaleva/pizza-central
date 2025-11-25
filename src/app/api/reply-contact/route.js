import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { contactData, replyMessage, replySubject, smtpConfig } = body;

    if (!contactData || !replyMessage) {
      return Response.json(
        { error: 'Missing contact data or reply message' },
        { status: 400 }
      );
    }
    
    if (!contactData.email) {
      return Response.json(
        { error: 'No email address found for this contact' },
        { status: 400 }
      );
    }

    // Get SMTP configuration from request or environment variables
    let smtpHost = smtpConfig?.smtpHost || process.env.SMTP_HOST;
    let smtpPort = smtpConfig?.smtpPort || process.env.SMTP_PORT || '587';
    let smtpUser = smtpConfig?.smtpUser || process.env.SMTP_USER;
    let smtpPassword = smtpConfig?.smtpPassword || process.env.SMTP_PASSWORD;
    let smtpSecure = smtpConfig?.smtpSecure !== undefined ? smtpConfig.smtpSecure : (process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465');
    let fromEmail = smtpConfig?.fromEmail || process.env.SMTP_FROM || process.env.SMTP_USER;

    // Check if SMTP configuration is available
    if (!smtpHost || !smtpUser || !smtpPassword) {
      return Response.json({
        success: false,
        error: 'SMTP конфигурацията не е настроена. Моля конфигурирайте SMTP настройките.'
      }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Prepare email content
    const emailSubject = replySubject || `Re: ${contactData.subject || 'Вашето съобщение'}`;
    const emailBody = `
Здравейте ${contactData.name || 'Уважаеми клиент'},

${replyMessage}

---
Това е отговор на вашето съобщение от ${new Date().toLocaleString('bg-BG')}:

Относно: ${contactData.subject || 'Няма тема'}
Съобщение: ${contactData.message || 'Няма съобщение'}

С уважение,
Екипът на Ресторант Централ
Телефон: +359 895 516 401
    `.trim();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #d4af37;">Ресторант Централ</h2>
        <p>Здравейте <strong>${contactData.name || 'Уважаеми клиент'}</strong>,</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          ${replyMessage.replace(/\n/g, '<br>')}
        </div>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <h4>Това е отговор на вашето съобщение:</h4>
          <p><strong>Относно:</strong> ${contactData.subject || 'Няма тема'}</p>
          <p><strong>Съобщение:</strong> ${contactData.message || 'Няма съобщение'}</p>
          <p><strong>Дата:</strong> ${new Date().toLocaleString('bg-BG')}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>С уважение,<br>
          <strong>Екипът на Ресторант Централ</strong><br>
          Телефон: +359 895 516 401</p>
        </div>
      </div>
    `;

    // Send email
    const mailOptions = {
      from: fromEmail,
      to: contactData.email,
      subject: emailSubject,
      text: emailBody,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: 'Отговорът е изпратен успешно!'
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    return Response.json({
      success: false,
      error: 'Грешка при изпращане на отговора',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    message: 'Reply Contact API - използвайте POST заявка с contactId и replyMessage'
  });
}
