# GS Hotel

A hotel booking platform with three separate frontends — **User**, **Admin**, and **Controller**
— sharing one backend and one database.

```
┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
│  User Frontend │  │  Admin Frontend │  │  Controller Frontend │
│   (React/Vite) │  │   (React/Vite)  │  │     (React/Vite)     │
└───────┬────────┘  └────────┬────────┘  └──────────┬───────────┘
        │                    │                       │
        └────────────────────┼───────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Shared Backend   │
                    │  (Node + Express)  │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │     PostgreSQL     │
                    └────────────────────┘
```

## What's in each piece

- **backend/** — Express REST API, the only thing that touches the database. All three
  frontends call this over HTTP.
- **user-frontend/** — the public-facing hotel site: Home, About, Services (rooms, drinks,
  food), News & Updates, Contact, Profile. Each tab is its own route/page.
- **admin-frontend/** — internal dashboard for hotel staff: manage rooms, see in-house guests,
  process orders, respond to feedback, post news. Price changes and new/removed rooms are
  submitted for controller approval rather than applied directly.
- **controller-frontend/** — internal dashboard for the controller role: approve or reject
  the admin's pending requests, see room occupancy, and view revenue/traffic reports.

All three frontends are independent React apps with their own `package.json` — they only
share data through the backend's API, never through code.

## Local development

You'll need Node.js 18+ and a PostgreSQL database (local or hosted).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your local Postgres credentials, or set DATABASE_URL directly
npm run migrate   # creates tables
npm run seed      # optional: adds sample rooms, services, news
npm run dev        # starts on http://localhost:4000
```

### 2. Frontends

Each frontend runs independently. In separate terminals:

```bash
cd user-frontend && npm install && cp .env.example .env && npm run dev   # http://localhost:5173
cd admin-frontend && npm install && cp .env.example .env && npm run dev  # http://localhost:5174
cd controller-frontend && npm install && cp .env.example .env && npm run dev  # http://localhost:5175
```

Each `.env` points `VITE_API_URL` at your backend (`http://localhost:4000` by default).

## Deploying to Render

This repo includes a `render.yaml` Blueprint that provisions everything in one go:

1. Push this folder to a GitHub repository.
2. In the Render dashboard, choose **New > Blueprint** and point it at your repo.
3. Render will create:
   - A free PostgreSQL database (`gs-hotel-db`)
   - The backend as a Web Service (`gs-hotel-backend`)
   - Three Static Sites: `gs-hotel-user`, `gs-hotel-admin`, `gs-hotel-controller`
4. After the first deploy, open the backend's **Shell** tab in Render and run:
   ```bash
   npm run migrate
   npm run seed   # optional
   ```
5. If your service URLs differ from the defaults in `render.yaml` (Render appends a random
   suffix in some cases), update:
   - `ALLOWED_ORIGINS` on `gs-hotel-backend` to match your actual frontend URLs
   - `VITE_API_URL` on each frontend to match your actual backend URL
   then trigger a redeploy of the affected services.

### Why PostgreSQL

Render's free tier includes managed PostgreSQL out of the box, with no managed MongoDB
option — so Postgres is the simpler path to a fully-hosted, no-extra-cost setup.

## Notes on the approval workflow

Per the project brief: the **Admin** can manage rooms and see all activity, but cannot
directly change a room's price or add/remove rooms. Those actions go into a pending queue
(`approval_requests` table) that only the **Controller** can approve or reject. Once
approved, the change applies immediately on the live site.

## Authentication

For now, guests are identified by phone number (an ID is generated automatically, e.g.
`GS-0001`). Creating a full account with email/password or Google sign-in is optional and
stubbed for future upgrade — see `backend/src/routes/customers.js`.
