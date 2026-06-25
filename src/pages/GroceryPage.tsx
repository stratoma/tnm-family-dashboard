import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Field, FormActions, SelectInput, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { groceriesSeed } from '../lib/sampleData';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { GroceryCategory, GroceryItem } from '../lib/types';

const defaultCategories: GroceryCategory[] = ['Produce', 'Meat', 'Dairy', 'Pantry', 'Household', 'Snacks', 'Other'];

export default function GroceryPage() {
  const { items, add, update, remove } = useLocalCollection<GroceryItem>(groceriesSeed, 'grocery_items');
  const [categories, setCategories] = useState<GroceryCategory[]>(defaultCategories);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const categoryOptions = Array.from(new Set([...categories, ...items.map((item) => item.category)]));

  function openAdd() {
    setEditingItem(null);
    setOpen(true);
  }

  function openEdit(item: GroceryItem) {
    setEditingItem(item);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingItem(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedCategory = String(form.get('category'));
    const newCategory = String(form.get('newCategory')).trim();
    const category = newCategory || selectedCategory;
    const nextItem = {
      name: String(form.get('name')),
      category,
      bought: form.get('bought') === 'on',
    };

    if (newCategory && !categories.includes(newCategory)) {
      setCategories((current) => [...current, newCategory]);
    }

    if (editingItem) {
      update(editingItem.id, nextItem);
    } else {
      add(nextItem);
    }

    closeModal();
  }

  return (
    <>
      <PageHeader title="Grocery list" description="A shared family list with quick add, categories, and bought status." action={<button className="button-primary" onClick={openAdd}><Plus size={18} /> Add item</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categoryOptions.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          return (
            <SectionCard key={category} title={category} subtitle={`${categoryItems.length} items`}>
              <div className="grid gap-2">
                {categoryItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-linen/60 p-3">
                    <input type="checkbox" checked={item.bought} onChange={(event) => update(item.id, { bought: event.target.checked })} className="h-5 w-5 shrink-0" />
                    <span className={`min-w-0 flex-1 truncate font-semibold ${item.bought ? 'text-stone-400 line-through' : ''}`}>{item.name}</span>
                    <div className="flex shrink-0 gap-2">
                      <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => openEdit(item)} aria-label="Edit grocery item"><Pencil size={17} /></button>
                      <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => remove(item.id)} aria-label="Delete grocery item"><Trash2 size={17} /></button>
                    </div>
                  </div>
                ))}
                {categoryItems.length === 0 ? <p className="rounded-2xl bg-linen/50 p-3 text-sm text-stone-500">Nothing here yet.</p> : null}
              </div>
            </SectionCard>
          );
        })}
      </div>
      <button className="button-primary fixed inset-x-3 bottom-5 z-40 shadow-soft sm:inset-x-auto sm:right-5 xl:hidden" onClick={openAdd}>
        <Plus size={18} /> Add item
      </button>
      <Modal open={open} title={editingItem ? 'Edit grocery item' : 'Add grocery item'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Item"><TextInput name="name" required placeholder="Bananas" defaultValue={editingItem?.name} /></Field>
          <Field label="Category"><SelectInput name="category" defaultValue={editingItem?.category}>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</SelectInput></Field>
          <Field label="New category"><TextInput name="newCategory" placeholder="Create one, like Baby, Frozen, Pets" /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-linen p-4 font-semibold"><input name="bought" type="checkbox" className="h-5 w-5" defaultChecked={editingItem?.bought} /> Bought</label>
          <FormActions onCancel={closeModal} submitLabel={editingItem ? 'Save changes' : 'Add item'} />
        </form>
      </Modal>
    </>
  );
}
