import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { testEmail, smtpConfig: smtpConfigFromRequest } = body;

    // Prefer Firebase/admin UI SMTP when complete; otherwise env
    const req = smtpConfigFromRequest || {};
    const hasRequestAuth = Boolean(
      String(req.smtpUser || '').trim() && String(req.smtpPassword || '').trim()
    );

    let smtpHost;
    let smtpPort;
    let smtpUser;
    let smtpPassword;
    let smtpSecure;
    let fromEmail;

    if (hasRequestAuth) {
      smtpHost = req.smtpHost || process.env.SMTP_HOST;
      smtpPort = req.smtpPort || process.env.SMTP_PORT || '587';
      smtpUser = String(req.smtpUser).trim();
      smtpPassword = String(req.smtpPassword).replace(/\s+/g, '');
      smtpSecure =
        req.smtpSecure === true ||
        req.smtpSecure === 'true' ||
        String(smtpPort) === '465';
      fromEmail = req.fromEmail || req.smtpUser || process.env.SMTP_FROM;
    } else {
      smtpHost = process.env.SMTP_HOST;
      smtpPort = process.env.SMTP_PORT || '587';
      smtpUser = process.env.SMTP_USER;
      smtpPassword = String(process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
      smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
      fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    }

    const recipientEmail = testEmail || process.env.ADMIN_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      return Response.json(
        {
          success: false,
          error:
            'SMTP конфигурацията не е пълна. Попълнете SMTP настройките в админ панела (включително паролата) или environment variables.',
          missing: {
            smtpHost: !smtpHost,
            smtpUser: !smtpUser,
            smtpPassword: !smtpPassword,
          },
          smtpSource: hasRequestAuth ? 'firebase' : 'env',
        },
        { status: 400 }
      );
    }

    if (!recipientEmail) {
      return Response.json(
        {
          success: false,
          error:
            'Няма посочен получател. Моля посочете testEmail или настройте ADMIN_EMAIL.',
        },
        { status: 400 }
      );
    }

    // Multiple recipients supported (comma-separated)
    const recipients = String(recipientEmail)
      .split(/[,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: Boolean(smtpSecure),
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return Response.json(
        {
          success: false,
          error: 'SMTP връзката не може да бъде установена',
          details: verifyError.message,
          smtpSource: hasRequestAuth ? 'firebase' : 'env',
          smtpUser,
        },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: fromEmail,
      to: recipients.join(', '),
      subject: '🧪 Тестов мейл от Central Restaurant',
      text: `Това е тестов мейл за проверка на мейл конфигурацията.

Конфигурация:
- SMTP Host: ${smtpHost}
- SMTP Port: ${smtpPort}
- SMTP User: ${smtpUser}
- От: ${fromEmail}
- До: ${recipients.join(', ')}

Ако получавате този мейл, конфигурацията работи правилно! ✅

Дата и час: ${new Date().toLocaleString('bg-BG')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d4af37;">🧪 Тестов мейл от Central Restaurant</h2>
          <p>Това е тестов мейл за проверка на мейл конфигурацията.</p>
          <ul>
            <li><strong>SMTP Host:</strong> ${smtpHost}</li>
            <li><strong>SMTP Port:</strong> ${smtpPort}</li>
            <li><strong>SMTP User:</strong> ${smtpUser}</li>
            <li><strong>От:</strong> ${fromEmail}</li>
            <li><strong>До:</strong> ${recipients.join(', ')}</li>
          </ul>
          <p>Ако получавате този мейл, конфигурацията работи правилно! ✅</p>
          <p style="color:#666;font-size:12px;">Дата и час: ${new Date().toLocaleString('bg-BG')}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: `Тестовият мейл е изпратен успешно до ${recipients.join(', ')}`,
      smtpSource: hasRequestAuth ? 'firebase' : 'env',
    });
  } catch (error) {
    console.error('Error in test-email API:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Грешка при изпращане на тестов мейл',
      },
      { status: 500 }
    );
  }
}
