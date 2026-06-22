import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Field, FormActions, SelectInput, TextArea, TextInput } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { projectsSeed } from '../lib/sampleData';
import { currency, friendlyDate } from '../lib/format';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { HomeProject, ProjectStatus } from '../lib/types';

const statuses: ProjectStatus[] = ['Not Started', 'In Progress', 'Waiting', 'Done'];

export default function ProjectsPage() {
  const { items, add, update, remove } = useLocalCollection<HomeProject>(projectsSeed);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<HomeProject | null>(null);

  function openAdd() {
    setEditingProject(null);
    setOpen(true);
  }

  function openEdit(project: HomeProject) {
    setEditingProject(project);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingProject(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextProject = {
      projectName: String(form.get('projectName')),
      status: String(form.get('status')) as ProjectStatus,
      budget: Number(form.get('budget')),
      dueDate: String(form.get('dueDate')),
      notes: String(form.get('notes')),
      tasks: editingProject?.tasks ?? [],
    };

    if (editingProject) {
      update(editingProject.id, nextProject);
    } else {
      add(nextProject);
    }

    closeModal();
  }

  return (
    <>
      <PageHeader title="Home projects" description="Track household work without turning your home into a project-management office." action={<button className="button-primary" onClick={openAdd}><Plus size={18} /> Add project</button>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((project) => (
          <SectionCard key={project.id} title={project.projectName} subtitle={`Due ${friendlyDate(project.dueDate)}`}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusPill label={project.status} tone={project.status === 'Done' ? 'green' : project.status === 'Waiting' ? 'yellow' : 'blue'} />
              <StatusPill label={currency(project.budget)} tone="neutral" />
              <div className="grid w-full gap-2 sm:ml-auto sm:flex sm:w-auto">
                <button className="button-soft px-3 py-2 text-sm" onClick={() => openEdit(project)}><Pencil size={16} /> Edit project</button>
                <button className="button-soft px-3 py-2 text-sm text-clay" onClick={() => remove(project.id)}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
            <p className="rounded-2xl bg-linen p-3 text-sm text-stone-600">{project.notes}</p>
            <div className="mt-4 grid gap-2">
              {project.tasks.map((task) => (
                <label key={task.id} className="flex items-center gap-3 rounded-2xl bg-linen/50 p-3">
                  <input type="checkbox" checked={task.completed} readOnly className="h-5 w-5" />
                  <span className={task.completed ? 'text-stone-400 line-through' : 'font-medium'}>{task.title}</span>
                </label>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
      <button className="button-primary fixed inset-x-3 bottom-5 z-40 shadow-soft sm:inset-x-auto sm:right-5 lg:hidden" onClick={openAdd}>
        <Plus size={18} /> Add project
      </button>
      <Modal open={open} title={editingProject ? 'Edit home project' : 'Add home project'} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Project name"><TextInput name="projectName" required placeholder="Paint hallway" defaultValue={editingProject?.projectName} /></Field>
          <Field label="Status"><SelectInput name="status" defaultValue={editingProject?.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</SelectInput></Field>
          <Field label="Budget"><TextInput name="budget" type="number" min="0" required defaultValue={editingProject?.budget} /></Field>
          <Field label="Due date"><TextInput name="dueDate" type="date" required defaultValue={editingProject?.dueDate} /></Field>
          <Field label="Notes"><TextArea name="notes" defaultValue={editingProject?.notes} /></Field>
          <FormActions onCancel={closeModal} submitLabel={editingProject ? 'Save changes' : 'Add project'} />
        </form>
      </Modal>
    </>
  );
}
