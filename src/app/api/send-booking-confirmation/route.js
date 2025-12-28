import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingData, smtpConfig: smtpConfigFromRequest } = body;

    if (!bookingData || !bookingData.email) {
      return Response.json(
        { error: 'Missing booking data or customer email' },
        { status: 400 }
      );
    }

    // Format confirmation email
    const emailSubject = 'Потвърждение на резервация - Ресторант-пицария Централ';
    
    const emailBodyText = `
Здравейте,

Благодарим Ви за направената резервация в Ресторант-пицария Централ – Добрич!

📅 Дата: ${bookingData.date || 'Не е посочено'}
⏰ Час: ${bookingData.time || 'Не е посочено'}
👥 Брой гости: ${bookingData.people || 'Не е посочено'}

Очакваме Ви на адрес:
гр. Добрич, ул. Независимост 4

Ако имате специални изисквания или желаете промяна по резервацията, не се колебайте да се свържете с нас:
📞 0895 516 401 | 0893 315 201

Ще се радваме да Ви посрещнем и да се погрижим за приятното Ви изживяване при нас.

С уважение,
Екипът на ресторант-пицария Централ
    `.trim();

    const emailBodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .details {
      margin: 15px 0;
      font-size: 16px;
    }
    .detail-item {
      margin: 10px 0;
    }
    .detail-label {
      font-weight: bold;
      margin-right: 10px;
    }
    .address {
      background-color: #fff;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #d32f2f;
    }
    .contact {
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 14px;
      color: #666;
    }
    .signature {
      font-weight: bold;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Потвърждение на резервация</h2>
  </div>
  
  <div class="content">
    <p>Здравейте,</p>
    
    <p>Благодарим Ви за направената резервация в <strong>Ресторант-пицария Централ – Добрич!</strong></p>
    
    <div class="details">
      <div class="detail-item">
        <span class="detail-label">📅 Дата:</span> ${bookingData.date || 'Не е посочено'}
      </div>
      <div class="detail-item">
        <span class="detail-label">⏰ Час:</span> ${bookingData.time || 'Не е посочено'}
      </div>
      <div class="detail-item">
        <span class="detail-label">👥 Брой гости:</span> ${bookingData.people || 'Не е посочено'}
      </div>
    </div>
    
    <div class="address">
      <p><strong>Очакваме Ви на адрес:</strong></p>
      <p><strong>гр. Добрич, ул. Независимост 4</strong></p>
    </div>
    
    <div class="contact">
      <p>Ако имате специални изисквания или желаете промяна по резервацията, не се колебайте да се свържете с нас:</p>
      <p>📞 <strong>0895 516 401</strong> | <strong>0893 315 201</strong></p>
    </div>
    
    <p>Ще се радваме да Ви посрещнем и да се погрижим за приятното Ви изживяване при нас.</p>
    
    <p class="signature">С уважение,<br>
    <strong>Екипът на ресторант-пицария Централ</strong></p>
  </div>
  
  <div class="footer">
    <p>Ресторант-пицария Централ Добрич</p>
  </div>
</body>
</html>
    `;

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

        // Send email to customer
        const mailOptions = {
          from: fromEmail,
          to: bookingData.email,
          subject: emailSubject,
          text: emailBodyText,
          html: emailBodyHtml,
        };

        await transporter.sendMail(mailOptions);

        return Response.json({ success: true, message: 'Confirmation email sent successfully' });
      } else {
        // Fallback: Log the email
        console.log('Confirmation email (SMTP not configured):', {
          to: bookingData.email,
          subject: emailSubject,
          body: emailBodyText,
        });

        return Response.json({ 
          success: true, 
          message: 'Confirmation email logged (configure SMTP environment variables for actual sending)',
          logged: true 
        });
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Still return success to not block the booking process
      return Response.json({ 
        success: true, 
        message: 'Booking saved, but confirmation email failed to send',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error in send-booking-confirmation API:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

