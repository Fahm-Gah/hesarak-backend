export const getSeatLayoutDesignerTranslations = (lang: 'en' | 'fa' = 'en') => {
  return {
    header: {
      title: lang === 'fa' ? 'طراح چیدمان صندلی' : 'Seat Layout Designer',
      seats: lang === 'fa' ? 'صندلی‌ها' : 'Seats',
      available: lang === 'fa' ? 'موجود' : 'Available',
      disabled: lang === 'fa' ? 'غیرفعال' : 'Disabled',
    },
    toolbar: {
      all: lang === 'fa' ? 'همه' : 'All',
      disable: lang === 'fa' ? 'غیرفعال' : 'Disable',
      delete: lang === 'fa' ? 'حذف' : 'Delete',
      clear: lang === 'fa' ? 'پاک کردن' : 'Clear',
      undo: lang === 'fa' ? 'برگشت' : 'Undo',
      redo: lang === 'fa' ? 'تکرار' : 'Redo',
    },
    sidebar: {
      addElement: lang === 'fa' ? 'افزودن عنصر' : 'Add Element',
      elementSize: lang === 'fa' ? 'اندازه عنصر' : 'Element Size',
      gridSize: lang === 'fa' ? 'اندازه شبکه' : 'Grid Size',
      rows: lang === 'fa' ? 'ردیف‌ها' : 'Rows',
      cols: lang === 'fa' ? 'ستون‌ها' : 'Cols',
      tips: lang === 'fa' ? 'راهنما' : 'Tips',
      tipsList:
        lang === 'fa'
          ? [
              'برای افزودن روی خانه خالی کلیک کنید',
              'عناصر را بکشید تا جابجا شوند',
              'Shift+کلیک برای انتخاب محدوده',
              'Ctrl+کلیک برای افزودن به انتخاب',
              'دابل کلیک روی صندلی برای ویرایش',
              'کلیدهای جهت برای حرکت',
              'کلید Delete برای حذف',
            ]
          : [
              'Click empty cells to add',
              'Drag elements to move',
              'Shift+click for range select',
              'Ctrl+click to add to selection',
              'Double-click seats to edit',
              'Arrow keys move selected',
              'Delete key removes selected',
            ],
    },
    modal: {
      clearLayout: lang === 'fa' ? 'پاک کردن چیدمان' : 'Clear Layout',
      confirmClear:
        lang === 'fa'
          ? 'آیا مطمئن هستید که می‌خواهید کل چیدمان را پاک کنید؟.'
          : 'Are you sure you want to clear the entire layout?',
    },
    element: {
      seatPlaceholder: lang === 'fa' ? 'شماره صندلی' : 'Seat #',
    },
  }
}
