import type { Birthday, CalendarEvent, DoctorAppointment, EmailReply, FamilyMember, GroceryItem, HomeProject, KidsActivity, Task } from './types';

export const familyMembers: FamilyMember[] = [
  { id: 'm1', name: 'Alex', color: '#8da089' },
  { id: 'm2', name: 'Jordan', color: '#c58f76' },
  { id: 'm3', name: 'Maya', color: '#7c9db0' },
  { id: 'm4', name: 'Noah', color: '#d6aa58' },
];

export const tasksSeed: Task[] = [
  { id: 't1', title: 'Sign school permission slip', assignee: 'Unassigned', priority: 'High', dueDate: '2026-06-21', completed: false },
  { id: 't2', title: 'Book summer camp pickup rotation', assignee: 'Unassigned', priority: 'Medium', dueDate: '2026-06-22', completed: false },
  { id: 't3', title: 'Return library books', assignee: 'Unassigned', priority: 'Low', dueDate: '2026-06-24', completed: true },
];

export const calendarSeed: CalendarEvent[] = [
  { id: 'e1', title: 'Soccer practice', calendar: 'Kids', owner: 'Maya', start: '2026-06-21T16:30:00', end: '2026-06-21T17:30:00', color: '#8da089', location: 'Oak Park' },
  { id: 'e2', title: 'Dentist checkup', calendar: 'Health', owner: 'Noah', start: '2026-06-22T09:00:00', end: '2026-06-22T09:45:00', color: '#c58f76', location: 'Maple Dental' },
  { id: 'e3', title: 'Family dinner', calendar: 'Family', owner: 'Everyone', start: '2026-06-23T18:30:00', end: '2026-06-23T20:00:00', color: '#d6aa58' },
];

export const activitiesSeed: KidsActivity[] = [
  { id: 'a1', activityName: 'Soccer practice', childName: 'Maya', location: 'Oak Park', dateTime: '2026-06-21T16:30:00', notes: 'Bring cleats and water bottle.', reminder: true },
  { id: 'a2', activityName: 'Piano lesson', childName: 'Noah', location: 'Ms. Kim studio', dateTime: '2026-06-24T15:45:00', notes: 'Practice book is in backpack.', reminder: true },
];

export const appointmentsSeed: DoctorAppointment[] = [
  { id: 'd1', person: 'Noah', doctorName: 'Dr. Patel', appointmentType: 'Dentist', dateTime: '2026-06-22T09:00:00', address: '101 Maple Ave', notes: 'Insurance card in wallet.', followUpReminder: true },
  { id: 'd2', person: 'Alex', doctorName: 'Dr. Brooks', appointmentType: 'Annual physical', dateTime: '2026-07-02T10:30:00', address: '88 Wellness Way', notes: 'Fasting labs.', followUpReminder: false },
];

export const emailRepliesSeed: EmailReply[] = [
  {
    id: 'em1',
    sender: 'Rick Carlson',
    subject: 'Re: education acquisition interest for Yellow Tail Tech',
    receivedAt: '2026-06-19T11:49:04',
    preview: 'Asks whether it is worth having a quick intro call early next week.',
    urgency: 'High',
  },
  {
    id: 'em2',
    sender: 'Tati Borovyk',
    subject: 'Regarding your application to apiphani',
    receivedAt: '2026-06-17T15:18:00',
    preview: 'Requests clarification before moving forward with next steps.',
    urgency: 'High',
  },
  {
    id: 'em3',
    sender: 'Audrey Johnson',
    subject: 'Thierry',
    receivedAt: '2026-06-19T12:14:45',
    preview: 'Asks whether you would be open to a brief conversation.',
    urgency: 'Medium',
  },
];

export const birthdaysSeed: Birthday[] = [
  { id: 'b1', name: 'Grandma Rose', relationship: 'Family', birthday: '2026-06-30', reminderDays: 7 },
  { id: 'b2', name: 'Sam Rivera', relationship: 'Friend', birthday: '2026-07-08', reminderDays: 3 },
  { id: 'b3', name: 'Uncle Ben', relationship: 'Family', birthday: '2026-08-14', reminderDays: 7 },
];

export const groceriesSeed: GroceryItem[] = [
  { id: 'g1', name: 'Strawberries', category: 'Produce', bought: false },
  { id: 'g2', name: 'Chicken thighs', category: 'Meat', bought: false },
  { id: 'g3', name: 'Greek yogurt', category: 'Dairy', bought: true },
  { id: 'g4', name: 'Paper towels', category: 'Household', bought: false },
];

export const projectsSeed: HomeProject[] = [
  {
    id: 'p1',
    projectName: 'Refresh entryway',
    status: 'In Progress',
    budget: 350,
    dueDate: '2026-07-15',
    notes: 'Keep it simple: hooks, shoe bench, washable rug.',
    tasks: [
      { id: 'pt1', title: 'Measure wall space', completed: true },
      { id: 'pt2', title: 'Choose bench', completed: false },
    ],
  },
  {
    id: 'p2',
    projectName: 'Garage storage',
    status: 'Not Started',
    budget: 600,
    dueDate: '2026-08-01',
    notes: 'Wall rails and labeled bins.',
    tasks: [{ id: 'pt3', title: 'Inventory sports gear', completed: false }],
  },
];
