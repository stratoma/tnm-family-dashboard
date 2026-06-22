export type Priority = 'Low' | 'Medium' | 'High';
export type ProjectStatus = 'Not Started' | 'In Progress' | 'Waiting' | 'Done';
export type CalendarView = 'Today' | 'Week' | 'Month';

export type FamilyMember = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  title: string;
  assignee: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  calendar: string;
  owner: string;
  start: string;
  end: string;
  color: string;
  location?: string;
};

export type KidsActivity = {
  id: string;
  activityName: string;
  childName: string;
  location: string;
  dateTime: string;
  notes: string;
  reminder: boolean;
};

export type DoctorAppointment = {
  id: string;
  person: string;
  doctorName: string;
  appointmentType: string;
  dateTime: string;
  address: string;
  notes: string;
  followUpReminder: boolean;
};

export type EmailReply = {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  preview: string;
  urgency: Priority;
};

export type Birthday = {
  id: string;
  name: string;
  relationship: string;
  birthday: string;
  reminderDays: number;
};

export type GroceryCategory = 'Produce' | 'Meat' | 'Dairy' | 'Pantry' | 'Household' | 'Snacks' | 'Other';

export type GroceryItem = {
  id: string;
  name: string;
  category: GroceryCategory;
  bought: boolean;
};

export type ProjectTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type HomeProject = {
  id: string;
  projectName: string;
  status: ProjectStatus;
  budget: number;
  dueDate: string;
  notes: string;
  tasks: ProjectTask[];
};
