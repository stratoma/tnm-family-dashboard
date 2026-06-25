import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { appointmentsSeed, familyMembers } from '../lib/sampleData';
import { friendlyDate, friendlyTime } from '../lib/format';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { DoctorAppointment } from '../lib/types';

export default function AppointmentsPage() {
  const { items, add, update, remove } = useLocalCollection<DoctorAppointment>(appointmentsSeed, 'doctor_appointments');
  const [open, setOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<DoctorAppointment | null>(null);

  function openAdd() {
    setEditingAppointment(null);
    setOpen(true);
  }

  function openEdit(appointment: DoctorAppointment) {
    setEditingAppointment(appointment);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingAppointment(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextAppointment = {
      person: String(form.get('person')),
      doctorName: String(form.get('doctorName')),
      appointmentType: String(form.get('appointmentType')),
      dateTime: String(form.get('dateTime')),
      address: String(form.get('address')),
      notes: String(form.get('notes')),
      followUpReminder: form.get('followUpReminder') === 'on',
    };

    if (editingAppointment) {
      update(editingAppointment.id, nextAppointment);
    } else {
      add(nextAppointment);
    }

    closeModal();
  }

  return (
    <>
      <PageHeader title="Doctor appointments" description="Keep appointment details, addresses, and follow-up reminders easy to find." action={<button className="button-primary" onClick={openAdd}><Plus size={18} /> Add appointment</button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((appointment) => (
          <SectionCard key={appointment.id} title={appointment.appointmentType} subtitle={`${appointment.person} · ${friendlyDate(appointment.dateTime)} at ${friendlyTime(appointment.dateTime)}`}>
            <p className="font-semibold">{appointment.doctorName}</p>
            <p className="mt-1 text-stone-600">{appointment.address}</p>
            <p className="mt-3 rounded-2xl bg-linen p-3 text-sm text-stone-600">{appointment.notes || 'No notes yet.'}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {appointment.followUpReminder ? <StatusPill label="Follow-up reminder" tone="green" /> : <StatusPill label="No follow-up" tone="neutral" />}
              <div className="flex gap-2">
                <button className="button-soft px-3 py-2 text-sm" onClick={() => openEdit(appointment)}><Pencil size={16} /> Edit</button>
                <button className="button-soft px-3 py-2 text-sm text-clay" onClick={() => remove(appointment.id)}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
      <Modal open={open} title={editingAppointment ? 'Edit appointment' : 'Add appointment'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Person"><SelectInput name="person" defaultValue={editingAppointment?.person}>{familyMembers.map((member) => <option key={member.id}>{member.name}</option>)}</SelectInput></Field>
          <Field label="Doctor"><TextInput name="doctorName" required placeholder="Dr. Rivera" defaultValue={editingAppointment?.doctorName} /></Field>
          <Field label="Type"><TextInput name="appointmentType" required placeholder="Checkup" defaultValue={editingAppointment?.appointmentType} /></Field>
          <Field label="Date and time"><TextInput name="dateTime" type="datetime-local" required defaultValue={editingAppointment?.dateTime} /></Field>
          <Field label="Address"><TextInput name="address" required defaultValue={editingAppointment?.address} /></Field>
          <Field label="Notes"><TextArea name="notes" defaultValue={editingAppointment?.notes} /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-linen p-4 font-semibold"><input name="followUpReminder" type="checkbox" className="h-5 w-5" defaultChecked={editingAppointment?.followUpReminder} /> Follow-up reminder</label>
          <FormActions onCancel={closeModal} submitLabel={editingAppointment ? 'Save changes' : 'Add appointment'} />
        </form>
      </Modal>
    </>
  );
}
