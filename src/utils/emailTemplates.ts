interface TicketEmailData {
  ticketNumber: string
  passengerName: string
  tripName: string
  fromTerminal: string
  toTerminal: string
  departureDate: string
  departureTime: string
  seatNumbers: string[]
  totalPrice: number
  isPaid: boolean
  paymentMethod: string
  paymentDeadline?: string
}

export const generateTicketConfirmationEmail = (data: TicketEmailData) => {
  const {
    ticketNumber,
    passengerName,
    tripName,
    fromTerminal,
    toTerminal,
    departureDate,
    departureTime,
    seatNumbers,
    totalPrice,
    isPaid,
    paymentMethod,
    paymentDeadline,
  } = data

  const seatNumbersText = seatNumbers.join(', ')
  const paymentStatus = isPaid ? 'پرداخت شده' : 'در انتظار پرداخت'
  const paymentMethodText =
    {
      cash: 'نقدی',
      card: 'کارت',
      bank_transfer: 'حواله بانکی',
      mobile_money: 'پول موبایل',
    }[paymentMethod] || paymentMethod

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تایید رزرو تکت شما</title>
        <style>
          body { 
            font-family: Tahoma, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4; 
            margin: 0; 
            padding: 20px; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 15px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold; 
          }
          .ticket-number { 
            background: rgba(255,255,255,0.2); 
            padding: 10px 20px; 
            border-radius: 25px; 
            margin-top: 15px; 
            font-size: 18px; 
            font-weight: bold; 
          }
          .content { 
            padding: 30px 20px; 
          }
          .trip-info { 
            background: linear-gradient(135deg, #f97316, #dc2626); 
            color: white; 
            padding: 20px; 
            border-radius: 10px; 
            margin-bottom: 25px; 
            text-align: center; 
          }
          .trip-route { 
            font-size: 22px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .trip-name { 
            font-size: 16px; 
            opacity: 0.9; 
          }
          .details-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 25px; 
          }
          .detail-item { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            border-right: 4px solid #f97316; 
          }
          .detail-label { 
            font-size: 12px; 
            color: #666; 
            margin-bottom: 5px; 
            text-transform: uppercase; 
            font-weight: bold; 
          }
          .detail-value { 
            font-size: 16px; 
            font-weight: bold; 
            color: #333; 
          }
          .full-width { 
            grid-column: 1 / -1; 
          }
          .payment-status { 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 25px; 
            text-align: center; 
            font-weight: bold; 
          }
          .payment-paid { 
            background: #d1fae5; 
            color: #065f46; 
            border: 2px solid #10b981; 
          }
          .payment-pending { 
            background: #fef3c7; 
            color: #92400e; 
            border: 2px solid #f59e0b; 
          }
          .important-notes { 
            background: #e0f2fe; 
            border: 2px solid #0284c7; 
            padding: 20px; 
            border-radius: 10px; 
            margin-bottom: 25px; 
          }
          .important-notes h3 { 
            color: #0369a1; 
            margin-top: 0; 
            margin-bottom: 15px; 
          }
          .important-notes ul { 
            margin: 0; 
            padding-right: 20px; 
          }
          .important-notes li { 
            margin-bottom: 8px; 
            color: #0c4a6e; 
          }
          .footer { 
            background: #f8f9fa; 
            padding: 25px 20px; 
            text-align: center; 
            border-top: 1px solid #e5e7eb; 
          }
          .support-info { 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
          }
          .qr-placeholder { 
            width: 150px; 
            height: 150px; 
            background: #f3f4f6; 
            border: 2px dashed #d1d5db; 
            border-radius: 10px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 20px auto; 
            color: #9ca3af; 
            font-size: 12px; 
          }
          @media (max-width: 600px) {
            .details-grid { 
              grid-template-columns: 1fr; 
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 تکت شما تایید شد!</h1>
            <div class="ticket-number">
              شماره تکت: ${ticketNumber}
            </div>
          </div>
          
          <div class="content">
            <div class="trip-info">
              <div class="trip-route">${fromTerminal} ← ${toTerminal}</div>
              <div class="trip-name">${tripName}</div>
            </div>

            <div class="payment-status ${isPaid ? 'payment-paid' : 'payment-pending'}">
              ${isPaid ? '✅ پرداخت تکمیل شده' : '⏳ در انتظار پرداخت'}
              ${paymentDeadline && !isPaid ? `<br><small>مهلت پرداخت: ${paymentDeadline}</small>` : ''}
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">مسافر</div>
                <div class="detail-value">${passengerName}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">تاریخ سفر</div>
                <div class="detail-value">${departureDate}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">ساعت حرکت</div>
                <div class="detail-value">${departureTime}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">شماره صندلی</div>
                <div class="detail-value">${seatNumbersText}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">مبلغ کل</div>
                <div class="detail-value">${totalPrice.toLocaleString()} افغانی</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">نوع پرداخت</div>
                <div class="detail-value">${paymentMethodText}</div>
              </div>
            </div>

            ${
              !isPaid
                ? `
            <div class="important-notes">
              <h3>⚠️ نکات مهم برای پرداخت</h3>
              <ul>
                <li>لطفاً تا ${paymentDeadline || 'قبل از سفر'} مبلغ تکت را پرداخت کنید</li>
                <li>در صورت عدم پرداخت به موقع، تکت شما لغو خواهد شد</li>
                <li>برای پرداخت با ما تماس بگیرید: +93 79 900 4567</li>
              </ul>
            </div>
            `
                : ''
            }

            <div class="important-notes">
              <h3>📋 نکات سفر</h3>
              <ul>
                <li>لطفاً 30 دقیقه قبل از حرکت در ترمینال حاضر شوید</li>
                <li>کارت شناسایی معتبر همراه داشته باشید</li>
                <li>این ایمیل را چاپ کنید یا اسکرین‌شات بگیرید</li>
                <li>برای لغو یا تغییر تکت حداقل 2 ساعت قبل از حرکت اقدام کنید</li>
              </ul>
            </div>

            <div class="qr-placeholder">
              کد QR تکت
              <br>
              (در نسخه‌های آینده)
            </div>
          </div>
          
          <div class="footer">
            <strong>با تشکر از انتخاب حصارک پنجشیر</strong>
            <div class="support-info">
              <strong>پشتیبانی 24/7:</strong><br>
              📞 +93 79 900 4567<br>
              📧 hesarak.trans600@gmail.com<br>
              🌐 <a href="https://hesarakbus.com" style="color: #f97316;">hesarakbus.com</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
🚌 تکت شما تایید شد!

شماره تکت: ${ticketNumber}
مسافر: ${passengerName}

جزئیات سفر:
${fromTerminal} ← ${toTerminal}
${tripName}
تاریخ: ${departureDate}
ساعت: ${departureTime}
صندلی: ${seatNumbersText}

مبلغ: ${totalPrice.toLocaleString()} افغانی
نوع پرداخت: ${paymentMethodText}
وضعیت: ${paymentStatus}
${paymentDeadline && !isPaid ? `مهلت پرداخت: ${paymentDeadline}` : ''}

نکات مهم:
- 30 دقیقه قبل از حرکت در ترمینال حاضر شوید
- کارت شناسایی همراه داشته باشید
- برای لغو یا تغییر حداقل 2 ساعت قبل از حرکت اقدام کنید

پشتیبانی: +93 79 900 4567
ایمیل: hesarak.trans600@gmail.com
سایت: hesarakbus.com

با تشکر از انتخاب حصارک پنجشیر
  `

  return { html, text }
}

interface BookingNotificationData {
  ticketNumber: string
  passengerName: string
  passengerPhone: string
  tripName: string
  fromTerminal: string
  toTerminal: string
  departureDate: string
  departureTime: string
  seatNumbers: string[]
  totalPrice: number
  paymentMethod: string
}

export const generateAdminBookingNotification = (data: BookingNotificationData) => {
  const {
    ticketNumber,
    passengerName,
    passengerPhone,
    tripName,
    fromTerminal,
    toTerminal,
    departureDate,
    departureTime,
    seatNumbers,
    totalPrice,
    paymentMethod,
  } = data

  const seatNumbersText = seatNumbers.join(', ')
  const paymentMethodText =
    {
      cash: 'نقدی',
      card: 'کارت',
      bank_transfer: 'حواله بانکی',
      mobile_money: 'پول موبایل',
    }[paymentMethod] || paymentMethod

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رزرو جدید دریافت شد</title>
        <style>
          body { 
            font-family: Tahoma, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4; 
            margin: 0; 
            padding: 20px; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
          }
          .content { 
            padding: 30px 20px; 
          }
          .booking-summary { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px; 
            border-right: 4px solid #3b82f6; 
          }
          .field { 
            margin-bottom: 15px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding-bottom: 10px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          .field:last-child { 
            border-bottom: none; 
            margin-bottom: 0; 
          }
          .label { 
            font-weight: bold; 
            color: #555; 
            min-width: 120px; 
          }
          .value { 
            color: #333; 
            text-align: left; 
            font-weight: 600; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            border-top: 1px solid #eee; 
          }
          .timestamp { 
            font-size: 12px; 
            color: #999; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎟️ رزرو جدید دریافت شد</h1>
          </div>
          <div class="content">
            <div class="booking-summary">
              <div class="field">
                <span class="label">شماره تکت:</span>
                <span class="value">${ticketNumber}</span>
              </div>
              <div class="field">
                <span class="label">مسافر:</span>
                <span class="value">${passengerName}</span>
              </div>
              <div class="field">
                <span class="label">تلفن:</span>
                <span class="value" dir="ltr">${passengerPhone}</span>
              </div>
              <div class="field">
                <span class="label">مسیر:</span>
                <span class="value">${fromTerminal} ← ${toTerminal}</span>
              </div>
              <div class="field">
                <span class="label">سفر:</span>
                <span class="value">${tripName}</span>
              </div>
              <div class="field">
                <span class="label">تاریخ:</span>
                <span class="value">${departureDate}</span>
              </div>
              <div class="field">
                <span class="label">ساعت:</span>
                <span class="value">${departureTime}</span>
              </div>
              <div class="field">
                <span class="label">صندلی:</span>
                <span class="value">${seatNumbersText}</span>
              </div>
              <div class="field">
                <span class="label">مبلغ:</span>
                <span class="value">${totalPrice.toLocaleString()} افغانی</span>
              </div>
              <div class="field">
                <span class="label">نوع پرداخت:</span>
                <span class="value">${paymentMethodText}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <div class="timestamp">
              دریافت شده در: ${new Date().toLocaleString('fa-IR', {
                timeZone: 'Asia/Kabul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div style="margin-top: 10px;">
              <strong>سیستم حصارک پنجشیر</strong><br>
              <a href="https://hesarakbus.com" style="color: #3b82f6;">hesarakbus.com</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
رزرو جدید دریافت شد

شماره تکت: ${ticketNumber}
مسافر: ${passengerName}
تلفن: ${passengerPhone}

جزئیات سفر:
مسیر: ${fromTerminal} ← ${toTerminal}
سفر: ${tripName}
تاریخ: ${departureDate}
ساعت: ${departureTime}
صندلی: ${seatNumbersText}
مبلغ: ${totalPrice.toLocaleString()} افغانی
نوع پرداخت: ${paymentMethodText}

دریافت شده در: ${new Date().toLocaleString('fa-IR', {
    timeZone: 'Asia/Kabul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}

سیستم حصارک پنجشیر
  `

  return { html, text }
}
