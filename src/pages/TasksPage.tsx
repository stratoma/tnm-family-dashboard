import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { Field, FormActions, SelectInput, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { familyMembers, tasksSeed } from '../lib/sampleData';
import { friendlyDate } from '../lib/format';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { Priority, Task } from '../lib/types';

export default function TasksPage() {
  const { items, add, update, remove } = useLocalCollection<Task>(tasksSeed);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function openAdd() {
    setEditingTask(null);
    setOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingTask(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextTask = {
      title: String(form.get('title')),
      assignee: String(form.get('assignee')),
      priority: String(form.get('priority')) as Priority,
      dueDate: String(form.get('dueDate')),
      completed: form.get('completed') === 'on',
    };

    if (editingTask) {
      update(editingTask.id, nextTask);
    } else {
      add(nextTask);
    }

    closeModal();
  }

  return (
    <>
      <PageHeader title="Family to-dos" description="Assign tasks, mark priorities, and keep the day moving." action={<button className="button-primary" onClick={openAdd}><Plus size={18} /> Add task</button>} />
      <SectionCard title="Open tasks" subtitle={`${items.filter((task) => !task.completed).length} active`}>
        {items.length === 0 ? <EmptyState title="No tasks yet">Add the first small thing that would make today easier.</EmptyState> : null}
        <div className="grid gap-3">
          {items.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-3xl bg-linen/60 p-4">
              <input type="checkbox" checked={task.completed} onChange={(event) => update(task.id, { completed: event.target.checked })} className="h-6 w-6 rounded border-oat text-sage" />
              <div className="min-w-0 flex-1">
                <p className={`text-lg font-semibold ${task.completed ? 'text-stone-400 line-through' : ''}`}>{task.title}</p>
                <p className="text-sm text-stone-500">{task.assignee} · due {friendlyDate(task.dueDate)}</p>
              </div>
              <StatusPill label={task.priority} tone={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'neutral'} />
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => openEdit(task)} aria-label="Edit task">
                <Pencil size={17} />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => remove(task.id)} aria-label="Delete task">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
      <Modal open={open} title={editingTask ? 'Edit task' : 'Add task'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Task"><TextInput name="title" required placeholder="Pack lunches" defaultValue={editingTask?.title} /></Field>
          <Field label="Assign to"><SelectInput name="assignee" defaultValue={editingTask?.assignee}>{familyMembers.map((member) => <option key={member.id}>{member.name}</option>)}</SelectInput></Field>
          <Field label="Priority"><SelectInput name="priority" defaultValue={editingTask?.priority}><option>Low</option><option>Medium</option><option>High</option></SelectInput></Field>
          <Field label="Due date"><TextInput name="dueDate" type="date" required defaultValue={editingTask?.dueDate} /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-linen p-4 font-semibold"><input name="completed" type="checkbox" className="h-5 w-5" defaultChecked={editingTask?.completed} /> Completed</label>
          <FormActions onCancel={closeModal} submitLabel={editingTask ? 'Save changes' : 'Add task'} />
        </form>
      </Modal>
    </>
  );
}
