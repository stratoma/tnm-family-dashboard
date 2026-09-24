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
  LocateFixed,
  Search,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusPill from '../components/StatusPill';
import { appointmentsSeed, birthdaysSeed, calendarSeed, emailRepliesSeed, groceriesSeed, projectsSeed, tasksSeed, activitiesSeed } from '../lib/sampleData';
import { currency, daysUntil, friendlyDate, friendlyTime } from '../lib/format';
import { useLocalCollection } from '../lib/useLocalCollection';
import type { GroceryCategory, ProjectStatus } from '../lib/types';

type WeatherData = {
  city: string;
  temperature: number;
  low: number;
  high: number;
  description: string;
  icon?: string;
};

type WeatherLocation =
  | {
      type: 'city';
      city: string;
    }
  | {
      type: 'coords';
      latitude: number;
      longitude: number;
      label: string;
    };

const weatherLocationKey = 'family-dashboard-weather-location';

function activityMeta(activity: { childName: string; dateTime: string; location: string; frequency?: string }) {
  return `Kids · ${activity.childName} · ${friendlyTime(activity.dateTime)} · ${activity.frequency || 'One-time'} · ${activity.location}`;
}

export default function Dashboard() {
  const { items: tasks } = useLocalCollection(tasksSeed, 'tasks');
  const { items: calendarEvents } = useLocalCollection(calendarSeed, 'calendar_events');
  const { items: activities } = useLocalCollection(activitiesSeed, 'kids_activities');
  const { items: appointments } = useLocalCollection(appointmentsSeed, 'doctor_appointments');
  const { items: birthdays } = useLocalCollection(birthdaysSeed, 'birthdays');
  const { items: groceryItems } = useLocalCollection(groceriesSeed, 'grocery_items');
  const { items: projects } = useLocalCollection(projectsSeed, 'home_projects');
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
          <WeatherCard />
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
                  meta={activityMeta(activity)}
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
                  meta={activityMeta(activity)}
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

function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedLocation = readWeatherLocation();
    if (storedLocation) {
      setLocation(storedLocation);
      setLocationInput(storedLocation.type === 'city' ? storedLocation.city : '');
      return;
    }

    if (!navigator.geolocation) {
      setLocation({ type: 'city', city: 'New York' });
      setLocationInput('New York');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: WeatherLocation = {
          type: 'coords',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Current location',
        };

        saveWeatherLocation(nextLocation);
        setLocation(nextLocation);
      },
      () => {
        setLocation({ type: 'city', city: 'New York' });
        setLocationInput('New York');
      },
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 30, timeout: 7000 },
    );
  }, []);

  useEffect(() => {
    if (!location) {
      return;
    }

    const activeLocation = location;
    const controller = new AbortController();

    async function loadWeather() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchWeather(activeLocation, controller.signal);
        if (
          typeof data.city !== 'string' ||
          typeof data.temperature !== 'number' ||
          typeof data.low !== 'number' ||
          typeof data.high !== 'number' ||
          typeof data.description !== 'string'
        ) {
          throw new Error('Unexpected weather response');
        }

        setWeather({
          city: data.city,
          temperature: data.temperature,
          low: data.low,
          high: data.high,
          description: data.description,
          icon: typeof data.icon === 'string' ? data.icon : undefined,
        });
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Weather is not available right now.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadWeather();

    return () => controller.abort();
  }, [location]);

  function submitLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const city = locationInput.trim();
    if (city.length < 2) {
      setError('Enter a city or town.');
      return;
    }

    const nextLocation: WeatherLocation = { type: 'city', city };
    saveWeatherLocation(nextLocation);
    setLocation(nextLocation);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Current location is not available in this browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: WeatherLocation = {
          type: 'coords',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Current location',
        };

        saveWeatherLocation(nextLocation);
        setLocationInput('');
        setLocation(nextLocation);
      },
      () => {
        setIsLoading(false);
        setError('Location access was not allowed. Search by city instead.');
      },
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 30, timeout: 7000 },
    );
  }

  return (
    <SectionCard
      title="Weather"
      subtitle={weather?.city ?? locationLabel(location) ?? 'Finding location'}
      icon={<CloudSun size={21} />}
      className="bg-skysoft/60"
    >
      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          <div className="h-14 w-24 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-5 w-36 animate-pulse rounded-full bg-white/70" />
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-white/70 p-4">
          <p className="font-semibold text-stone-700">Weather is not available right now.</p>
          <p className="mt-1 text-sm text-stone-500">{error}</p>
        </div>
      ) : weather ? (
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-5xl font-semibold">{weather.temperature}°</p>
              {weather.icon ? (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt=""
                  className="h-14 w-14 shrink-0"
                  loading="lazy"
                />
              ) : null}
            </div>
            <p className="mt-2 capitalize text-stone-600">{weather.description}</p>
          </div>
          <div className="shrink-0 rounded-3xl bg-white/70 px-4 py-3 text-sm font-semibold">
            Low {weather.low}° / High {weather.high}°
          </div>
        </div>
      ) : null}
      <form onSubmit={submitLocation} className="mt-5 flex gap-2">
        <input
          className="input min-h-11 flex-1 rounded-2xl px-3 py-2 text-sm"
          value={locationInput}
          onChange={(event) => setLocationInput(event.target.value)}
          placeholder="City or ZIP"
          aria-label="Weather location"
        />
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink text-white" type="submit" aria-label="Search weather location">
          <Search size={18} />
        </button>
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-oat bg-white text-ink"
          type="button"
          onClick={useCurrentLocation}
          aria-label="Use current location"
        >
          <LocateFixed size={18} />
        </button>
      </form>
    </SectionCard>
  );
}

function locationLabel(location: WeatherLocation | null) {
  if (!location) {
    return null;
  }

  return location.type === 'city' ? location.city : location.label;
}

function readWeatherLocation(): WeatherLocation | null {
  try {
    const stored = localStorage.getItem(weatherLocationKey);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<WeatherLocation>;
    if (parsed.type === 'city' && typeof parsed.city === 'string' && parsed.city.trim().length >= 2) {
      return { type: 'city', city: parsed.city.trim() };
    }

    if (
      parsed.type === 'coords' &&
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      Number.isFinite(parsed.latitude) &&
      Number.isFinite(parsed.longitude)
    ) {
      return {
        type: 'coords',
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        label: typeof parsed.label === 'string' ? parsed.label : 'Current location',
      };
    }
  } catch {
    return null;
  }

  return null;
}

function saveWeatherLocation(location: WeatherLocation) {
  try {
    localStorage.setItem(weatherLocationKey, JSON.stringify(location));
  } catch {
    // Ignore storage failures; weather can still load for this session.
  }
}

async function fetchWeather(location: WeatherLocation, signal: AbortSignal) {
  const params = new URLSearchParams({ units: 'imperial' });
  if (location.type === 'city') {
    params.set('city', location.city);
  } else {
    params.set('lat', String(location.latitude));
    params.set('lon', String(location.longitude));
  }

  const response = await fetch(`/api/weather?${params.toString()}`, { signal });
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = typeof body?.error === 'string' ? body.error : 'The weather service did not respond successfully.';
    throw new Error(message);
  }

  return body as Partial<WeatherData>;
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
