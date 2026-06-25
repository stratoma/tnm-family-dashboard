import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { Field, FormActions, SelectInput, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { tasksSeed } from '../lib/sampleData';
import { friendlyDate } from '../lib/format';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { Priority, Task } from '../lib/types';

export default function TasksPage() {
  const { items, add, update, remove } = useLocalCollection<Task>(tasksSeed, 'tasks');
  const [assignees, setAssignees] = useState<string[]>(() => readAssignees());
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  function openAdd() {
    setEditingTask(null);
    setOpen(true);
  }

  useEffect(() => {
    window.localStorage.setItem('family-dashboard:task_assignees', JSON.stringify(assignees));
  }, [assignees]);

  function openEdit(task: Task) {
    setEditingTask(task);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingTask(null);
  }

  function removeAssignee(name: string) {
    setAssignees((current) => current.filter((assignee) => assignee !== name));
    items
      .filter((task) => task.assignee === name)
      .forEach((task) => update(task.id, { assignee: 'Unassigned' }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedAssignee = String(form.get('assignee'));
    const newAssignee = String(form.get('newAssignee')).trim();
    const assignee = newAssignee || selectedAssignee || 'Unassigned';
    const nextTask = {
      title: String(form.get('title')),
      assignee,
      priority: String(form.get('priority')) as Priority,
      dueDate: String(form.get('dueDate')),
      completed: form.get('completed') === 'on',
    };

    if (newAssignee && !assignees.includes(newAssignee)) {
      setAssignees((current) => [...current, newAssignee]);
    }

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
            <div key={task.id} className="grid gap-3 rounded-3xl bg-linen/60 p-4 sm:flex sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <input type="checkbox" checked={task.completed} onChange={(event) => update(task.id, { completed: event.target.checked })} className="h-6 w-6 shrink-0 rounded border-oat text-sage" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-lg font-semibold ${task.completed ? 'text-stone-400 line-through' : ''}`}>{task.title}</p>
                  <p className="truncate text-sm text-stone-500">{task.assignee} · due {friendlyDate(task.dueDate)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 sm:ml-auto sm:justify-end">
                <StatusPill label={task.priority} tone={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'neutral'} />
                <div className="flex gap-2">
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => openEdit(task)} aria-label="Edit task">
                    <Pencil size={17} />
                  </button>
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500" onClick={() => remove(task.id)} aria-label="Delete task">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <Modal open={open} title={editingTask ? 'Edit task' : 'Add task'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Task"><TextInput name="title" required placeholder="Pack lunches" defaultValue={editingTask?.title} /></Field>
          <Field label="Assign to">
            <SelectInput name="assignee" defaultValue={editingTask?.assignee ?? 'Unassigned'}>
              <option>Unassigned</option>
              {assignees.map((assignee) => <option key={assignee}>{assignee}</option>)}
            </SelectInput>
          </Field>
          <Field label="New assignee"><TextInput name="newAssignee" placeholder="Add a name, like Thierry or Martine" /></Field>
          {assignees.length > 0 ? (
            <div className="rounded-2xl bg-linen p-4">
              <p className="mb-3 text-sm font-semibold text-stone-600">Current assignees</p>
              <div className="flex flex-wrap gap-2">
                {assignees.map((assignee) => (
                  <button
                    key={assignee}
                    type="button"
                    className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-stone-600"
                    onClick={() => removeAssignee(assignee)}
                  >
                    Remove {assignee}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <Field label="Priority"><SelectInput name="priority" defaultValue={editingTask?.priority}><option>Low</option><option>Medium</option><option>High</option></SelectInput></Field>
          <Field label="Due date"><TextInput name="dueDate" type="date" required defaultValue={editingTask?.dueDate} /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-linen p-4 font-semibold"><input name="completed" type="checkbox" className="h-5 w-5" defaultChecked={editingTask?.completed} /> Completed</label>
          <FormActions onCancel={closeModal} submitLabel={editingTask ? 'Save changes' : 'Add task'} />
        </form>
      </Modal>
    </>
  );
}

function readAssignees() {
  try {
    const stored = window.localStorage.getItem('family-dashboard:task_assignees');
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}
