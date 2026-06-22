# Family Dashboard

A minimalist family command center built with React, TypeScript, Tailwind CSS, Supabase, Google Calendar API, and a Vercel-ready serverless API layer.

## Features

- Dashboard with weather, schedule, urgent to-dos, kids' activities, appointments, groceries, projects, and birthdays
- Calendar page with multiple Google Calendar connection flow, color-coded combined event display, and Today/Week/Month controls
- To-dos, kids' activities, doctor appointments, birthdays, groceries, and home projects
- Slide-over quick-entry forms, empty states, loading/error components, and large mobile-first controls
- Server-side weather proxy so API keys are never exposed in the browser
- Google OAuth routes with read-only calendar scope and token refresh handling
- Supabase schema with row-level security

## Tech Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Backend: Vercel serverless API routes
- Database/Auth: Supabase
- Calendar: Google Calendar API
- Weather: OpenWeather API

## Local Setup

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

Copy `.env.example` to `.env.local` and fill in values before connecting live services.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable email auth or your preferred Supabase Auth provider.
4. Add these environment variables:

```bash
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Do not expose it with a `VITE_` prefix.

## Google Calendar OAuth Setup

1. In Google Cloud Console, create an OAuth client for a web application.
2. Enable the Google Calendar API.
3. Add an authorized redirect URI:

```text
http://localhost:5173/api/google/oauth/callback
```

For Vercel, add:

```text
https://your-domain.vercel.app/api/google/oauth/callback
```

4. Configure:

```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/google/oauth/callback
```

The app requests read-only calendar access. It stores refresh tokens in `google_calendar_connections` and refreshes expired access tokens on the server.

## Weather Setup

1. Create an OpenWeather API key.
2. Add:

```bash
WEATHER_API_KEY=your-openweather-key
```

Weather requests should go through `/api/weather?city=New%20York`; never call the provider directly from the frontend with the secret key.

## Vercel Deployment

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.example`.
4. Set the Google OAuth redirect URI to your Vercel domain.
5. Deploy.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

## Notes

The current UI uses local seed data so the dashboard is usable immediately. The Supabase client and serverless routes are ready for replacing local state with authenticated reads and writes. Google Calendar is intentionally read-only; event editing should be added as a separate explicit feature.
