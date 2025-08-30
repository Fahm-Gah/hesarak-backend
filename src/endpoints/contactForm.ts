import type { Endpoint } from 'payload'
import { getLocaleFromRequest, createErrorResponse, createSuccessResponse } from '../utils/i18n'

// Simple validation function for contact form
const validateContactForm = (data: any) => {
  const errors: Array<{ field: string; message: string }> = []

  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: 'First name is required' })
  } else if (data.firstName.length > 50) {
    errors.push({ field: 'firstName', message: 'First name too long' })
  }

  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
    errors.push({ field: 'lastName', message: 'Last name is required' })
  } else if (data.lastName.length > 50) {
    errors.push({ field: 'lastName', message: 'Last name too long' })
  }

  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' })
    } else if (data.email.length > 100) {
      errors.push({ field: 'email', message: 'Email too long' })
    }
  }

  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    errors.push({ field: 'phone', message: 'Phone number is required' })
  } else if (data.phone.length < 10) {
    errors.push({ field: 'phone', message: 'Phone number too short' })
  } else if (data.phone.length > 20) {
    errors.push({ field: 'phone', message: 'Phone number too long' })
  }

  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length === 0) {
    errors.push({ field: 'subject', message: 'Subject is required' })
  } else if (data.subject.length > 100) {
    errors.push({ field: 'subject', message: 'Subject too long' })
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required' })
  } else if (data.message.trim().length < 3) {
    errors.push({ field: 'message', message: 'Message too short' })
  } else if (data.message.length > 1000) {
    errors.push({ field: 'message', message: 'Message too long' })
  }

  return {
    isValid: errors.length === 0,
    errors,
    data:
      errors.length === 0
        ? {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            subject: data.subject.trim(),
            message: data.message.trim(),
          }
        : null,
  }
}

export const contactForm: Endpoint = {
  path: '/contact-form',
  method: 'post',
  handler: async (req) => {
    const { payload } = req
    const locale = getLocaleFromRequest(req)

    let requestBody: unknown
    try {
      requestBody = (await req.json?.()) || req.body
    } catch (e) {
      return createErrorResponse('INVALID_JSON', 400, locale)
    }

    // Validate request
    const validation = validateContactForm(requestBody)
    if (!validation.isValid) {
      console.error('Contact form validation failed:', validation.errors)
      console.error('Request body received:', requestBody)
      return createErrorResponse('VALIDATION_FAILED', 400, locale, undefined, validation.errors)
    }

    const { firstName, lastName, email, phone, subject, message } = validation.data!

    // Send email notification to admin
    try {
      const emailHtml = `
          <!DOCTYPE html>
          <html dir="rtl" lang="fa">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>پیام جدید از فرم تماس</title>
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
                  background: linear-gradient(135deg, #f97316, #dc2626); 
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
                .field { 
                  margin-bottom: 20px; 
                  border-bottom: 1px solid #eee; 
                  padding-bottom: 15px; 
                }
                .field:last-child { 
                  border-bottom: none; 
                }
                .label { 
                  font-weight: bold; 
                  color: #555; 
                  display: block; 
                  margin-bottom: 5px; 
                }
                .value { 
                  background-color: #f8f9fa; 
                  padding: 10px; 
                  border-radius: 5px; 
                  border-right: 4px solid #f97316; 
                }
                .message-field .value { 
                  white-space: pre-wrap; 
                  min-height: 60px; 
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
                  <h1>🚌 پیام جدید از سایت حصارک پنجشیر</h1>
                </div>
                <div class="content">
                  <div class="field">
                    <span class="label">نام و تخلص:</span>
                    <div class="value">${firstName} ${lastName}</div>
                  </div>
                  <div class="field">
                    <span class="label">ایمیل:</span>
                    <div class="value" dir="ltr">${email}</div>
                  </div>
                  <div class="field">
                    <span class="label">شماره تلفن:</span>
                    <div class="value" dir="ltr">${phone}</div>
                  </div>
                  <div class="field">
                    <span class="label">موضوع:</span>
                    <div class="value">${subject}</div>
                  </div>
                  <div class="field message-field">
                    <span class="label">پیام:</span>
                    <div class="value">${message}</div>
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
                    <a href="https://hesarakbus.com" style="color: #f97316;">hesarakbus.com</a>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `

      const emailText = `
پیام جدید از فرم تماس سایت حصارک پنجشیر

نام و تخلص: ${firstName} ${lastName}
ایمیل: ${email}
تلفن: ${phone}
موضوع: ${subject}

پیام:
${message}

دریافت شده در: ${new Date().toLocaleString('fa-IR', {
        timeZone: 'Asia/Kabul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}
        `

      await payload.sendEmail({
        to: 'hesarak.trans600@gmail.com',
        subject: `پیام جدید از فرم تماس: ${subject}`,
        html: emailHtml,
        text: emailText,
      })

      // Send confirmation email to user
      const confirmationHtml = `
          <!DOCTYPE html>
          <html dir="rtl" lang="fa">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>تایید دریافت پیام شما</title>
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
                  background: linear-gradient(135deg, #10b981, #059669); 
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
                  text-align: center; 
                }
                .success-icon { 
                  font-size: 48px; 
                  margin-bottom: 20px; 
                }
                .message { 
                  font-size: 16px; 
                  margin-bottom: 25px; 
                  line-height: 1.8; 
                }
                .contact-info { 
                  background-color: #f8f9fa; 
                  padding: 20px; 
                  border-radius: 8px; 
                  margin: 20px 0; 
                }
                .footer { 
                  background-color: #f8f9fa; 
                  padding: 20px; 
                  text-align: center; 
                  font-size: 14px; 
                  color: #666; 
                  border-top: 1px solid #eee; 
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚌 تشکر از تماس شما</h1>
                </div>
                <div class="content">
                  <div class="success-icon">✅</div>
                  <div class="message">
                    <strong>سلام ${firstName} عزیز!</strong><br><br>
                    پیام شما با موضوع "<strong>${subject}</strong>" با موفقیت دریافت شد.<br>
                    تیم پشتیبانی حصارک پنجشیر در اسرع وقت با شما تماس خواهد گرفت.
                  </div>
                  <div class="contact-info">
                    <strong>راه‌های تماس با ما:</strong><br>
                    📞 تلفن: +93 79 900 4567<br>
                    📧 ایمیل: hesarak.trans600@gmail.com<br>
                    🕒 پشتیبانی 24/7 در دسترس است
                  </div>
                </div>
                <div class="footer">
                  <strong>با تشکر از اعتماد شما</strong><br>
                  <strong>تیم حصارک پنجشیر</strong><br>
                  <a href="https://hesarakbus.com" style="color: #10b981;">hesarakbus.com</a>
                </div>
              </div>
            </body>
          </html>
        `

      const confirmationText = `
سلام ${firstName} عزیز!

پیام شما با موضوع "${subject}" با موفقیت دریافت شد.
تیم پشتیبانی حصارک پنجشیر در اسرع وقت با شما تماس خواهد گرفت.

راه‌های تماس با ما:
تلفن: +93 79 900 4567
ایمیل: hesarak.trans600@gmail.com
پشتیبانی 24/7 در دسترس است

با تشکر از اعتماد شما
تیم حصارک پنجشیر
hesarakbus.com
        `

      // In testing mode, Resend only allows sending to your verified email
      // So we'll skip sending confirmation to user during development
      if (process.env.NODE_ENV === 'production') {
        await payload.sendEmail({
          to: email,
          subject: 'تایید دریافت پیام شما - حصارک پنجشیر',
          html: confirmationHtml,
          text: confirmationText,
        })
      } else {
        console.log('Skipping user confirmation email in development mode')
        console.log('Would have sent to:', email)
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't return error to user, just log it
    }

    return createSuccessResponse(
      'CONTACT_FORM_SUBMITTED',
      {
        message: 'پیام شما با موفقیت ارسال شد. ما به زودی با شما تماس خواهیم گرفت.',
      },
      locale,
    )
  },
}
