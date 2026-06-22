import { Calendar, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Field, FormActions, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { calendarSeed } from '../lib/sampleData';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { CalendarEvent, CalendarView } from '../lib/types';
import { friendlyDate, friendlyTime } from '../lib/format';

const views: CalendarView[] = ['Today', 'Week', 'Month'];

export default function CalendarPage() {
  const { items, update, remove } = useLocalCollection<CalendarEvent>(calendarSeed);
  const [view, setView] = useState<CalendarView>('Today');
  const [visibleCalendars, setVisibleCalendars] = useState(['Family', 'Kids', 'Health']);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const calendars = Array.from(new Set(items.map((event) => event.calendar)));

  function closeModal() {
    setEditingEvent(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEvent) {
      return;
    }

    const form = new FormData(event.currentTarget);
    update(editingEvent.id, {
      title: String(form.get('title')),
      calendar: String(form.get('calendar')),
      owner: String(form.get('owner')),
      start: String(form.get('start')),
      end: String(form.get('end')),
      location: String(form.get('location')),
      color: String(form.get('color')),
    });
    closeModal();
  }

  return (
    <>
      <PageHeader
        eyebrow="Google Calendar sync"
        title="One family calendar"
        description="Connect multiple Google Calendars, choose which ones to show, and manage local family invites."
        action={
          <a className="button-primary" href="/api/google/oauth/start">
            <Plus size={18} /> Connect calendar
          </a>
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
          }
        >
          <div className="grid gap-3">
            {items
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
                    <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => setEditingEvent(event)} aria-label="Edit calendar invite">
                      <Pencil size={17} />
                    </button>
                    <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => remove(event.id)} aria-label="Delete calendar invite">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      </div>
      <Modal open={Boolean(editingEvent)} title="Edit calendar invite" onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Event title"><TextInput name="title" required defaultValue={editingEvent?.title} /></Field>
          <Field label="Calendar"><TextInput name="calendar" required defaultValue={editingEvent?.calendar} /></Field>
          <Field label="Person"><TextInput name="owner" required defaultValue={editingEvent?.owner} /></Field>
          <Field label="Start"><TextInput name="start" type="datetime-local" required defaultValue={editingEvent?.start} /></Field>
          <Field label="End"><TextInput name="end" type="datetime-local" required defaultValue={editingEvent?.end} /></Field>
          <Field label="Location"><TextInput name="location" defaultValue={editingEvent?.location} /></Field>
          <Field label="Color"><TextInput name="color" type="color" defaultValue={editingEvent?.color ?? '#8da089'} /></Field>
          <FormActions onCancel={closeModal} submitLabel="Save changes" />
        </form>
      </Modal>
    </>
  );
}
