import { addDays, endOfDay, isAfter, isBefore, startOfDay } from 'date-fns';
import type { CalendarEvent } from './types';

export const weekdays = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function recurringEventLabel(event: CalendarEvent) {
  if (!event.recurrence || event.recurrence.frequency !== 'weekly') {
    return '';
  }

  const labels = weekdays
    .filter((day) => event.recurrence?.days.includes(day.value))
    .map((day) => day.label);
  return labels.length ? `Repeats weekly · ${labels.join(', ')}` : 'Repeats weekly';
}

export function expandCalendarEvents(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date) {
  const firstDay = startOfDay(rangeStart);
  const lastDay = endOfDay(rangeEnd);

  return events.flatMap((event) => {
    if (!event.recurrence || event.recurrence.frequency !== 'weekly' || !event.recurrence.days.length) {
      return [event];
    }

    const originalStart = new Date(event.start);
    const originalEnd = new Date(event.end);
    const firstOccurrenceDay = startOfDay(originalStart);
    const duration = Math.max(0, originalEnd.getTime() - originalStart.getTime());
    const occurrences: CalendarEvent[] = [];

    for (let day = firstDay; !isAfter(day, lastDay); day = addDays(day, 1)) {
      if (isBefore(day, firstOccurrenceDay) || !event.recurrence.days.includes(day.getDay())) {
        continue;
      }

      const occurrenceStart = new Date(day);
      occurrenceStart.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds(), 0);
      const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
      occurrences.push({
        ...event,
        id: `${event.id}:${occurrenceStart.toISOString()}`,
        seriesId: event.id,
        start: toDateTimeValue(occurrenceStart),
        end: toDateTimeValue(occurrenceEnd),
      });
    }

    return occurrences;
  });
}

export function toDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
