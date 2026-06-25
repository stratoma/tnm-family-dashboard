import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { activitiesSeed, familyMembers } from '../lib/sampleData';
import { friendlyDate, friendlyTime } from '../lib/format';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { KidsActivity } from '../lib/types';

export default function ActivitiesPage() {
  const { items, add, update, remove } = useLocalCollection<KidsActivity>(activitiesSeed, 'kids_activities');
  const [open, setOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<KidsActivity | null>(null);

  function openAdd() {
    setEditingActivity(null);
    setOpen(true);
  }

  function openEdit(activity: KidsActivity) {
    setEditingActivity(activity);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingActivity(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextActivity = {
      activityName: String(form.get('activityName')),
      childName: String(form.get('childName')),
      location: String(form.get('location')),
      dateTime: String(form.get('dateTime')),
      notes: String(form.get('notes')),
      reminder: form.get('reminder') === 'on',
    };

    if (editingActivity) {
      update(editingActivity.id, nextActivity);
    } else {
      add(nextActivity);
    }

    closeModal();
  }

  return (
    <>
      <PageHeader title="Kids’ activities" description="A lightweight place for practices, lessons, clubs, locations, and reminders." action={<button className="button-primary" onClick={openAdd}><Plus size={18} /> Add activity</button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((activity) => (
          <SectionCard key={activity.id} title={activity.activityName} subtitle={`${activity.childName} · ${friendlyDate(activity.dateTime)} at ${friendlyTime(activity.dateTime)}`}>
            <p className="text-stone-600">{activity.location}</p>
            <p className="mt-3 rounded-2xl bg-linen p-3 text-sm text-stone-600">{activity.notes || 'No notes yet.'}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {activity.reminder ? <StatusPill label="Reminder on" tone="green" /> : <StatusPill label="No reminder" tone="neutral" />}
              <div className="flex gap-2">
                <button className="button-soft px-3 py-2 text-sm" onClick={() => openEdit(activity)}><Pencil size={16} /> Edit</button>
                <button className="button-soft px-3 py-2 text-sm text-clay" onClick={() => remove(activity.id)}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
      <Modal open={open} title={editingActivity ? 'Edit activity' : 'Add activity'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Activity"><TextInput name="activityName" required placeholder="Swim lesson" defaultValue={editingActivity?.activityName} /></Field>
          <Field label="Child"><SelectInput name="childName" defaultValue={editingActivity?.childName}>{familyMembers.slice(2).map((member) => <option key={member.id}>{member.name}</option>)}</SelectInput></Field>
          <Field label="Location"><TextInput name="location" required placeholder="Community pool" defaultValue={editingActivity?.location} /></Field>
          <Field label="Date and time"><TextInput name="dateTime" type="datetime-local" required defaultValue={editingActivity?.dateTime} /></Field>
          <Field label="Notes"><TextArea name="notes" placeholder="What should we bring?" defaultValue={editingActivity?.notes} /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-linen p-4 font-semibold"><input name="reminder" type="checkbox" className="h-5 w-5" defaultChecked={editingActivity?.reminder ?? true} /> Reminder</label>
          <FormActions onCancel={closeModal} submitLabel={editingActivity ? 'Save changes' : 'Add activity'} />
        </form>
      </Modal>
    </>
  );
}
