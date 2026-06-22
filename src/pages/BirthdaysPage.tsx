import { Pencil, Plus, Trash2 } from 'lucide-react';
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
  const { items, add, update, remove } = useLocalCollection<Birthday>(birthdaysSeed);
  const [open, setOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);

  function openAdd() {
    setEditingBirthday(null);
    setOpen(true);
  }

  function openEdit(birthday: Birthday) {
    setEditingBirthday(birthday);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingBirthday(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextBirthday = {
      name: String(form.get('name')),
      relationship: String(form.get('relationship')),
      birthday: String(form.get('birthday')),
      reminderDays: Number(form.get('reminderDays')),
    };

    if (editingBirthday) {
      update(editingBirthday.id, nextBirthday);
    } else {
      add(nextBirthday);
    }

    closeModal();
  }

  return (
    <>
      <PageHeader title="Birthdays" description="Remember family and friends with just enough advance notice." action={<button className="button-primary" onClick={openAdd}><Plus size={18} /> Add birthday</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((birthday) => (
          <SectionCard key={birthday.id} title={birthday.name} subtitle={birthday.relationship}>
            <p className="text-lg font-semibold">{fullDate(birthday.birthday)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill label={`In ${daysUntil(birthday.birthday)} days`} tone="yellow" />
              <StatusPill label={`${birthday.reminderDays} day reminder`} tone="neutral" />
              <button className="button-soft ml-auto px-3 py-2 text-sm" onClick={() => openEdit(birthday)}><Pencil size={16} /> Edit</button>
              <button className="button-soft px-3 py-2 text-sm text-clay" onClick={() => remove(birthday.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </SectionCard>
        ))}
      </div>
      <Modal open={open} title={editingBirthday ? 'Edit birthday' : 'Add birthday'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Name"><TextInput name="name" required defaultValue={editingBirthday?.name} /></Field>
          <Field label="Relationship"><TextInput name="relationship" required placeholder="Friend, cousin, grandparent" defaultValue={editingBirthday?.relationship} /></Field>
          <Field label="Birthday"><TextInput name="birthday" type="date" required defaultValue={editingBirthday?.birthday} /></Field>
          <Field label="Reminder"><SelectInput name="reminderDays" defaultValue={editingBirthday?.reminderDays}><option value="3">3 days before</option><option value="7">7 days before</option><option value="14">14 days before</option></SelectInput></Field>
          <FormActions onCancel={closeModal} submitLabel={editingBirthday ? 'Save changes' : 'Add birthday'} />
        </form>
      </Modal>
    </>
  );
}
