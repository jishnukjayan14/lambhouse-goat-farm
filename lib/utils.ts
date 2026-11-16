// Utility functions for Lambhouse Goat Farm Management App

/**
 * Calculate age from a birth date string (YYYY-MM-DD)
 */
export function calculateAge(birthDate: string): {
  years: number;
  months: number;
  days: number;
  display: string;
} {
  if (!birthDate) {
    return { years: 0, months: 0, days: 0, display: 'Unknown' };
  }

  const birth = new Date(birthDate);
  const today = new Date();

  if (isNaN(birth.getTime())) {
    return { years: 0, months: 0, days: 0, display: 'Invalid date' };
  }

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  let display = '';
  if (years > 0) {
    display += `${years} yr${years !== 1 ? 's' : ''}`;
    if (months > 0) display += ` ${months} mo`;
  } else if (months > 0) {
    display += `${months} mo`;
    if (days > 0) display += ` ${days} d`;
  } else {
    display += `${days} day${days !== 1 ? 's' : ''}`;
  }

  return { years, months, days, display };
}

/**
 * Format a number as Indian currency (₹1,234.00)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string (YYYY-MM-DD) to DD/MM/YYYY
 */
export function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get month name from 1-based month number
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[(month - 1) % 12] || 'Unknown';
}

/**
 * Get short month name from 1-based month number
 */
export function getShortMonthName(month: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return months[(month - 1) % 12] || '';
}

/**
 * Get number of days in a month
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get accurate YYYY-MM-DD start and end dates for any month
 */
export function getMonthDateRange(month: number, year: number): { startDate: string; endDate: string } {
  const lastDay = new Date(year, month, 0).getDate();
  const m = String(month).padStart(2, '0');
  return {
    startDate: `${year}-${m}-01`,
    endDate: `${year}-${m}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Generate an invoice number
 * e.g. MILK-NOV-2024-001
 */
export function generateInvoiceNumber(
  prefix: string,
  month: number,
  year: number,
  seq: number
): string {
  const monthStr = getMonthName(month).substring(0, 3).toUpperCase();
  const seqStr = String(seq).padStart(3, '0');
  return `${prefix}-${monthStr}-${year}-${seqStr}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Convert glasses to litres display
 */
export function glassesToLitres(glasses: number): string {
  const ml = glasses * 200;
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${ml}ml`;
}

/**
 * Get current month (1-based) and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * Get last N months as array of {month, year} objects (newest first)
 */
export function getLastNMonths(n: number): { month: number; year: number }[] {
  const result = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return result;
}

/**
 * Format a date for display in the invoice (e.g. "01 Nov 2024")
 */
export function formatInvoiceDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = getMonthName(d.getMonth() + 1).substring(0, 3);
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate estimated kidding / delivery date from mating date (150 days gestation)
 */
export function calculateGestationDueDate(matingDateStr: string): string {
  if (!matingDateStr) return '';
  const d = new Date(matingDateStr);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + 150);
  return d.toISOString().split('T')[0];
}

/**
 * Format WhatsApp notification message for goat health / reminder
 */
export function formatWhatsAppReminderMessage(
  title: string,
  goatName: string,
  tagNumber: string | null,
  eventType: string,
  dueDate: string,
  notes?: string | null,
  vetOrIncharge?: string | null
): string {
  const typeIcons: Record<string, string> = {
    vaccination: '💉 Vaccination Alert',
    treatment: '💊 Medication / Treatment',
    deworming: '🪱 Deworming Schedule',
    kidding: '🍼 Expected Delivery / Kidding',
    weaning: '🌾 Kid Weaning',
    weight_check: '⚖️ Weight Check',
    other: '📋 Farm Health Reminder',
  };

  const typeHeader = typeIcons[eventType] || '📋 Care Reminder';
  const tagDisplay = tagNumber ? ` (Tag: ${tagNumber})` : '';

  let msg = `🐐 *THE LAMB HOUSE GOAT FARM*\n`;
  msg += `*${typeHeader.toUpperCase()}*\n\n`;
  msg += `• *Task:* ${title}\n`;
  msg += `• *Goat:* ${goatName}${tagDisplay}\n`;
  msg += `• *Due Date:* ${formatDate(dueDate)}\n`;

  if (notes) {
    msg += `• *Details / Dosage:* ${notes}\n`;
  }
  if (vetOrIncharge) {
    msg += `• *In-charge / Vet:* ${vetOrIncharge}\n`;
  }

  msg += `\n_Please take required action in advance!_\n`;
  msg += `📍 _Mananthavady, Wayanad_`;

  return msg;
}

/**
 * Generate direct WhatsApp URL (to a specific phone or open share chooser)
 */
export function getWhatsAppShareUrl(message: string, phone?: string): string {
  const encoded = encodeURIComponent(message);
  if (phone && phone.trim()) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${fullPhone}?text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

