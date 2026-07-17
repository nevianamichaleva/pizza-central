import { verifyFormSubmission } from '@/lib/verifyFormSubmission';
import nodemailer from 'nodemailer';
import { formatOrderDate } from '@/utils/orderNumberUtils';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderData,
      adminEmail: adminEmailFromRequest,
      smtpConfig: smtpConfigFromRequest,
      antiBot,
      turnstileToken,
    } = body;

    if (!orderData) {
      return Response.json(
        { error: 'Missing order data' },
        { status: 400 }
      );
    }

    // Guest orders (no user_id) must pass Turnstile. Timing checks are skipped —
    // checkout pages stay open longer than contact forms.
    const isGuestOrder = !orderData.user_id;
    if (isGuestOrder) {
      if (!turnstileToken) {
        console.error('Order email blocked: guest order without Turnstile token');
        return Response.json(
          { error: 'Bot verification required', code: 'missing_turnstile' },
          { status: 403 }
        );
      }
      const submission = await verifyFormSubmission(
        { antiBot, turnstileToken },
        request,
        { turnstileOnly: true }
      );
      if (!submission.ok) {
        if (submission.honeypot) {
          return Response.json({ success: true, message: 'OK' });
        }
        console.error('Order email blocked by bot check:', submission.error);
        return Response.json(
          { error: submission.error || 'Invalid request', code: submission.error },
          { status: submission.status }
        );
      }
    }

    // Same as contact form: Firebase/client SMTP first, then server env
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
      const bgnStr = bgn.toFixed(2);
      return {
        bgn: bgnStr,
        eur,
        both: `${eur}€ (${bgnStr} лв)`,
        bothNeg: `-${eur}€ (-${bgnStr} лв)`,
      };
    };

    // Format order details
    // Separate products from packaging items
    const products = [];
    const packagingItems = [];
    
    if (orderData.items) {
      Object.entries(orderData.items).forEach(([itemKey, item]) => {
        if (item.isPackaging && item.hiddenInCart) {
          // This is a packaging item that was hidden in cart
          packagingItems.push({ key: itemKey, ...item });
        } else if (!item.isPackaging) {
          // This is a regular product
          products.push({ key: itemKey, ...item });
        }
      });
    }
    
    // Build items list
    const itemsList = products.length > 0 || packagingItems.length > 0
      ? products.map(product => {
          // Find packaging items linked to this product
          const linkedPackaging = packagingItems.filter(pack => pack.linkedToItemId === product.key);
          
          // product.value already includes hidden linked packaging (same as cart/menu total)
          const unitPrice = parseFloat(product.value || 0);
          const productTotal = unitPrice * product.quantity;
          const priceFormatted = formatPrice(unitPrice);
          const totalFormatted = formatPrice(productTotal);
          
          let itemLine = `- ${product.name} x${product.quantity} - ${priceFormatted.both} | Общо: ${totalFormatted.both}`;
          
          // If side dish is stored separately, show it explicitly
          if (product.sideDishName && !product.name.includes(product.sideDishName)) {
            itemLine += `\n  Гарнитура: ${product.sideDishName}`;
          }
          
          // Add packaging items on separate lines
          if (linkedPackaging.length > 0) {
            linkedPackaging.forEach(pack => {
              itemLine += `\n  └ ${pack.name} x${pack.quantity} (включена в цената на продукта)`;
            });
          }
          
          return itemLine;
        }).join('\n')
      : 'Няма артикули';

    // Get order type and calculate totals
    const orderType = orderData.order_type || 'pickup'; // 'pickup' or 'delivery'
    const pickupDiscount = parseFloat(orderData.pickup_discount || 0);
    const registeredUserDiscount = parseFloat(orderData.registered_user_discount || 0);
    const registeredUserDiscountPercent = orderData.registered_user_discount_percent != null ? Number(orderData.registered_user_discount_percent) : null;
    // Use ?? so that 0 (free delivery) is not replaced by fallback
    const deliveryFee = parseFloat(orderData.delivery_fee ?? (orderType === 'delivery' ? 3.00 : 0));
    
    // Calculate subtotal (products only, before discounts)
    const grandTotal = parseFloat(orderData.total || 0);
    const subtotal = grandTotal - deliveryFee + pickupDiscount + registeredUserDiscount;

    const orderNumber = orderData.order_number ? `ORD-${String(orderData.order_number).padStart(4, '0')}` : (orderData.id || 'N/A');
    const emailSubject = `Нова поръчка #${orderNumber}`;
    const emailBody = `
Нова поръчка е получена!

Детайли на поръчката:
Номер на поръчка: ${orderNumber}
ID: ${orderData.id || 'N/A'}
Дата: ${orderData.order_date || formatOrderDate()}
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
Начин на плащане: ${orderData.pay_with_card ? 'Желая да платя с карта при доставката' : 'В брой'}
${orderData.delivery_time && orderType === 'delivery' ? `Желан час за доставка: ${orderData.delivery_time}

` : ''}Сума: ${formatPrice(subtotal).both}
${orderType === 'delivery' ? `Доставка: ${formatPrice(deliveryFee).both}
` : ''}${registeredUserDiscount > 0 ? `Отстъпка за регистрирани (-${registeredUserDiscountPercent != null ? registeredUserDiscountPercent : ''}% върху продукти и доставка): ${formatPrice(registeredUserDiscount).bothNeg}
` : ''}${pickupDiscount > 0 ? `Отстъпка за вземане (-10%): ${formatPrice(pickupDiscount).bothNeg}
` : ''}Общо: ${formatPrice(grandTotal).both}
    `.trim();

    // Try to send email using nodemailer
    try {
      let transporter;

      // IMPORTANT: never mix Firebase user with env password (causes Gmail 535).
      // Use a complete Firebase/client config, otherwise fall back entirely to env.
      const req = smtpConfigFromRequest || {};
      const hasRequestAuth = Boolean(
        String(req.smtpUser || '').trim() && String(req.smtpPassword || '').trim()
      );
      const smtpSource = hasRequestAuth ? 'firebase' : 'env';

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
        smtpSecure = req.smtpSecure === true || req.smtpSecure === 'true' || String(smtpPort) === '465';
        fromEmail = req.fromEmail || req.smtpUser || process.env.SMTP_FROM;
      } else {
        smtpHost = process.env.SMTP_HOST;
        smtpPort = process.env.SMTP_PORT || '587';
        smtpUser = process.env.SMTP_USER;
        smtpPassword = String(process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
        smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
        fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
      }

      // Check if SMTP configuration is available
      if (smtpHost && smtpUser && smtpPassword) {
        transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: Boolean(smtpSecure),
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });

        const mailOptions = {
          from: fromEmail,
          to: recipientEmail,
          subject: emailSubject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br>'),
        };

        await transporter.sendMail(mailOptions);

        return Response.json({ success: true, message: 'Email sent successfully', smtpSource });
      } else {
        console.log('Email notification (SMTP not configured):', {
          to: recipientEmail,
          subject: emailSubject,
          smtpSource,
          hasRequestAuth,
        });

        return Response.json({
          success: true,
          message: 'Email logged (configure SMTP environment variables for actual sending)',
          logged: true,
          smtpSource,
        });
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      const req = smtpConfigFromRequest || {};
      const hasRequestAuth = Boolean(
        String(req.smtpUser || '').trim() && String(req.smtpPassword || '').trim()
      );
      return Response.json(
        {
          success: false,
          message: 'Order saved, but email failed to send',
          error: emailError.message,
          smtpSource: hasRequestAuth ? 'firebase' : 'env',
          smtpUser: hasRequestAuth
            ? String(req.smtpUser || '').trim()
            : process.env.SMTP_USER || null,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-email API:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
