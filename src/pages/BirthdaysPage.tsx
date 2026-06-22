import { Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Field, FormActions, SelectInput, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { birthdaysSeed } from '../lib/sampleData';
import { daysUntil, fullDate } from '../lib/format';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { Birthday } from '../lib/types';

export default function BirthdaysPage() {
  const { items, add } = useLocalCollection<Birthday>(birthdaysSeed);
  const [open, setOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    add({
      name: String(form.get('name')),
      relationship: String(form.get('relationship')),
      birthday: String(form.get('birthday')),
      reminderDays: Number(form.get('reminderDays')),
    });
    setOpen(false);
  }

  return (
    <>
      <PageHeader title="Birthdays" description="Remember family and friends with just enough advance notice." action={<button className="button-primary" onClick={() => setOpen(true)}><Plus size={18} /> Add birthday</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((birthday) => (
          <SectionCard key={birthday.id} title={birthday.name} subtitle={birthday.relationship}>
            <p className="text-lg font-semibold">{fullDate(birthday.birthday)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill label={`In ${daysUntil(birthday.birthday)} days`} tone="yellow" />
              <StatusPill label={`${birthday.reminderDays} day reminder`} tone="neutral" />
            </div>
          </SectionCard>
        ))}
      </div>
      <Modal open={open} title="Add birthday" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Name"><TextInput name="name" required /></Field>
          <Field label="Relationship"><TextInput name="relationship" required placeholder="Friend, cousin, grandparent" /></Field>
          <Field label="Birthday"><TextInput name="birthday" type="date" required /></Field>
          <Field label="Reminder"><SelectInput name="reminderDays"><option value="3">3 days before</option><option value="7">7 days before</option><option value="14">14 days before</option></SelectInput></Field>
          <FormActions onCancel={() => setOpen(false)} submitLabel="Add birthday" />
        </form>
      </Modal>
    </>
  );
}
