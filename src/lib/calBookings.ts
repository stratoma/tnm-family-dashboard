import type { CalendarEvent } from './types';

const calBookingsKey = 'family-dashboard:cal-bookings';

export function readCalBookings(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(calBookingsKey);
    return stored ? (JSON.parse(stored) as CalendarEvent[]) : [];
  } catch {
    return [];
  }
}

export function saveCalBookings(events: CalendarEvent[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(calBookingsKey, JSON.stringify(events));
}
