# Portfulio Frontend

React 19 + TypeScript + Vite, TanStack Query, Zod, ofetch, React Hook Form, React Router, Tailwind CSS 4.
Works with the Portfulio API (the backend in `portfulio-backend.zip`).

## Run it

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm run dev              # http://localhost:3000
```

Backend `.env` must have `APP_URL=http://localhost:3000` (it is the default in `.env.example`).
The login cookie is sent with `credentials: "include"`, so CORS has to allow that exact origin.

Open `http://localhost:3000/admin` and log in with the admin you created using `npm run seed` in the backend.
Start with the setup checklist on the Overview page: profile, skills, first project, experience.

## What's in it

**Public site** `/`
- Hero with your name, headline, bio, photo, resume and links
- Projects as an index list, filter by skill, full project page at `/projects/:slug`
- Skills grouped by category with level dots
- Experience timeline
- Contact form that saves to the backend

**Admin** `/admin` (ADMIN role only, lazy loaded)
- Overview with counts and a setup checklist
- Projects, Skills, Experience: add, edit, delete with confirm dialogs
- Profile: details and social links
- Messages: unread badge, read, reply by email, delete

## How the code is organised

```
src/
  lib/http.ts       ofetch client + request(schema, path): validates every response with Zod
  schemas/          Zod schemas for API responses AND for every form
  api/              TanStack Query hooks per resource (queries + mutations)
  components/       ui.tsx (buttons, fields, modal...), layouts, RequireAdmin
  pages/            Home sections, ProjectDetail, admin pages
```

- Types come from Zod (`z.infer`), so there is one source of truth for shapes.
- A failed save always shows an error toast (one handler in `main.tsx`).
- Loading, empty and error states are handled on every list.

## Build

```bash
npm run build     # type-checks, then builds to dist/
```
