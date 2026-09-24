import { CalendarDays, CloudSun, Database, KeyRound, Pencil, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Field, FormActions, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { calendarSeed, appointmentsSeed, activitiesSeed, familyMembers } from '../lib/sampleData';
import { readStoredCollection, useLocalCollection, writeStoredCollection } from '../lib/useLocalCollection';
import type { CalendarEvent, DoctorAppointment, FamilyMember, KidsActivity } from '../lib/types';

export default function SettingsPage() {
  const { items: members, add, update, remove } = useLocalCollection<FamilyMember>(familyMembers, 'family_members');
  const children = members.filter((member) => member.role === 'Child');
  const [open, setOpen] = useState(false);
  const [calSetupOpen, setCalSetupOpen] = useState(false);
  const [calApiKey, setCalApiKey] = useState('');
  const [calConnection, setCalConnection] = useState<{ key_hint: string; updated_at: string } | null>(null);
  const [calSetupError, setCalSetupError] = useState('');
  const [savingCalConnection, setSavingCalConnection] = useState(false);
  const [editingChild, setEditingChild] = useState<FamilyMember | null>(null);

  useEffect(() => {
    void loadCalConnection();
  }, []);

  function openAddChild() {
    setEditingChild(null);
    setOpen(true);
  }

  function openEditChild(child: FamilyMember) {
    setEditingChild(child);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingChild(null);
  }

  function submitChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    const color = String(form.get('color') || '#7c9db0');

    if (!name) {
      return;
    }

    if (editingChild) {
      if (editingChild.name !== name) {
        syncFamilyMemberName(editingChild.name, name);
      }

      update(editingChild.id, { name, color, role: 'Child' });
    } else {
      add({ name, color, role: 'Child' });
    }

    closeModal();
  }

  function removeChild(child: FamilyMember) {
    remove(child.id);
  }

  async function loadCalConnection() {
    try {
      const response = await fetch('/api/cal/connection', { headers: familyAccessHeader() });
      if (!response.ok) return;
      const data = await response.json() as { connection?: { key_hint: string; updated_at: string } | null };
      setCalConnection(data.connection ?? null);
    } catch {
      // Connection status is optional until the server-side services are configured.
    }
  }

  async function saveCalConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCalSetupError('');
    setSavingCalConnection(true);

    try {
      const response = await fetch('/api/cal/connection', {
        method: 'POST',
        headers: { ...familyAccessHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: calApiKey }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Unable to connect Cal.com.');

      setCalApiKey('');
      await loadCalConnection();
    } catch (error) {
      setCalSetupError(error instanceof Error ? error.message : 'Unable to connect Cal.com.');
    } finally {
      setSavingCalConnection(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Add kids names, manage family setup, and review deployment-ready configuration." />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="Kids names"
          subtitle={`${children.length} saved for activities, calendar, and appointments`}
          icon={<Users size={20} />}
          action={
            <button className="button-primary min-h-10 px-3 py-2 text-sm" onClick={openAddChild}>
              <Plus size={16} /> Add kid
            </button>
          }
        >
          <div className="grid gap-3">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-3 rounded-2xl bg-linen p-3">
                <span className="h-10 w-10 shrink-0 rounded-2xl" style={{ backgroundColor: child.color }} />
                <span className="min-w-0 flex-1 truncate font-semibold">{child.name}</span>
                <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => openEditChild(child)} aria-label={`Edit ${child.name}`}>
                  <Pencil size={17} />
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-clay" onClick={() => removeChild(child)} aria-label={`Delete ${child.name}`}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {children.length === 0 ? <p className="rounded-2xl bg-linen p-3 text-sm text-stone-500">No kids added yet.</p> : null}
          </div>
        </SectionCard>
        <SectionCard title="Supabase" subtitle="Auth, database, and row-level security" icon={<Database size={20} />}>
          <StatusPill label={import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Needs env vars'} tone={import.meta.env.VITE_SUPABASE_URL ? 'green' : 'yellow'} />
          <p className="mt-4 text-sm leading-6 text-stone-600">Use Supabase Auth for families and the SQL schema in the repository to create protected tables.</p>
        </SectionCard>
        <SectionCard title="Google Calendar" subtitle="OAuth and read-only event sync" icon={<CalendarDays size={20} />}>
          <StatusPill label="Read-only sync" tone="blue" />
          <p className="mt-4 text-sm leading-6 text-stone-600">Connect multiple calendars per user, store refresh tokens server-side, and display only selected calendars.</p>
        </SectionCard>
        <SectionCard
          title="Cal.com"
          subtitle="Upcoming booking sync"
          icon={<KeyRound size={20} />}
          action={<button className="button-primary min-h-10 px-3 py-2 text-sm" onClick={() => setCalSetupOpen(true)}>Set up</button>}
        >
          <StatusPill label={calConnection ? `Connected ${calConnection.key_hint}` : 'Needs connection'} tone={calConnection ? 'green' : 'yellow'} />
          <p className="mt-4 text-sm leading-6 text-stone-600">Each household can connect its own Cal.com account, then refresh bookings from the Calendar page.</p>
        </SectionCard>
        <SectionCard title="Weather" subtitle="Server-side API key" icon={<CloudSun size={20} />}>
          <StatusPill label="Proxy route ready" tone="green" />
          <p className="mt-4 text-sm leading-6 text-stone-600">Weather requests go through an API route so the provider key never ships to the browser.</p>
        </SectionCard>
        <SectionCard title="Security" subtitle="Production defaults" icon={<ShieldCheck size={20} />}>
          <StatusPill label="RLS required" tone="red" />
          <p className="mt-4 text-sm leading-6 text-stone-600">Service role keys belong only on the server. Validate inputs before writes and refresh Google tokens securely.</p>
        </SectionCard>
      </div>
      <Modal open={open} title={editingChild ? 'Edit kid name' : 'Add kid name'} onClose={closeModal}>
        <form onSubmit={submitChild} className="grid gap-4">
          <Field label="Kid name"><TextInput name="name" required placeholder="Kid name" defaultValue={editingChild?.name} /></Field>
          <Field label="Color"><TextInput name="color" type="color" defaultValue={editingChild?.color ?? '#7c9db0'} /></Field>
          <FormActions onCancel={closeModal} submitLabel={editingChild ? 'Save changes' : 'Add kid'} />
        </form>
      </Modal>
      <Modal open={calSetupOpen} title="Connect Cal.com" onClose={() => setCalSetupOpen(false)}>
        <form onSubmit={saveCalConnection} className="grid gap-5 text-sm leading-6 text-stone-600">
          <p className="rounded-2xl bg-sky/10 p-3 text-ink">Your key is sent securely to the dashboard, verified with Cal.com, then encrypted before it is stored. The full key is never shown here again.</p>
          <ol className="grid list-decimal gap-3 pl-5">
            <li><a className="font-semibold text-ink underline underline-offset-4" href="https://app.cal.com/settings/security" target="_blank" rel="noreferrer">Open Cal.com Settings → Security</a>, then choose <strong>API Keys</strong>.</li>
            <li>Create a new API key, give it a recognisable name such as “Family Dashboard”, and copy it. Cal.com shows the full key only once.</li>
            <li>Paste it below and select <strong>Connect Cal.com</strong>.</li>
            <li>Go to Calendar and select <strong>Sync Cal.com</strong>.</li>
          </ol>
          <Field label="Cal.com API key">
            <TextInput name="calApiKey" type="password" value={calApiKey} onChange={(event) => setCalApiKey(event.target.value)} autoComplete="off" placeholder="cal_…" required />
          </Field>
          {calSetupError ? <p className="rounded-2xl border border-clay/30 bg-clay/10 p-3 font-semibold text-clay">{calSetupError}</p> : null}
          {calConnection ? <p className="text-sm text-stone-500">Connected key: {calConnection.key_hint}. Adding a new key will replace it.</p> : null}
          <div className="flex justify-end"><button className="button-primary" type="submit" disabled={savingCalConnection}>{savingCalConnection ? 'Connecting…' : 'Connect Cal.com'}</button></div>
        </form>
      </Modal>
    </>
  );
}

function familyAccessHeader(): Record<string, string> {
  const accessCode = window.sessionStorage.getItem('family-dashboard-access-code') ?? '';
  return accessCode ? { 'x-family-access-code': accessCode } : {};
}

function syncFamilyMemberName(previousName: string, nextName: string) {
  const activities = readStoredCollection<KidsActivity>('kids_activities', activitiesSeed);
  writeStoredCollection(
    'kids_activities',
    activities.map((activity) => (activity.childName === previousName ? { ...activity, childName: nextName } : activity)),
  );

  const appointments = readStoredCollection<DoctorAppointment>('doctor_appointments', appointmentsSeed);
  writeStoredCollection(
    'doctor_appointments',
    appointments.map((appointment) => (appointment.person === previousName ? { ...appointment, person: nextName } : appointment)),
  );

  const calendarEvents = readStoredCollection<CalendarEvent>('calendar_events', calendarSeed);
  writeStoredCollection(
    'calendar_events',
    calendarEvents.map((event) => (event.owner === previousName ? { ...event, owner: nextName } : event)),
  );
}
