/**
 * Utility functions for converting numbers to Persian/Farsi digits
 * Persian digits: ۰۱۲۳۴۵۶۷۸۹
 */

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

/**
 * Converts any number or string containing digits to Persian digits
 * @param value - The number or string to convert
 * @returns String with Persian digits
 * 
 * @example
 * convertToPersianDigits(123) // "۱۲۳"
 * convertToPersianDigits("12:34") // "۱۲:۳۴"
 * convertToPersianDigits("1,234") // "۱,۲۳۴"
 */
export const convertToPersianDigits = (value: number | string): string => {
  return value.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

/**
 * Formats a number with Persian digits and proper comma separation
 * @param num - The number to format
 * @returns Formatted string with Persian digits and commas
 * 
 * @example
 * formatPersianNumber(1234) // "۱,۲۳۴"
 * formatPersianNumber(1234567) // "۱,۲۳۴,۵۶۷"
 */
export const formatPersianNumber = (num: number): string => {
  const formatted = num.toLocaleString()
  return convertToPersianDigits(formatted)
}

/**
 * Converts Persian digits back to English digits
 * @param value - String containing Persian digits
 * @returns String with English digits
 * 
 * @example
 * convertToEnglishDigits("۱۲۳") // "123"
 * convertToEnglishDigits("۱۲:۳۴") // "12:34"
 */
export const convertToEnglishDigits = (value: string): string => {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  return value.replace(/[۰-۹]/g, (digit) => {
    const index = persianDigits.indexOf(digit)
    return index !== -1 ? englishDigits[index] : digit
  })
}