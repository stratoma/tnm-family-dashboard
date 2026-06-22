import { CalendarDays, CheckSquare, Gift, HeartPulse, Home, ListTodo, Menu, ShoppingBasket, Sparkles, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BirthdaysPage from './pages/BirthdaysPage';
import GroceryPage from './pages/GroceryPage';
import ProjectsPage from './pages/ProjectsPage';
import SettingsPage from './pages/SettingsPage';
import AccessGate from './components/AccessGate';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/tasks', label: 'To-dos', icon: CheckSquare },
  { to: '/activities', label: 'Kids', icon: Users },
  { to: '/appointments', label: 'Doctors', icon: HeartPulse },
  { to: '/birthdays', label: 'Birthdays', icon: Gift },
  { to: '/grocery', label: 'Grocery', icon: ShoppingBasket },
  { to: '/projects', label: 'Projects', icon: ListTodo },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('en', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [],
  );

  return (
    <AccessGate>
      <div className="min-h-screen bg-cream text-ink">
        <header className="sticky top-0 z-30 border-b border-oat/70 bg-cream/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
            <NavLink to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sage text-white shadow-soft sm:h-11 sm:w-11">
                <Sparkles size={21} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-semibold tracking-tight sm:text-xl">Family Dashboard</span>
                <span className="block text-sm text-stone-500">{today}</span>
              </span>
            </NavLink>
            <div className="hidden items-center gap-2 xl:flex">
              <nav className="flex flex-wrap items-center gap-1 rounded-3xl bg-white p-1 shadow-soft">
                {navItems.map((item) => (
                  <DesktopNavItem key={item.to} {...item} />
                ))}
              </nav>
              <NavLink to="/settings" className="rounded-full border border-oat bg-white px-4 py-2 text-sm font-medium">
                Settings
              </NavLink>
            </div>
            <button
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-oat bg-white xl:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Open navigation"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          {menuOpen ? (
            <nav className="grid max-h-[calc(100vh-72px)] grid-cols-2 gap-2 overflow-y-auto border-t border-oat/70 bg-cream px-3 py-3 xl:hidden">
              {[...navItems, { to: '/settings', label: 'Settings', icon: Sparkles }].map((item) => (
                <MobileNavItem key={item.to} {...item} onClick={() => setMenuOpen(false)} />
              ))}
            </nav>
          ) : null}
        </header>
        <main className="mx-auto max-w-7xl px-3 py-5 pb-24 sm:px-6 lg:px-8 xl:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/birthdays" element={<BirthdaysPage />} />
            <Route path="/grocery" element={<GroceryPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </AccessGate>
  );
}

function DesktopNavItem({ to, label, icon: Icon }: (typeof navItems)[number]) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive ? 'bg-ink text-white' : 'text-stone-600 hover:bg-linen hover:text-ink'
        }`
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, icon: Icon, onClick }: (typeof navItems)[number] & { onClick: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex min-h-14 items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold sm:gap-3 sm:px-4 sm:text-base ${
          isActive ? 'bg-ink text-white' : 'bg-white text-stone-700'
        }`
      }
    >
      <Icon size={19} />
      {label}
    </NavLink>
  );
}
