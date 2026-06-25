import { addDays, addMonths, endOfMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import {
  Apple,
  Beef,
  CalendarDays,
  CloudSun,
  Cookie,
  Gift,
  Home,
  Milk,
  Package,
  Plus,
  ShoppingBag,
  ShoppingBasket,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { appointmentsSeed, birthdaysSeed, calendarSeed, emailRepliesSeed, groceriesSeed, projectsSeed, tasksSeed, activitiesSeed } from '../lib/sampleData';
import { currency, daysUntil, friendlyDate, friendlyTime } from '../lib/format';
import { readStoredCollection } from '../lib/useLocalCollection';
import type { GroceryCategory, ProjectStatus } from '../lib/types';

export default function Dashboard() {
  const tasks = readStoredCollection('tasks', tasksSeed);
  const calendarEvents = readStoredCollection('calendar_events', calendarSeed);
  const activities = readStoredCollection('kids_activities', activitiesSeed);
  const appointments = readStoredCollection('doctor_appointments', appointmentsSeed);
  const birthdays = readStoredCollection('birthdays', birthdaysSeed);
  const groceryItems = readStoredCollection('grocery_items', groceriesSeed);
  const projects = readStoredCollection('home_projects', projectsSeed);
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const todayTasks = tasks.filter((task) => !task.completed && isSameDay(parseISO(task.dueDate), today));
  const tomorrowTasks = tasks.filter((task) => !task.completed && isSameDay(parseISO(task.dueDate), tomorrow));
  const todayEvents = calendarEvents.filter((event) => isSameDay(parseISO(event.start), today));
  const tomorrowEvents = calendarEvents.filter((event) => isSameDay(parseISO(event.start), tomorrow));
  const todayActivities = activities.filter((activity) => isSameDay(parseISO(activity.dateTime), today));
  const tomorrowActivities = activities.filter((activity) => isSameDay(parseISO(activity.dateTime), tomorrow));
  const monthlyAppointments = appointments.filter((appointment) =>
    isWithinInterval(parseISO(appointment.dateTime), { start: today, end: endOfMonth(today) }),
  );
  const monthlyBirthdays = birthdays.filter((birthday) =>
    isWithinInterval(parseISO(birthday.birthday), { start: today, end: endOfMonth(today) }),
  );
  const nextMonthEnd = endOfMonth(addMonths(today, 1));
  const upcomingEvents = calendarEvents.filter((event) =>
    isWithinInterval(parseISO(event.start), { start: today, end: nextMonthEnd }),
  );
  const groceries = groceryItems.filter((item) => !item.bought).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="Calm command center"
        title="Today at a glance"
        description="Weather, schedules, urgent tasks, groceries, and gentle reminders in one quiet place."
        action={
          <Link to="/tasks" className="button-primary">
            <Plus size={18} /> Quick add
          </Link>
        }
      />
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[330px_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-4">
          <SectionCard title="Weather" subtitle="New York, NY" icon={<CloudSun size={21} />} className="bg-skysoft/60">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-semibold">74°</p>
                <p className="mt-2 text-stone-600">Partly sunny.</p>
              </div>
              <div className="rounded-3xl bg-white/70 px-4 py-3 text-sm font-semibold">Low 66°</div>
            </div>
          </SectionCard>
          <SectionCard title="Grocery preview" subtitle={`${groceries.length} still needed`} icon={<ShoppingBasket size={21} />}>
            <div className="grid gap-3">
              {groceries.map((item) => (
                <div
                  key={item.id}
                  title={`${item.name} · ${item.category}`}
                  className="flex items-center gap-3 rounded-3xl bg-linen p-3"
                  aria-label={`${item.name}, ${item.category}`}
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${groceryTone(item.category)}`}>
                    <GroceryIcon category={item.category} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{item.name}</span>
                    <span className="block text-sm text-stone-500">{item.category}</span>
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Dates to remember" subtitle="This month and next" icon={<Gift size={21} />}>
            <DateGroup title="Birthdays this month" count={monthlyBirthdays.length}>
              {monthlyBirthdays.map((birthday) => (
                <Row key={birthday.id} title={birthday.name} meta={`${birthday.relationship} · in ${daysUntil(birthday.birthday)} days`} />
              ))}
            </DateGroup>
            <DateGroup title="Appointments this month" count={monthlyAppointments.length}>
              {monthlyAppointments.map((appointment) => (
                <Row
                  key={appointment.id}
                  title={appointment.appointmentType}
                  meta={`${appointment.person} · ${friendlyDate(appointment.dateTime)} at ${friendlyTime(appointment.dateTime)}`}
                />
              ))}
            </DateGroup>
            <DateGroup title="Upcoming events" count={upcomingEvents.length}>
              {upcomingEvents.map((event) => (
                <Row key={event.id} dot={event.color} title={event.title} meta={`${friendlyDate(event.start)} · ${friendlyTime(event.start)}`} />
              ))}
            </DateGroup>
          </SectionCard>
        </div>
        <SectionCard
          title="Family schedule"
          subtitle="Today, tomorrow, and this month"
          icon={<CalendarDays size={21} />}
          className="min-h-full"
        >
          <div className="grid min-w-0 gap-4">
            <ScheduleSection title="Today" count={todayTasks.length + todayEvents.length + todayActivities.length}>
              {todayEvents.map((event) => (
                <Row key={event.id} dot={event.color} title={event.title} meta={`${friendlyTime(event.start)} · ${event.owner}`} />
              ))}
              {todayActivities.map((activity) => (
                <Row
                  key={activity.id}
                  title={activity.activityName}
                  meta={`Kids · ${activity.childName} · ${friendlyTime(activity.dateTime)} · ${activity.location}`}
                />
              ))}
              {todayTasks.map((task) => (
                <Row
                  key={task.id}
                  title={task.title}
                  meta={`To-do · ${task.assignee}`}
                  pill={<StatusPill label={task.priority} tone={task.priority === 'High' ? 'red' : 'yellow'} />}
                />
              ))}
            </ScheduleSection>
            <ScheduleSection title="Tomorrow" count={tomorrowTasks.length + tomorrowEvents.length + tomorrowActivities.length}>
              {tomorrowEvents.map((event) => (
                <Row key={event.id} dot={event.color} title={event.title} meta={`${friendlyTime(event.start)} · ${event.owner}`} />
              ))}
              {tomorrowActivities.map((activity) => (
                <Row
                  key={activity.id}
                  title={activity.activityName}
                  meta={`Kids · ${activity.childName} · ${friendlyTime(activity.dateTime)} · ${activity.location}`}
                />
              ))}
              {tomorrowTasks.map((task) => (
                <Row
                  key={task.id}
                  title={task.title}
                  meta={`To-do · ${task.assignee}`}
                  pill={<StatusPill label={task.priority} tone={task.priority === 'High' ? 'red' : 'yellow'} />}
                />
              ))}
            </ScheduleSection>
            <ScheduleSection title="Emails to reply to" count={emailRepliesSeed.length}>
              {emailRepliesSeed.map((email) => (
                <Row
                  key={email.id}
                  title={email.sender}
                  meta={`${email.subject} · ${friendlyDate(email.receivedAt)}`}
                  pill={<StatusPill label={email.urgency} tone={email.urgency === 'High' ? 'red' : 'yellow'} />}
                />
              ))}
            </ScheduleSection>
          </div>
        </SectionCard>
        <SectionCard title="Home progress report" subtitle="Color-coded status" icon={<Home size={21} />} className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const completed = project.tasks.filter((task) => task.completed).length;
              const progress = project.tasks.length === 0 ? 0 : Math.round((completed / project.tasks.length) * 100);

              return (
                <div key={project.id} className={`rounded-3xl border p-4 ${projectStatusCard(project.status)}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">{project.projectName}</p>
                      <p className="mt-1 text-sm text-stone-600">{currency(project.budget)} · due {friendlyDate(project.dueDate)}</p>
                    </div>
                    <StatusPill label={project.status} tone={projectStatusTone(project.status)} />
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/80">
                    <div className={`h-full rounded-full ${projectProgressBar(project.status)}`} style={{ width: `${Math.max(progress, 8)}%` }} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-stone-600">{progress}% complete</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="grid min-w-0 gap-3">{children}</div>;
}

function ScheduleSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-3xl bg-linen/50 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <StatusPill label={`${count}`} tone="neutral" />
      </div>
      <Stack>{count > 0 ? children : <p className="rounded-2xl bg-white p-3 text-sm text-stone-500">Nothing scheduled.</p>}</Stack>
    </div>
  );
}

function DateGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="border-t border-oat/70 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <StatusPill label={`${count}`} tone="neutral" />
      </div>
      <Stack>{count > 0 ? children : <p className="rounded-2xl bg-linen/60 p-3 text-sm text-stone-500">Nothing here yet.</p>}</Stack>
    </div>
  );
}

function Row({ title, meta, dot, pill }: { title: string; meta: string; dot?: string; pill?: React.ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-linen/60 p-3 sm:flex sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {dot ? <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: dot }} /> : null}
          <p className="min-w-0 truncate font-semibold">{title}</p>
        </div>
        <p className="mt-1 truncate text-sm text-stone-500">{meta}</p>
      </div>
      {pill ? <div className="mt-3 shrink-0 sm:mt-0">{pill}</div> : null}
    </div>
  );
}

function GroceryIcon({ category }: { category: GroceryCategory }) {
  const iconProps = { size: 24, strokeWidth: 2 };

  switch (category) {
    case 'Produce':
      return <Apple {...iconProps} />;
    case 'Meat':
      return <Beef {...iconProps} />;
    case 'Dairy':
      return <Milk {...iconProps} />;
    case 'Pantry':
      return <Package {...iconProps} />;
    case 'Household':
      return <Home {...iconProps} />;
    case 'Snacks':
      return <Cookie {...iconProps} />;
    case 'Other':
      return <ShoppingBag {...iconProps} />;
    default:
      return <ShoppingBag {...iconProps} />;
  }
}

function groceryTone(category: GroceryCategory) {
  switch (category) {
    case 'Produce':
      return 'bg-sage/20 text-sage';
    case 'Meat':
      return 'bg-clay/20 text-clay';
    case 'Dairy':
      return 'bg-skysoft text-stone-700';
    case 'Pantry':
      return 'bg-butter/35 text-stone-700';
    case 'Household':
      return 'bg-stone-200 text-stone-700';
    case 'Snacks':
      return 'bg-amber-100 text-amber-700';
    case 'Other':
      return 'bg-oat text-stone-700';
    default:
      return 'bg-oat text-stone-700';
  }
}

function projectStatusTone(status: ProjectStatus) {
  if (status === 'Done') {
    return 'green';
  }

  if (status === 'In Progress') {
    return 'yellow';
  }

  return 'red';
}

function projectStatusCard(status: ProjectStatus) {
  if (status === 'Done') {
    return 'border-sage/30 bg-sage/10';
  }

  if (status === 'In Progress') {
    return 'border-butter/60 bg-butter/20';
  }

  return 'border-clay/30 bg-clay/10';
}

function projectProgressBar(status: ProjectStatus) {
  if (status === 'Done') {
    return 'bg-sage';
  }

  if (status === 'In Progress') {
    return 'bg-butter';
  }

  return 'bg-clay';
}
