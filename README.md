# Pet Care Log

Pet Care Log is a responsive full-stack web application for recording pet profiles, everyday care activities, and health records such as vaccinations and veterinary visits.

## Problem and objectives

Pet owners can forget important dates and routine care tasks. This project keeps pet details, care logs, and upcoming health dates in one dashboard.

### Features
- Create, read, update, and delete pet profiles.
- Record feeding, walks, exercise, grooming, playtime, and other care activities.
- Store vaccinations, vet visits, medication, dental care, and next due dates.
- View upcoming health dates on the dashboard.
- Responsive layout and form validation.
- PostgreSQL persistence through Supabase.

## Technology
- HTML5, CSS3, Vanilla JavaScript
- Node.js and Express.js
- Supabase PostgreSQL
- Git and GitHub

## Folder structure

```text
pet-care-log/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── routes/
│   │   ├── pets.js
│   │   ├── careLogs.js
│   │   └── healthRecords.js
│   ├── utils/
│   │   └── validation.js
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## Prerequisites

Install:
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js LTS (includes npm)](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- A free [Supabase](https://supabase.com/) account

Verify Node/npm and Git in a terminal:
```bash
node --version
npm --version
git --version
```

## Setup

1. Download or clone this project and open the `pet-care-log` folder in VS Code.
2. Open a terminal in VS Code using **Terminal → New Terminal**.
3. Create a Supabase project at https://supabase.com/.
4. In the Supabase dashboard, open **SQL Editor → New query**. Copy all of `database/schema.sql`, run it, then check **Table Editor** for `pets`, `care_logs`, and `health_records`.
5. In Supabase project settings, find the project URL and server-side service-role/secret key. Use the server-side key only in your local backend environment. Never put it in frontend files or GitHub.
6. Copy `backend/.env.example` to `backend/.env`, then replace the example values:
   ```env
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SIDE_SERVICE_ROLE_KEY
   ```
   `.env.example` documents variable names and safe placeholders. `.env` contains your local credentials and must not be committed.
7. Install dependencies from the backend directory:
   ```bash
   cd backend
   npm install
   ```
8. Start the application from `backend/`:
   ```bash
   npm start
   ```
   The terminal should show `Pet Care Log is running at http://localhost:3000`.
9. Open http://localhost:3000 in your browser. Add a pet, then try a care activity and a health record.
10. Check the database connection at http://localhost:3000/api/health. A successful response resembles `{"status":"ok","database":"connected"}`.

For development with automatic server restarts, use `npm run dev` from `backend/`.

## Architecture

The browser loads the HTML, CSS, and JavaScript from Express. Browser `fetch()` calls send JSON to Express REST endpoints. Express validates input and uses the server-side Supabase client to read or write PostgreSQL. The privileged key is never sent to the browser.

This academic MVP does not implement user accounts. It is intended for a local classroom demonstration, not deployment with real private pet or owner data. Before public deployment, add authentication and per-user ownership authorization, rate limiting, and production security review.

## REST API

All responses containing records use `{ "data": ... }`. Errors use `{ "error": "message" }`.

| Method | Path | Purpose | Body |
|---|---|---|---|
| GET | `/api/health` | Check server/database | None |
| GET | `/api/pets` | List pet profiles | None |
| POST | `/api/pets` | Create pet | `name`, `species`, optional `breed`, `birth_date`, `weight_kg`, `notes` |
| PUT | `/api/pets/:id` | Update pet | Same fields as create |
| DELETE | `/api/pets/:id` | Delete pet and related logs | None |
| GET | `/api/care-logs` | List care activities | None |
| POST | `/api/care-logs` | Create activity | `pet_id`, `activity_type`, `activity_date`, optional `notes` |
| DELETE | `/api/care-logs/:id` | Delete activity | None |
| GET | `/api/health-records` | List health records | None |
| POST | `/api/health-records` | Create health record | `pet_id`, `record_type`, `record_date`, optional `next_due_date`, `notes` |
| DELETE | `/api/health-records/:id` | Delete health record | None |

This MVP has no authentication, so there are no authenticated roles. Do not expose the server publicly as-is.

## Manual testing checklist

1. Open the dashboard: totals should load from the database.
2. Add a pet with a name and species: it should appear as a card and in Supabase.
3. Edit the pet name or details: the card should update.
4. Submit an empty pet name: validation should reject it.
5. Add a care activity: it should appear in Care log and persist after refresh.
6. Add a health record with a next due date: it should appear in Health records and Upcoming care.
7. Try a next due date earlier than the record date: it should be rejected.
8. Delete a care activity or health record after confirmation: it should disappear.
9. Delete a pet after confirmation: the database cascades deletion to that pet's related records.
10. Resize the browser to mobile width: navigation, cards, forms, and tables should remain usable.
11. Stop the server and refresh: the browser should show an error instead of pretending data loaded.
12. Visit `/api/health`: verify the response reports a database connection.

## Troubleshooting

- **Supabase is not configured:** make sure `backend/.env` exists and variable names are exact. Restart the server after editing it.
- **Database error:** run `database/schema.sql` in the correct Supabase project and check the project URL/key.
- **Cannot find module:** run `npm install` from `backend/`.
- **Port already in use:** change `PORT` in `backend/.env` to `3001` and open `http://localhost:3001`.
- **Page not found:** open the root URL `http://localhost:3000`, not a local file path.
- **Records do not load:** check the backend terminal for errors and visit `/api/health`.

## GitHub upload

Run these commands from the project root (`pet-care-log/`):

```bash
git init
git status
git add .
git status
git commit -m "Build Pet Care Log"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Create an empty repository on https://github.com/ and replace `YOUR_GITHUB_REPOSITORY_URL` with its actual URL. Check `git status` before committing. Confirm `backend/.env`, `node_modules/`, passwords, keys, and private data are not staged. `.env.example` should be committed; real `.env` must not be. `.gitignore` cannot remove a secret that was already committed. If a credential is exposed, rotate it immediately and remove it from repository history as needed.

## Limitations and future improvements

- No user login or multi-owner privacy controls in this classroom MVP.
- Reminders appear in the dashboard; the app does not send push notifications or emails.
- Possible improvements: Supabase Auth, owner-specific records and RLS policies, search/filtering, image uploads, appointment management, and automated tests.
# Pet-care-log
# Pet-care-log
