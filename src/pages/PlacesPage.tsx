import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { friendlyDate } from '../lib/format';
import { placesSeed } from '../lib/sampleData';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { PlaceCategory, PlaceToVisit } from '../lib/types';

const categories: PlaceCategory[] = ['Food', 'Outdoors', 'Culture', 'Family fun', 'Travel', 'Other'];

export default function PlacesPage() {
  const { items, add, update, remove } = useLocalCollection<PlaceToVisit>(placesSeed, 'places_to_visit');
  const [open, setOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceToVisit | null>(null);

  const planned = items.filter((place) => !place.visited).sort((first, second) => (first.plannedDate ?? '9999').localeCompare(second.plannedDate ?? '9999'));
  const visited = items.filter((place) => place.visited);

  function openAdd() {
    setEditingPlace(null);
    setOpen(true);
  }

  function openEdit(place: PlaceToVisit) {
    setEditingPlace(place);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingPlace(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextPlace = {
      name: String(form.get('name')),
      category: String(form.get('category')) as PlaceCategory,
      location: String(form.get('location')),
      plannedDate: String(form.get('plannedDate')) || undefined,
      notes: String(form.get('notes')),
      visited: form.get('visited') === 'on',
    };

    if (editingPlace) {
      update(editingPlace.id, nextPlace);
    } else {
      add(nextPlace);
    }
    closeModal();
  }

  return (
    <>
      <PageHeader
        eyebrow="Family wish list"
        title="Places to visit"
        description="Save the spots your family wants to try, then turn an idea into a plan when the time is right."
        action={<button className="button-primary" onClick={openAdd}><Plus size={18} /> Add a place</button>}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <SectionCard title="On the list" subtitle={`${planned.length} place${planned.length === 1 ? '' : 's'} to explore`} icon={<MapPin size={20} />}>
          {planned.length === 0 ? <EmptyState title="Your list is open">Add a restaurant, trail, museum, or getaway you want to remember.</EmptyState> : null}
          <div className="grid gap-3">
            {planned.map((place) => <PlaceCard key={place.id} place={place} onEdit={() => openEdit(place)} onDelete={() => remove(place.id)} onVisit={() => update(place.id, { visited: true })} />)}
          </div>
        </SectionCard>
        <SectionCard title="Already visited" subtitle={`${visited.length} memory${visited.length === 1 ? '' : 'ies'}`}>
          {visited.length === 0 ? <p className="text-sm leading-6 text-stone-500">When you go somewhere, mark it visited to keep a little record of family favorites.</p> : null}
          <div className="grid gap-3">
            {visited.map((place) => (
              <button key={place.id} className="flex items-center gap-3 rounded-2xl bg-linen/70 p-3 text-left" onClick={() => update(place.id, { visited: false })}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage/15 text-sage"><Check size={17} /></span>
                <span className="min-w-0"><span className="block truncate font-semibold">{place.name}</span><span className="block truncate text-sm text-stone-500">Mark as not visited</span></span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
      <button className="button-primary fixed inset-x-3 bottom-5 z-40 shadow-soft sm:inset-x-auto sm:right-5 lg:hidden" onClick={openAdd}><Plus size={18} /> Add a place</button>
      <Modal open={open} title={editingPlace ? 'Edit place' : 'Add a place to visit'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Place name"><TextInput name="name" required placeholder="Children's museum" defaultValue={editingPlace?.name} /></Field>
          <Field label="Category"><SelectInput name="category" defaultValue={editingPlace?.category ?? 'Family fun'}>{categories.map((category) => <option key={category}>{category}</option>)}</SelectInput></Field>
          <Field label="Where"><TextInput name="location" required placeholder="Town, neighborhood, or address" defaultValue={editingPlace?.location} /></Field>
          <Field label="Plan for"><TextInput name="plannedDate" type="date" defaultValue={editingPlace?.plannedDate} /></Field>
          <Field label="Notes"><TextArea name="notes" placeholder="What makes this worth a visit?" defaultValue={editingPlace?.notes} /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-linen p-4 font-semibold"><input name="visited" type="checkbox" className="h-5 w-5" defaultChecked={editingPlace?.visited} /> Already visited</label>
          <FormActions onCancel={closeModal} submitLabel={editingPlace ? 'Save changes' : 'Add place'} />
        </form>
      </Modal>
    </>
  );
}

function PlaceCard({ place, onEdit, onDelete, onVisit }: { place: PlaceToVisit; onEdit: () => void; onDelete: () => void; onVisit: () => void }) {
  return (
    <div className="rounded-3xl bg-linen/60 p-4">
      <div className="flex gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sage shadow-soft"><MapPin size={20} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{place.name}</h2><StatusPill label={place.category} tone="blue" /></div>
          <p className="mt-1 text-sm text-stone-500">{place.location}{place.plannedDate ? ` · ${friendlyDate(place.plannedDate)}` : ' · No date picked yet'}</p>
          {place.notes ? <p className="mt-3 text-sm leading-6 text-stone-600">{place.notes}</p> : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="button-soft min-h-10 px-3 py-2 text-sm" onClick={onVisit}><Check size={16} /> Mark visited</button>
        <button className="button-soft min-h-10 px-3 py-2 text-sm" onClick={onEdit}><Pencil size={16} /> Edit</button>
        <button className="button-soft min-h-10 px-3 py-2 text-sm text-clay" onClick={onDelete}><Trash2 size={16} /> Delete</button>
      </div>
    </div>
  );
}
