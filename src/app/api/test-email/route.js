import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    // Get SMTP config from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const recipientEmail = testEmail || process.env.ADMIN_EMAIL;

    // Check if SMTP configuration is available
    if (!smtpHost || !smtpUser || !smtpPassword) {
      return Response.json({
        success: false,
        error: 'SMTP конфигурацията не е пълна. Моля проверете .env.local файла.',
        missing: {
          smtpHost: !smtpHost,
          smtpUser: !smtpUser,
          smtpPassword: !smtpPassword
        }
      }, { status: 400 });
    }

    if (!recipientEmail) {
      return Response.json({
        success: false,
        error: 'Няма посочен получател. Моля посочете testEmail или настройте ADMIN_EMAIL.'
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

    // Test connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return Response.json({
        success: false,
        error: 'SMTP връзката не може да бъде установена',
        details: verifyError.message
      }, { status: 400 });
    }

    // Send test email
    const mailOptions = {
      from: fromEmail,
      to: recipientEmail,
      subject: '🧪 Тестов мейл от Central Restaurant',
      text: `Това е тестов мейл за проверка на мейл конфигурацията.

Конфигурация:
- SMTP Host: ${smtpHost}
- SMTP Port: ${smtpPort}
- SMTP User: ${smtpUser}
- От: ${fromEmail}
- До: ${recipientEmail}

Ако получавате този мейл, конфигурацията работи правилно! ✅

Дата и час: ${new Date().toLocaleString('bg-BG')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d4af37;">🧪 Тестов мейл от Central Restaurant</h2>
          <p>Това е тестов мейл за проверка на мейл конфигурацията.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Конфигурация:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${smtpHost}</li>
              <li><strong>SMTP Port:</strong> ${smtpPort}</li>
              <li><strong>SMTP User:</strong> ${smtpUser}</li>
              <li><strong>От:</strong> ${fromEmail}</li>
              <li><strong>До:</strong> ${recipientEmail}</li>
            </ul>
          </div>
          
          <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; border: 1px solid #c3e6cb;">
            <strong>✅ Ако получавате този мейл, конфигурацията работи правилно!</strong>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            <small>Дата и час: ${new Date().toLocaleString('bg-BG')}</small>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: 'Тестовият мейл е изпратен успешно!',
      details: {
        from: fromEmail,
        to: recipientEmail,
        host: smtpHost,
        port: smtpPort
      }
    });

  } catch (error) {
    console.error('Error in test-email API:', error);
    return Response.json({
      success: false,
      error: 'Грешка при изпращане на тестов мейл',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    message: 'Test Email API - използвайте POST заявка с { "testEmail": "your-email@example.com" }'
  });
}
