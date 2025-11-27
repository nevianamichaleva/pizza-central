import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderData, adminEmail: adminEmailFromRequest, smtpConfig: smtpConfigFromRequest } = body;

    if (!orderData) {
      return Response.json(
        { error: 'Missing order data' },
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

    // Format order details
    const itemsList = orderData.items 
      ? Object.values(orderData.items).map(item => 
          `- ${item.name} x${item.quantity} - ${parseFloat(item.value || 0).toFixed(2)} лв`
        ).join('\n')
      : 'Няма артикули';

    const total = parseFloat(orderData.total || 0).toFixed(2);
    const deliveryFee = 3.00;
    const grandTotal = (parseFloat(orderData.total || 0) + deliveryFee).toFixed(2);

    const orderNumber = orderData.order_number ? `ORD-${String(orderData.order_number).padStart(4, '0')}` : (orderData.id || 'N/A');
    const emailSubject = `Нова поръчка #${orderNumber}`;
    const emailBody = `
Нова поръчка е получена!

Детайли на поръчката:
Номер на поръчка: ${orderNumber}
ID: ${orderData.id || 'N/A'}
Дата: ${orderData.order_date || new Date().toLocaleString()}
Статус: ${orderData.status || 'pending'}

Клиент:
Име: ${orderData.user_email || 'Не е посочено'}
Телефон: ${orderData.user_phone || orderData.phone || 'Не е посочено'}
Адрес: ${orderData.user_address || orderData.delivery_address || 'Не е посочено'}
Email: ${orderData.user_email || orderData.email || 'Не е посочено'}

Артикули:
${itemsList}

${orderData.special_notes ? `Специални забележки:
${orderData.special_notes}

` : ''}${orderData.delivery_time ? `Желан час за доставка: ${orderData.delivery_time}

` : ''}Сума: ${total} лв
Доставка: ${deliveryFee.toFixed(2)} лв
Общо: ${grandTotal} лв
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
      // Still return success to not block the order process
      return Response.json({ 
        success: true, 
        message: 'Order saved, but email failed to send',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error in send-email API:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
