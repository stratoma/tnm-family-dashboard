import { format, isToday, parseISO } from 'date-fns';

export function friendlyTime(value: string) {
  return format(parseISO(value), 'h:mm a');
}

export function friendlyDate(value: string) {
  const date = parseISO(value);
  return isToday(date) ? 'Today' : format(date, 'MMM d');
}

export function fullDate(value: string) {
  return format(parseISO(value), 'EEEE, MMM d');
}

export function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function daysUntil(dateValue: string) {
  const today = new Date();
  const target = parseISO(dateValue);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.ceil((targetStart - todayStart) / 86_400_000);
}
