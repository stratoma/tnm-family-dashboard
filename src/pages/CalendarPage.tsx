import { Calendar, Check, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Field, FormActions, SelectInput, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { calendarSeed, familyMembers } from '../lib/sampleData';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { CalendarEvent, CalendarView, FamilyMember } from '../lib/types';
import { friendlyDate, friendlyTime } from '../lib/format';

const views: CalendarView[] = ['Today', 'Week', 'Month'];

export default function CalendarPage() {
  const { items, add, update, remove } = useLocalCollection<CalendarEvent>(calendarSeed, 'calendar_events');
  const { items: members } = useLocalCollection<FamilyMember>(familyMembers, 'family_members');
  const [view, setView] = useState<CalendarView>('Today');
  const [visibleCalendars, setVisibleCalendars] = useState(['Family', 'Kids', 'Health']);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [manualEventOpen, setManualEventOpen] = useState(false);
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);
  const [calError, setCalError] = useState('');
  const [syncingCal, setSyncingCal] = useState(false);
  const [calSyncedAt, setCalSyncedAt] = useState('');
  const events = [...items, ...calEvents].sort((first, second) => new Date(first.start).getTime() - new Date(second.start).getTime());
  const calendars = Array.from(new Set(events.map((event) => event.calendar)));

  async function syncCal() {
    setSyncingCal(true);
    setCalError('');

    try {
      const accessCode = window.sessionStorage.getItem('family-dashboard-access-code') ?? '';
      const response = await fetch('/api/cal/bookings?days=30', {
        headers: accessCode ? { 'x-family-access-code': accessCode } : {},
      });
      const payload = await response.json() as { events?: CalendarEvent[]; syncedAt?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to sync Cal.com bookings.');
      }

      setCalEvents(payload.events ?? []);
      setCalSyncedAt(payload.syncedAt ?? new Date().toISOString());
      setVisibleCalendars((current) => (current.includes('Cal.com') ? current : [...current, 'Cal.com']));
    } catch (error) {
      setCalError(error instanceof Error ? error.message : 'Unable to sync Cal.com bookings.');
    } finally {
      setSyncingCal(false);
    }
  }

  function openAddEvent() {
    setEditingEvent(null);
    setManualEventOpen(true);
  }

  function openEditEvent(event: CalendarEvent) {
    setEditingEvent(event);
    setManualEventOpen(true);
  }

  function closeModal() {
    setManualEventOpen(false);
    setEditingEvent(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const nextEvent = {
      title: String(form.get('title')),
      calendar: String(form.get('calendar')),
      owner: String(form.get('owner')),
      start: String(form.get('start')),
      end: String(form.get('end')),
      location: String(form.get('location')),
      color: String(form.get('color')),
    };

    if (editingEvent) {
      update(editingEvent.id, nextEvent);
    } else {
      add(nextEvent);
      setVisibleCalendars((current) => (current.includes(nextEvent.calendar) ? current : [...current, nextEvent.calendar]));
    }

    closeModal();
  }

  return (
    <>
      <PageHeader
        eyebrow="Family calendar"
        title="One family calendar"
        description="Add family events, connect Google, and sync upcoming Cal.com bookings in one place."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="button-primary" onClick={openAddEvent}>
              <Plus size={18} /> Add event
            </button>
            <a className="button-soft" href="/api/google/oauth/start">
              <Calendar size={18} /> Connect Google
            </a>
            <button className="button-soft" onClick={syncCal} disabled={syncingCal}>
              <RefreshCw size={18} className={syncingCal ? 'animate-spin' : ''} /> {syncingCal ? 'Syncing…' : 'Sync Cal.com'}
            </button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <SectionCard title="Visible calendars" subtitle="Stored per user" icon={<Calendar size={20} />}>
          <div className="grid gap-3">
            {calendars.map((calendar) => {
              const active = visibleCalendars.includes(calendar);
              return (
                <button
                  key={calendar}
                  className="flex items-center justify-between rounded-2xl bg-linen/70 p-4 text-left"
                  onClick={() =>
                    setVisibleCalendars((current) =>
                      active ? current.filter((item) => item !== calendar) : [...current, calendar],
                    )
                  }
                >
                  <span className="font-semibold">{calendar}</span>
                  {active ? <Check size={18} className="text-sage" /> : <span className="text-sm text-stone-400">Hidden</span>}
                </button>
              );
            })}
          </div>
        </SectionCard>
        <SectionCard
          title={`${view} view`}
          subtitle="Combined family schedule"
          action={
            <div className="flex flex-wrap gap-2">
              <button className="button-primary min-h-10 px-3 py-2 text-sm" onClick={openAddEvent}>
                <Plus size={16} /> Add event
              </button>
              <div className="flex rounded-full bg-linen p-1">
                {views.map((item) => (
                  <button
                    key={item}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${view === item ? 'bg-white shadow-soft' : 'text-stone-500'}`}
                    onClick={() => setView(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky/10 p-3 text-sm text-stone-600">
            <span>{calSyncedAt ? `Cal.com updated ${friendlyTime(calSyncedAt)}.` : 'Cal.com bookings are read-only in this dashboard.'}</span>
            <button className="font-semibold text-ink underline underline-offset-4" onClick={syncCal} disabled={syncingCal}>
              {syncingCal ? 'Syncing…' : 'Refresh'}
            </button>
          </div>
          {calError ? (
            <div className="mb-4 rounded-2xl border border-clay/30 bg-clay/10 p-3 text-sm text-clay">
              {calError} <a className="font-semibold underline underline-offset-4" href="/settings">Set up Cal.com</a>
            </div>
          ) : null}
          <div className="grid gap-3">
            {events
              .filter((event) => visibleCalendars.includes(event.calendar))
              .map((event) => (
                <div key={event.id} className="grid gap-3 rounded-3xl bg-linen/60 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <div className="text-sm font-bold text-stone-500">{friendlyDate(event.start)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: event.color }} />
                      <p className="text-lg font-semibold">{event.title}</p>
                    </div>
                    <p className="mt-1 text-stone-500">
                      {friendlyTime(event.start)} - {friendlyTime(event.end)}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <StatusPill label={event.calendar} tone="blue" />
                    {event.source === 'cal.com' ? <span className="text-xs font-semibold text-stone-400">Read-only</span> : <>
                      <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => openEditEvent(event)} aria-label="Edit calendar invite">
                        <Pencil size={17} />
                      </button>
                      <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => remove(event.id)} aria-label="Delete calendar invite">
                        <Trash2 size={17} />
                      </button>
                    </>}
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      </div>
      <Modal open={manualEventOpen} title={editingEvent ? 'Edit calendar event' : 'Add calendar event'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Event title"><TextInput name="title" required defaultValue={editingEvent?.title} /></Field>
          <Field label="Calendar"><TextInput name="calendar" required placeholder="Family, Kids, Health" defaultValue={editingEvent?.calendar ?? 'Family'} /></Field>
          <Field label="Person">
            <SelectInput name="owner" defaultValue={editingEvent?.owner ?? members[0]?.name ?? 'Everyone'}>
              <option>Everyone</option>
              {members.map((member) => <option key={member.id}>{member.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Start"><TextInput name="start" type="datetime-local" required defaultValue={editingEvent?.start} /></Field>
          <Field label="End"><TextInput name="end" type="datetime-local" required defaultValue={editingEvent?.end} /></Field>
          <Field label="Location"><TextInput name="location" defaultValue={editingEvent?.location} /></Field>
          <Field label="Color"><TextInput name="color" type="color" defaultValue={editingEvent?.color ?? '#8da089'} /></Field>
          <FormActions onCancel={closeModal} submitLabel={editingEvent ? 'Save changes' : 'Add event'} />
        </form>
      </Modal>
    </>
  );
}
