# The Chikkamagaluru Escape — Travel Management System

A MERN-stack travel management system for Chikkamagaluru (Karnataka). Plan trips,
pick destinations, set a budget, and generate printable booking receipts.

## Stack

- **Frontend:** React 18 (Vite), React Router, Bootstrap 5, Axios
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Auth:** bcryptjs (password hashing) + JWT

## Project structure

```
tourism/
├─ client/                 # React app (Vite)
│  ├─ public/images/       # reused destination images
│  └─ src/
│     ├─ components/       # Navbar, PlaceCard, ProtectedRoute, Toast
│     ├─ pages/            # Login, Register, Home, Places, PlaceDetail,
│     │                    # Plan, Checkout, Receipt, Dashboard
│     ├─ context/          # AuthContext, TripContext
│     ├─ services/         # api.js (axios), format.js
│     └─ styles/style.css  # ported from the original static site
├─ server/                 # Express + Mongoose API
│  ├─ controllers/  routes/  models/  middleware/  config/
│  ├─ seed.js        # seeds the 3 destinations
│  └─ tests/         # API tests (Jest + Supertest)
├─ legacy/                 # original static website, preserved untouched
└─ package.json            # root convenience scripts (concurrently)
```

## Prerequisites

- Node.js 18+ (tested on 24)
- A running MongoDB instance (default: `mongodb://127.0.0.1:27017`)

## Setup

```bash
# 1. Install root tools + both apps
npm run install:all        # runs client + server installs

# 2. Configure backend environment
cd server
copy .env.example .env     # Windows
# edit .env (MONGO_URI, JWT_SECRET)

# 3. Seed the database with the 3 destinations
npm run seed

# 4. Run both apps together (from repo root)
npm run dev                # API :5000 + Vite :5173
```

Open http://localhost:5173 — register an account, then build and book a trip.

## Environment variables (`server/.env`)

| Variable       | Example                                        | Purpose                          |
| -------------- | ---------------------------------------------- | -------------------------------- |
| `PORT`         | `5000`                                         | Express port                     |
| `MONGO_URI`    | `mongodb://127.0.0.1:27017/chikkamagaluru_tourism` | MongoDB connection string        |
| `JWT_SECRET`   | any long random string                         | Token signing secret              |
| `JWT_EXPIRES_IN` | `7d`                                         | Token lifetime                    |
| `CLIENT_ORIGIN` | `http://localhost:5173`                      | CORS allowlist (comma-separated)  |

Optional `client/.env`: `VITE_API_URL` (defaults to the Vite `/api` proxy, so you
usually do not need this).

## Commands

| Command                        | Action                                        |
| ------------------------------ | --------------------------------------------- |
| `npm run dev` (root)           | Run API + Vite together                       |
| `npm run test` (root)          | Run backend API tests                         |
| `npm run seed` (root)          | Seed destinations                             |
| `npm run build` (root)         | Build the React app to `client/dist`          |
| `npm start` (`server/`)        | Serve API only                                |
| `npm run dev` (`server/`)      | API with auto-reload (nodemon)                |

The Express server also serves `client/dist` in production, so `npm run build`
followed by `npm start` in `server/` serves the whole app on one port.

## API overview

Public: `POST /api/auth/register`, `POST /api/auth/login`,
`GET /api/destinations?search=&category=&minPrice=&maxPrice=&maxDistance=&sort=`

Protected (JWT required): `GET /api/auth/me`, trips CRUD + add/remove destinations,
`POST /api/bookings`, list/get bookings. Users can only access their own trips and
bookings.

## Tests

`server/tests/api.test.js` covers 17 scenarios: registration, duplicate/invalid
input handling, login, hashed passwords, destination listing/search/filtering,
trip build + totals + budget, cross-user access denial (403), empty-trip booking
rejection, invalid booking input, and unauthorized access (401).

## Notes

- The original static site is preserved in `legacy/` (unmodified).
- `server/.env` and `client/.env` are git-ignored — never commit real secrets.
- MongoDB seed database `chikkamagaluru_tourism`; automated tests use
  `chikkamagaluru_tourism_test` (`TEST_MONGO_URI` overrides).
- Ported `style.css` from the legacy site, fixing the previously broken
  `../images/...` asset paths.