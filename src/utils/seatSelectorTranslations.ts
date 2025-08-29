export const getSeatSelectorTranslations = (lang: 'en' | 'fa' = 'en') => {
  return {
    statuses: {
      available: lang === 'fa' ? 'موجود' : 'Available',
      selected: lang === 'fa' ? 'انتخاب شده' : 'Selected',
      booked: lang === 'fa' ? 'بوک شده' : 'Booked',
      unpaid: lang === 'fa' ? 'قید شده' : 'Reserved',
      currentTicket: lang === 'fa' ? 'تکت فعلی' : 'Current Ticket',
    },
    seatTypes: {
      seat: lang === 'fa' ? 'صندلی' : 'Seat',
      driver: lang === 'fa' ? 'راننده' : 'Driver',
      wc: lang === 'fa' ? 'دستشویی' : 'WC',
      door: lang === 'fa' ? 'دروازه' : 'Door',
    },
    messages: {
      selectTripDate:
        lang === 'fa'
          ? 'لطفاً یک سفر و تاریخ سفر را برای مشاهده نقشه صندلی انتخاب کنید.'
          : 'Please select a trip and travel date to view the seat map.',
      loadingSeatMap: lang === 'fa' ? 'در حال بارگذاری نقشه صندلی...' : 'Loading seat map…',
      seatBookedBy: lang === 'fa' ? 'بوک شده برای' : 'booked for',
      seatReservedBy: lang === 'fa' ? 'قید شده برای' : 'reserved for',
      ticket: lang === 'fa' ? 'تکت' : 'Ticket',
      clickToSelect:
        lang === 'fa'
          ? 'برای انتخاب، روی صندلی‌های موجود کلیک کنید.'
          : 'Click on available seats to select them for booking.',
      yourExistingBooking: lang === 'fa' ? 'تکت فعلی شما' : 'Your existing booking',
      bookedBy: lang === 'fa' ? 'بوک شده توسط' : 'Booked by',
      reservedBy: lang === 'fa' ? 'قید شده توسط' : 'Reserved by',
    },
    labels: {
      selectedSeats: lang === 'fa' ? 'صندلی‌های انتخاب شده' : 'Selected Seats',
      clearAll: lang === 'fa' ? 'پاک کردن همه' : 'Clear All',
      totalPrice: lang === 'fa' ? 'قیمت کل' : 'Total Price',
      pricePerSeat: lang === 'fa' ? 'قیمت هر صندلی' : 'Price per seat',
      amenities: lang === 'fa' ? 'امکانات' : 'Amenities',
      active: lang === 'fa' ? 'فعال' : 'Active',
      inactive: lang === 'fa' ? 'غیرفعال' : 'Inactive',
      daily: lang === 'fa' ? 'روزانه' : 'Daily',
      specificDays: lang === 'fa' ? 'روزهای خاص' : 'Specific days',
      removeSeat: lang === 'fa' ? 'حذف صندلی' : 'Remove seat',
      seatStatusLegend: lang === 'fa' ? 'راهنمای وضعیت صندلی' : 'Seat status legend',
    },
    roles: {
      customer: lang === 'fa' ? 'مشتری' : 'customer',
      editor: lang === 'fa' ? 'ویرایشگر' : 'editor',
      agent: lang === 'fa' ? 'نماینده' : 'agent',
      driver: lang === 'fa' ? 'راننده' : 'driver',
      admin: lang === 'fa' ? 'مدیر' : 'admin',
      superadmin: lang === 'fa' ? 'مدیر ارشد' : 'superadmin',
      dev: lang === 'fa' ? 'مدیر وب سایت' : 'dev',
    },
    days: {
      sat: lang === 'fa' ? 'شنبه' : 'Saturday',
      sun: lang === 'fa' ? 'یکشنبه' : 'Sunday',
      mon: lang === 'fa' ? 'دوشنبه' : 'Monday',
      tue: lang === 'fa' ? 'سه‌شنبه' : 'Tuesday',
      wed: lang === 'fa' ? 'چهارشنبه' : 'Wednesday',
      thu: lang === 'fa' ? 'پنج‌شنبه' : 'Thursday',
      fri: lang === 'fa' ? 'جمعه' : 'Friday',
    },
    daysShort: {
      sat: lang === 'fa' ? 'ش' : 'Sat',
      sun: lang === 'fa' ? 'ی' : 'Sun',
      mon: lang === 'fa' ? 'د' : 'Mon',
      tue: lang === 'fa' ? 'س' : 'Tue',
      wed: lang === 'fa' ? 'چ' : 'Wed',
      thu: lang === 'fa' ? 'پ' : 'Thu',
      fri: lang === 'fa' ? 'ج' : 'Fri',
    },
  }
}
