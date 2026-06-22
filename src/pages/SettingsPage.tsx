import { CalendarDays, CloudSun, Database, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Connection status and deployment-ready configuration for the family dashboard." />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Supabase" subtitle="Auth, database, and row-level security" icon={<Database size={20} />}>
          <StatusPill label={import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Needs env vars'} tone={import.meta.env.VITE_SUPABASE_URL ? 'green' : 'yellow'} />
          <p className="mt-4 text-sm leading-6 text-stone-600">Use Supabase Auth for families and the SQL schema in the repository to create protected tables.</p>
        </SectionCard>
        <SectionCard title="Google Calendar" subtitle="OAuth and read-only event sync" icon={<CalendarDays size={20} />}>
          <StatusPill label="Read-only sync" tone="blue" />
          <p className="mt-4 text-sm leading-6 text-stone-600">Connect multiple calendars per user, store refresh tokens server-side, and display only selected calendars.</p>
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
    </>
  );
}
