import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { convertGregorianToPersianDisplay } from '@/utils/dateUtils'
import { convertToPersianDigits } from '@/utils/persianDigits'
import { getServerSideURL } from '@/utils/getURL'
import type { UserTicket } from '@/app/(frontend)/(main)/my-tickets/types'

const formatTo12Hour = (time24: string): string => {
  if (!time24) return 'نامشخص'
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const period = hour >= 12 ? 'بعدازظهر' : 'قبل‌ازظهر'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${convertToPersianDigits(hour12)}:${convertToPersianDigits(minutes)} ${period}`
}

const formatDurationToPersian = (duration: string): string => {
  if (!duration || duration === 'Unknown' || duration === 'نامشخص') {
    return 'نامشخص'
  }

  const hourMatch = duration.match(/(\d+)h/)
  const minuteMatch = duration.match(/(\d+)m/)

  const hours = hourMatch ? parseInt(hourMatch[1]) : 0
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0

  let result = ''

  if (hours > 0) {
    result += `${convertToPersianDigits(hours)} ساعت`
  }

  if (minutes > 0) {
    if (result) result += ' و '
    result += `${convertToPersianDigits(minutes)} دقیقه`
  }

  return result || 'نامشخص'
}

export const generateTicketPDF = async (
  ticket: UserTicket,
  passengerName?: string,
  passenger?: {
    fullName?: string
    fatherName?: string
    phoneNumber?: string
  },
) => {
  // Generate QR Code
  const qrCodeUrl = `${getServerSideURL()}/admin/collections/tickets?search=${ticket.ticketNumber}`
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1E293B',
      light: '#FFFFFF',
    },
  })

  // Determine status
  let statusColor = '#22C55E' // Green
  let statusBgColor = '#DCFCE7'
  let statusText = 'پرداخت شده'

  if (ticket.status.isCancelled) {
    statusColor = '#EF4444' // Red
    statusBgColor = '#FEE2E2'
    statusText = 'لغو شده'
  } else if (ticket.status.isExpired) {
    statusColor = '#FB923C' // Orange
    statusBgColor = '#FED7AA'
    statusText = 'منقضی شده'
  } else if (!ticket.status.isPaid) {
    statusColor = '#FACC15' // Yellow
    statusBgColor = '#FEF3C7'
    statusText = 'در انتظار پرداخت'
  }

  const jalaaliDate = convertGregorianToPersianDisplay(ticket.booking.date)
  const persianDate = convertToPersianDigits(jalaaliDate)

  // Determine passenger name to display
  const displayName = passengerName || passenger?.fullName || 'مسافر'

  // Pre-calculate duration for the template
  const durationText = formatDurationToPersian(ticket.trip.duration || '')

  // Create HTML content for the ticket
  const ticketHTML = `
    <div id="ticket-content" style="
      width: 800px; 
      background: white; 
      font-family: Arial, 'Vazirmatn', 'Vazir', 'Tahoma', sans-serif; 
      direction: rtl; 
      padding: 0; 
      margin: 0;
      line-height: 1;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #EA580C 0%, #DC2626 100%); 
        padding: 25px 35px; 
        text-align: center; 
        position: relative; 
        overflow: hidden;
        line-height: 1;
      ">
        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
        <h1 style="
          color: white; 
          margin: 0; 
          padding: 0;
          font-size: 36px; 
          font-weight: bold; 
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
          line-height: 1;
        ">حصارک پنجشیر</h1>
      </div>

      <!-- Ticket Number and QR Code -->
      <div style="
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 18px 35px; 
        background: #F8FAFC; 
        border-bottom: 2px dashed #E2E8F0;
      ">
        <div style="flex: 1;">
          <p style="margin: 0; padding: 0; color: #64748B; font-size: 14px; line-height: 1; margin-bottom: 6px;">شماره تکت</p>
          <p style="margin: 0; padding: 0; font-size: 24px; font-weight: bold; color: #1E293B; font-family: monospace; letter-spacing: 2px; line-height: 1;">${ticket.ticketNumber}</p>
        </div>
        <div style="
          width: 150px; 
          height: 150px; 
          padding: 8px; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="${qrCodeDataUrl}" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      </div>

      <!-- Main Content Area -->
      <div style="padding: 25px 35px;">
        
        <!-- Passenger Information -->
        <div style="margin-bottom: 20px;">
          <div style="border-right: 4px solid #EA580C; padding-right: 15px;">
            <h2 style="margin: 0; padding: 0; margin-bottom: 10px; color: #1E293B; font-size: 18px; font-weight: bold; line-height: 1;">اطلاعات مسافر</h2>
            <div style="background: #F8FAFC; padding: 12px; border-radius: 8px;">
              <p style="margin: 0; padding: 0; color: #475569; font-size: 15px; line-height: 1.3;">
                <strong>نام:</strong> ${displayName}
              </p>
              ${
                passenger?.fatherName
                  ? `
                <p style="margin: 0; padding: 0; margin-top: 6px; color: #475569; font-size: 14px; line-height: 1.3;">
                  <strong>نام پدر:</strong> ${passenger.fatherName}
                </p>`
                  : ''
              }
              ${
                passenger?.phoneNumber
                  ? `
                <p style="margin: 0; padding: 0; margin-top: 6px; color: #475569; font-size: 14px; line-height: 1.3;">
                  <strong>تلفن:</strong> ${passenger.phoneNumber}
                </p>`
                  : ''
              }
            </div>
          </div>
        </div>

        <!-- Route Information -->
        <div style="margin-bottom: 20px;">
          <div style="border-right: 4px solid #3B82F6; padding-right: 15px;">
            <h2 style="margin: 0; padding: 0; margin-bottom: 10px; color: #1E293B; font-size: 18px; font-weight: bold; line-height: 1;">مسیر سفر</h2>
            <div style="display: flex; align-items: stretch; justify-content: space-between; background: #F8FAFC; padding: 15px; border-radius: 8px; min-height: 90px;">
              <!-- From -->
              <div style="text-align: center; flex: 0 0 30%; display: flex; flex-direction: column; justify-content: center;">
                <div style="
                  width: 10px; 
                  height: 10px; 
                  background: #22C55E; 
                  border-radius: 50%; 
                  margin: 0 auto; 
                  margin-bottom: 6px;
                  box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
                "></div>
                <p style="margin: 0; padding: 0; color: #1E293B; font-size: 17px; font-weight: bold; line-height: 1.2; margin-bottom: 3px;">${ticket.trip.from.province}</p>
                <p style="margin: 0; padding: 0; color: #64748B; font-size: 12px; line-height: 1.2; margin-bottom: 3px;">${ticket.trip.from.address}</p>
                <p style="margin: 0; padding: 0; color: #EA580C; font-size: 14px; font-weight: bold; line-height: 1.2;">${formatTo12Hour(ticket.trip.departureTime)}</p>
              </div>
              
              <!-- Duration -->
              <div style="flex: 0 0 30%; display: flex; align-items: center; justify-content: center; position: relative;">
                <div style="
                  height: 2px; 
                  background: linear-gradient(to left, #EF4444, #3B82F6, #22C55E); 
                  position: absolute; 
                  left: 10px; 
                  right: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                "></div>
                <div style="
                  background: white; 
                  padding: 5px 10px; 
                  border-radius: 12px; 
                  border: 2px solid #E2E8F0; 
                  position: relative;
                  z-index: 1;
                ">
                  <p style="margin: 0; padding: 0; color: #64748B; font-size: 12px; font-weight: bold; line-height: 1.5;">${durationText}</p>
                </div>
              </div>
              
              <!-- To -->
              <div style="text-align: center; flex: 0 0 30%; display: flex; flex-direction: column; justify-content: center;">
                <div style="
                  width: 10px; 
                  height: 10px; 
                  background: #EF4444; 
                  border-radius: 50%; 
                  margin: 0 auto;
                  margin-bottom: 6px; 
                  box-shadow: 0 0 0 3px rgba(239,68,68,0.2);
                "></div>
                <p style="margin: 0; padding: 0; color: #1E293B; font-size: 17px; font-weight: bold; line-height: 1.2; margin-bottom: 3px;">${ticket.trip.to?.province || 'مقصد'}</p>
                <p style="margin: 0; padding: 0; color: #64748B; font-size: 12px; line-height: 1.2; margin-bottom: 3px;">${ticket.trip.to?.address || ''}</p>
                <p style="margin: 0; padding: 0; color: #EA580C; font-size: 14px; font-weight: bold; line-height: 1.2;">${ticket.trip.arrivalTime ? formatTo12Hour(ticket.trip.arrivalTime) : 'نامشخص'}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Trip Details -->
        <div style="margin-bottom: 20px;">
          <div style="border-right: 4px solid #8B5CF6; padding-right: 15px;">
            <h2 style="margin: 0; padding: 0; margin-bottom: 10px; color: #1E293B; font-size: 18px; font-weight: bold; line-height: 1;">جزئیات سفر</h2>
            <div style="display: flex; gap: 12px;">
              <div style="flex: 1; background: #F8FAFC; padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; padding: 0; color: #64748B; font-size: 12px; line-height: 1; margin-bottom: 4px;">تاریخ سفر</p>
                <p style="margin: 0; padding: 0; color: #1E293B; font-size: 16px; font-weight: bold; line-height: 1;">${persianDate}</p>
              </div>
              <div style="flex: 1; background: #F8FAFC; padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; padding: 0; color: #64748B; font-size: 12px; line-height: 1; margin-bottom: 4px;">شماره اتوبوس</p>
                <p style="margin: 0; padding: 0; color: #1E293B; font-size: 16px; font-weight: bold; line-height: 1;">${ticket.trip.bus.number}</p>
              </div>
              <div style="flex: 1; background: #F8FAFC; padding: 12px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; padding: 0; color: #64748B; font-size: 12px; line-height: 1; margin-bottom: 4px;">نوع اتوبوس</p>
                <p style="margin: 0; padding: 0; color: #1E293B; font-size: 16px; font-weight: bold; line-height: 1;">${ticket.trip.bus.type.name}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Seat Information -->
        <div style="margin-bottom: 20px;">
          <div style="border-right: 4px solid #F59E0B; padding-right: 15px;">
            <h2 style="margin: 0; padding: 0; margin-bottom: 10px; color: #1E293B; font-size: 18px; font-weight: bold; line-height: 1;">چوکی‌ها</h2>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${ticket.booking.seats
                .map(
                  (seat) => `
                <div style="
                  background: linear-gradient(135deg, #3B82F6, #6366F1); 
                  color: white; 
                  padding: 8px 16px; 
                  border-radius: 20px; 
                  font-weight: bold; 
                  font-size: 15px; 
                  box-shadow: 0 2px 8px rgba(59,130,246,0.3);
                  display: inline-block;
                  line-height: 1;
                ">
                  ${seat.seatNumber}
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Price Information -->
        <div style="margin-bottom: 20px;">
          <div style="border-right: 4px solid #10B981; padding-right: 15px;">
            <h2 style="margin: 0; padding: 0; margin-bottom: 10px; color: #1E293B; font-size: 18px; font-weight: bold; line-height: 1;">اطلاعات قیمت</h2>
            <div style="
              background: linear-gradient(135deg, #F0FDF4, #DCFCE7); 
              padding: 15px; 
              border-radius: 8px; 
              border: 1px solid #BBF7D0;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="margin: 0; padding: 0; color: #64748B; font-size: 14px; line-height: 1.4;">
                    قیمت هر چوکی: ${convertToPersianDigits(ticket.booking.pricePerSeat.toLocaleString())} افغانی
                  </p>
                  <p style="margin: 0; padding: 0; margin-top: 4px; color: #64748B; font-size: 14px; line-height: 1.4;">
                    تعداد چوکی: ${convertToPersianDigits(ticket.booking.seats.length.toString())}
                  </p>
                </div>
                <div style="text-align: left;">
                  <p style="margin: 0; padding: 0; color: #059669; font-size: 14px; line-height: 1; margin-bottom: 4px;">مجموع:</p>
                  <p style="margin: 0; padding: 0; color: #059669; font-size: 26px; font-weight: bold; line-height: 1;">
                    ${convertToPersianDigits(ticket.booking.totalPrice.toLocaleString())} افغانی
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div style="
          background: ${statusBgColor}; 
          border: 2px solid ${statusColor}; 
          border-radius: 8px; 
          padding: 12px; 
          text-align: center;
          margin-bottom: 20px;
        ">
          <p style="margin: 0; padding: 0; color: ${statusColor}; font-size: 20px; font-weight: bold; line-height: 1;">${statusText}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        background: #F8FAFC; 
        padding: 15px 35px; 
        border-top: 2px solid #E2E8F0; 
        text-align: center;
        margin-top: 20px;
      ">
        <p style="margin: 0; padding: 0; color: #64748B; font-size: 13px; line-height: 1; margin-bottom: 5px;">
          این تکت فقط برای تاریخ و سفر مشخص شده معتبر است
        </p>
        <p style="margin: 0; padding: 0; color: #94A3B8; font-size: 12px; line-height: 1;">${getServerSideURL().replace('https://', 'www.').replace('http://', 'www.')}</p>
      </div>
    </div>
  `

  // Create a temporary container
  const container = document.createElement('div')
  container.innerHTML = ticketHTML
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  try {
    // Small delay to ensure DOM is ready
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Wait for images (QR code) to load
    const images = container.getElementsByTagName('img')
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    })
    await Promise.all(imagePromises)

    // Convert HTML to canvas with optimized settings
    const canvas = await html2canvas(container.querySelector('#ticket-content') as HTMLElement, {
      scale: 1.2, // Much lower scale for smaller file size
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      foreignObjectRendering: false,
      width: 800,
      height: container.querySelector('#ticket-content')!.scrollHeight,
    })

    // Convert canvas to PDF with JPEG compression
    const imgData = canvas.toDataURL('image/jpeg', 0.85) // JPEG with 85% quality
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // A4 dimensions in mm
    const pdfWidth = 210
    const pdfHeight = 297

    // Calculate the aspect ratio
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Scale to full width of PDF
    let imgWidth = pdfWidth
    let imgHeight = (canvasHeight * pdfWidth) / canvasWidth

    // Check if height fits, if not scale to fit height
    if (imgHeight > pdfHeight) {
      const scaleFactor = pdfHeight / imgHeight
      imgHeight = pdfHeight
      imgWidth = imgWidth * scaleFactor
      // Center horizontally if scaled down
      const xOffset = (pdfWidth - imgWidth) / 2
      pdf.addImage(imgData, 'JPEG', xOffset, 0, imgWidth, imgHeight)
    } else {
      // Use full width
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
    }

    // Save the PDF
    pdf.save(`ticket-${ticket.ticketNumber}.pdf`)
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}
