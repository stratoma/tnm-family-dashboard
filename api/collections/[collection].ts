import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '../_supabaseAdmin';
import type { VercelRequest, VercelResponse } from '../_types';

type CollectionName =
  | 'family_members'
  | 'tasks'
  | 'calendar_events'
  | 'kids_activities'
  | 'doctor_appointments'
  | 'birthdays'
  | 'grocery_items'
  | 'home_projects';

type CollectionConfig = {
  table: string;
  order: string;
  toClient(row: Record<string, unknown>): Record<string, unknown>;
  toDb(item: Record<string, unknown>): Record<string, unknown>;
};

const configs: Record<Exclude<CollectionName, 'home_projects'>, CollectionConfig> = {
  family_members: {
    table: 'family_members',
    order: 'created_at',
    toClient: (row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      role: row.role ?? 'Child',
    }),
    toDb: (item) => ({
      name: item.name,
      color: item.color,
      role: item.role,
    }),
  },
  tasks: {
    table: 'tasks',
    order: 'due_date',
    toClient: (row) => ({
      id: row.id,
      title: row.title,
      assignee: row.assignee ?? 'Unassigned',
      priority: row.priority,
      dueDate: row.due_date,
      completed: row.completed,
    }),
    toDb: (item) => ({
      title: item.title,
      assignee: item.assignee,
      priority: item.priority,
      due_date: item.dueDate,
      completed: item.completed,
    }),
  },
  calendar_events: {
    table: 'calendar_events',
    order: 'start_time',
    toClient: (row) => ({
      id: row.id,
      title: row.title,
      calendar: row.calendar,
      owner: row.owner,
      start: toDateTimeInput(row.start_time),
      end: toDateTimeInput(row.end_time),
      color: row.color,
      location: row.location ?? '',
    }),
    toDb: (item) => ({
      title: item.title,
      calendar: item.calendar,
      owner: item.owner,
      start_time: item.start,
      end_time: item.end,
      color: item.color,
      location: item.location,
    }),
  },
  kids_activities: {
    table: 'kids_activities',
    order: 'date_time',
    toClient: (row) => ({
      id: row.id,
      activityName: row.activity_name,
      childName: row.child_name,
      location: row.location ?? '',
      address: row.address ?? '',
      frequency: row.frequency ?? 'Weekly',
      dateTime: toDateTimeInput(row.date_time),
      notes: row.notes ?? '',
      reminder: row.reminder,
    }),
    toDb: (item) => ({
      activity_name: item.activityName,
      child_name: item.childName,
      location: item.location,
      address: item.address,
      frequency: item.frequency,
      date_time: item.dateTime,
      notes: item.notes,
      reminder: item.reminder,
    }),
  },
  doctor_appointments: {
    table: 'doctor_appointments',
    order: 'date_time',
    toClient: (row) => ({
      id: row.id,
      person: row.person,
      doctorName: row.doctor_name,
      appointmentType: row.appointment_type,
      dateTime: toDateTimeInput(row.date_time),
      address: row.address ?? '',
      notes: row.notes ?? '',
      followUpReminder: row.follow_up_reminder,
    }),
    toDb: (item) => ({
      person: item.person,
      doctor_name: item.doctorName,
      appointment_type: item.appointmentType,
      date_time: item.dateTime,
      address: item.address,
      notes: item.notes,
      follow_up_reminder: item.followUpReminder,
    }),
  },
  birthdays: {
    table: 'birthdays',
    order: 'birthday',
    toClient: (row) => ({
      id: row.id,
      name: row.name,
      relationship: row.relationship,
      birthday: row.birthday,
      reminderDays: row.reminder_days,
    }),
    toDb: (item) => ({
      name: item.name,
      relationship: item.relationship,
      birthday: item.birthday,
      reminder_days: item.reminderDays,
    }),
  },
  grocery_items: {
    table: 'grocery_items',
    order: 'category',
    toClient: (row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      bought: row.bought,
    }),
    toDb: (item) => ({
      name: item.name,
      category: item.category,
      bought: item.bought,
    }),
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const collection = readCollection(req);

  if (!collection) {
    res.status(404).json({ error: 'Unknown collection.' });
    return;
  }

  if (!hasAccess(req)) {
    res.status(401).json({ error: 'Persistent storage requires the family access code.' });
    return;
  }

  const userId = process.env.FAMILY_USER_ID;
  if (!userId) {
    res.status(500).json({ error: 'FAMILY_USER_ID is not configured.' });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();

    if (collection === 'home_projects') {
      await handleProjects(req, res, supabase, userId);
      return;
    }

    await handleCollection(req, res, supabase, userId, collection, configs[collection]);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Persistent storage is unavailable.' });
  }
}

async function handleCollection(
  req: VercelRequest,
  res: VercelResponse,
  supabase: SupabaseClient,
  userId: string,
  collection: Exclude<CollectionName, 'home_projects'>,
  config: CollectionConfig,
) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from(config.table)
      .select('*')
      .eq('user_id', userId)
      .order(config.order, { ascending: true });

    if (error) {
      throw error;
    }

    res.status(200).json({ items: (data ?? []).map(config.toClient) });
    return;
  }

  if (req.method === 'POST') {
    const body = readBody(req);
    const { data, error } = await supabase
      .from(config.table)
      .insert({ ...config.toDb(body), user_id: userId })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({ item: config.toClient(data) });
    return;
  }

  const id = readId(req);
  if (!id) {
    res.status(400).json({ error: 'Missing item id.' });
    return;
  }

  if (req.method === 'PATCH') {
    const body = readBody(req);
    const { data, error } = await supabase
      .from(config.table)
      .update(config.toDb(body))
      .eq('user_id', userId)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({ item: config.toClient(data) });
    return;
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from(config.table).delete().eq('user_id', userId).eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({ ok: true, collection });
    return;
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  res.status(405).json({ error: 'Method not allowed.' });
}

async function handleProjects(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient, userId: string) {
  if (req.method === 'GET') {
    const { data: projects, error: projectsError } = await supabase
      .from('home_projects')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (projectsError) {
      throw projectsError;
    }

    const projectIds = (projects ?? []).map((project) => project.id);
    const { data: tasks, error: tasksError } = projectIds.length
      ? await supabase.from('project_tasks').select('*').eq('user_id', userId).in('project_id', projectIds).order('created_at')
      : { data: [], error: null };

    if (tasksError) {
      throw tasksError;
    }

    res.status(200).json({ items: (projects ?? []).map((project) => projectToClient(project, tasks ?? [])) });
    return;
  }

  if (req.method === 'POST') {
    const body = readBody(req);
    const { data: project, error } = await supabase
      .from('home_projects')
      .insert({ ...projectToDb(body), user_id: userId })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    await replaceProjectTasks(supabase, userId, project.id, body.tasks);
    res.status(200).json({ item: projectToClient(project, await readProjectTasks(supabase, userId, project.id)) });
    return;
  }

  const id = readId(req);
  if (!id) {
    res.status(400).json({ error: 'Missing item id.' });
    return;
  }

  if (req.method === 'PATCH') {
    const body = readBody(req);
    const { data: project, error } = await supabase
      .from('home_projects')
      .update(projectToDb(body))
      .eq('user_id', userId)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (Array.isArray(body.tasks)) {
      await replaceProjectTasks(supabase, userId, id, body.tasks);
    }

    res.status(200).json({ item: projectToClient(project, await readProjectTasks(supabase, userId, id)) });
    return;
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('home_projects').delete().eq('user_id', userId).eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({ ok: true, collection: 'home_projects' });
    return;
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  res.status(405).json({ error: 'Method not allowed.' });
}

function projectToClient(project: Record<string, unknown>, tasks: Record<string, unknown>[]) {
  return {
    id: project.id,
    projectName: project.project_name,
    status: project.status,
    budget: Number(project.budget ?? 0),
    dueDate: project.due_date,
    notes: project.notes ?? '',
    tasks: tasks
      .filter((task) => task.project_id === project.id)
      .map((task) => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
      })),
  };
}

function projectToDb(item: Record<string, unknown>) {
  return {
    project_name: item.projectName,
    status: item.status,
    budget: item.budget,
    due_date: item.dueDate,
    notes: item.notes,
  };
}

async function readProjectTasks(supabase: SupabaseClient, userId: string, projectId: string) {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('created_at');

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function replaceProjectTasks(supabase: SupabaseClient, userId: string, projectId: string, tasks: unknown) {
  const { error: deleteError } = await supabase.from('project_tasks').delete().eq('user_id', userId).eq('project_id', projectId);

  if (deleteError) {
    throw deleteError;
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from('project_tasks').insert(
    tasks.map((task) => {
      const item = task as Record<string, unknown>;
      return {
        user_id: userId,
        project_id: projectId,
        title: item.title,
        completed: item.completed ?? false,
      };
    }),
  );

  if (insertError) {
    throw insertError;
  }
}

function hasAccess(req: VercelRequest) {
  const accessCode = process.env.ACCESS_CODE;
  const headers = (req as VercelRequest & { headers?: Record<string, string | string[] | undefined> }).headers ?? {};
  const provided = headers['x-family-access-code'];
  return typeof accessCode === 'string' && typeof provided === 'string' && provided === accessCode;
}

function readCollection(req: VercelRequest): CollectionName | null {
  const raw = req.query.collection;
  const collection = Array.isArray(raw) ? raw[0] : raw;

  if (
    collection === 'family_members' ||
    collection === 'tasks' ||
    collection === 'calendar_events' ||
    collection === 'kids_activities' ||
    collection === 'doctor_appointments' ||
    collection === 'birthdays' ||
    collection === 'grocery_items' ||
    collection === 'home_projects'
  ) {
    return collection;
  }

  return null;
}

function readId(req: VercelRequest) {
  const raw = req.query.id;
  return Array.isArray(raw) ? raw[0] : raw;
}

function readBody(req: VercelRequest) {
  return (req.body ?? {}) as Record<string, unknown>;
}

function toDateTimeInput(value: unknown) {
  return typeof value === 'string' ? value.slice(0, 16) : '';
}
