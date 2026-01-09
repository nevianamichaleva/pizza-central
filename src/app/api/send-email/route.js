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

    // Currency conversion rate
    const EUR_RATE = 1.95583;
    
    // Format price in BGN and EUR
    const formatPrice = (priceInBGN) => {
      const bgn = parseFloat(priceInBGN || 0);
      const eur = (bgn / EUR_RATE).toFixed(2);
      return { bgn: bgn.toFixed(2), eur };
    };

    // Format order details
    const itemsList = orderData.items 
      ? Object.values(orderData.items).map(item => {
          const itemPrice = parseFloat(item.value || 0);
          const itemTotal = itemPrice * item.quantity;
          const priceFormatted = formatPrice(itemPrice);
          const totalFormatted = formatPrice(itemTotal);
          let itemLine = `- ${item.name} x${item.quantity} - ${priceFormatted.bgn} лв (${priceFormatted.eur}€) | Общо: ${totalFormatted.bgn} лв (${totalFormatted.eur}€)`;
          // If side dish is stored separately, show it explicitly
          if (item.sideDishName && !item.name.includes(item.sideDishName)) {
            itemLine += `\n  Гарнитура: ${item.sideDishName}`;
          }
          return itemLine;
        }).join('\n')
      : 'Няма артикули';

    // Get order type and calculate totals
    const orderType = orderData.order_type || 'pickup'; // 'pickup' or 'delivery'
    const pickupDiscount = parseFloat(orderData.pickup_discount || 0);
    const deliveryFee = parseFloat(orderData.delivery_fee || (orderType === 'delivery' ? 3.00 : 0));
    
    // Calculate subtotal (before discount/delivery fee)
    const grandTotal = parseFloat(orderData.total || 0);
    const subtotal = grandTotal - deliveryFee + pickupDiscount;

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
Име: ${orderData.user_name || orderData.name || 'Не е посочено'}
Телефон: ${orderData.user_phone || orderData.phone || 'Не е посочено'}
${orderType === 'delivery' ? `Адрес за доставка: ${orderData.user_address || orderData.delivery_address || 'Не е посочено'}` : ''}
Email: ${orderData.user_email || orderData.email || 'Не е посочено'}

Артикули:
${itemsList}

${orderData.special_notes ? `Специални забележки:
${orderData.special_notes}

` : ''}Начин на получаване: ${orderType === 'pickup' ? 'Вземане от ресторанта' : 'Доставка'}
${orderData.delivery_time && orderType === 'delivery' ? `Желан час за доставка: ${orderData.delivery_time}

` : ''}Сума: ${formatPrice(subtotal).bgn} лв (${formatPrice(subtotal).eur}€)
${pickupDiscount > 0 ? `Отстъпка за вземане (-10%): -${formatPrice(pickupDiscount).bgn} лв (-${formatPrice(pickupDiscount).eur}€)
` : ''}${deliveryFee > 0 ? `Доставка: ${formatPrice(deliveryFee).bgn} лв (${formatPrice(deliveryFee).eur}€)
` : ''}Общо: ${formatPrice(grandTotal).bgn} лв (${formatPrice(grandTotal).eur}€)
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
