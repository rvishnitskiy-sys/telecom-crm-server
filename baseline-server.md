# Telecom CRM Server — Baseline Documentation

## Overview

**Stack:** Node.js · Express 5 · PostgreSQL · JWT auth · Swagger · GraphQL
**Entry point:** `src/index.js`
**Base URL:** `http://localhost:3001`
**Port:** 3001

This is a backend-only repo. No frontend lives here. All routes except `/api/auth/login` and `/api/health` require a `Bearer <token>` header.

---

## Data Models

### Prospects
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | TEXT | required |
| segment | TEXT | e.g. "Mobile Operator" |
| country | TEXT | |
| website | TEXT | |
| created_at | TIMESTAMP | auto |

### Contacts
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | TEXT | required |
| role | TEXT | e.g. "CTO" |
| email | TEXT | |
| phone | TEXT | |
| prospect_id | FK → prospects | |
| created_at | TIMESTAMP | auto |

### Opportunities
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | TEXT | required |
| value | INTEGER | default 0 |
| stage | TEXT | default "Lead" |
| notes | TEXT | default "" |
| prospect_id | FK → prospects | |
| key_contact_id | FK → contacts | |
| created_at | TIMESTAMP | auto |

### Activities
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| opportunity_id | FK → opportunities | CASCADE delete |
| type | TEXT | enum: call, email, meeting, note |
| description | TEXT | required |
| created_at | TIMESTAMP | auto |

---

## Authentication

**File:** `src/auth/authRouter.js`, `src/auth/middleware.js`, `src/auth/config.js`

Single hard-coded admin user. Credentials stored in `.env`.

### POST `/api/auth/login`
**Body:** `{ username, password }`
**Returns:** `{ token, username }` — JWT valid for 24h
**Validation:** Both fields required. Username checked against `ADMIN_USERNAME` env var. Password checked against bcrypt hash in `ADMIN_PASSWORD_HASH` env var.

All other `/api/*` routes and `/graphql` run through `requireAuth` middleware which extracts and verifies the JWT from `Authorization: Bearer <token>`.

---

## REST API Routes

### Prospects — `src/routes/prospects.js`
All routes: `requireAuth`

| Method | Path | Validation | Notes |
|---|---|---|---|
| GET | `/api/prospects` | — | Returns all, ordered by name |
| GET | `/api/prospects/:id` | — | 404 if not found |
| POST | `/api/prospects` | `name` required | Returns created record, 201 |
| PUT | `/api/prospects/:id` | — | 404 if not found; replaces name, segment, country, website |
| DELETE | `/api/prospects/:id` | — | 404 if not found |

**Request body fields (POST/PUT):** `name`, `segment`, `country`, `website`

---

### Contacts — `src/routes/contacts.js`
All routes: `requireAuth`

| Method | Path | Validation | Notes |
|---|---|---|---|
| GET | `/api/contacts` | — | Returns all, ordered by name |
| GET | `/api/contacts/:id` | — | 404 if not found |
| POST | `/api/contacts` | `name` required | Returns created record, 201 |
| PUT | `/api/contacts/:id` | — | 404 if not found |
| DELETE | `/api/contacts/:id` | — | 404 if not found |

**Request body fields (POST/PUT):** `name`, `role`, `email`, `phone`, `prospect_id`
**Note:** No Swagger annotations on this file yet.

---

### Opportunities — `src/routes/opportunities.js`
All routes: `requireAuth`

| Method | Path | Validation | Notes |
|---|---|---|---|
| GET | `/api/opportunities` | — | Returns all, ordered by name |
| GET | `/api/opportunities/:id` | — | 404 if not found |
| POST | `/api/opportunities` | `name` required | `notes` defaults to `""` |
| PUT | `/api/opportunities/:id` | — | 404 if not found |
| DELETE | `/api/opportunities/:id` | — | 404 if not found |

**Request body fields (POST/PUT):** `name`, `value`, `stage`, `notes`, `prospect_id`, `key_contact_id`
**Note:** No Swagger annotations on this file yet.

---

### Activities — `src/routes/activities.js`
All routes: `requireAuth`. Has Swagger annotations.

| Method | Path | Validation | Notes |
|---|---|---|---|
| GET | `/api/activities?opportunity_id=X` | `opportunity_id` query param required | Returns all for that opportunity, newest first |
| POST | `/api/activities` | `opportunity_id`, `type`, `description` all required; `type` must be one of: call, email, meeting, note; parent opportunity must exist | Returns created record, 201 |

**Request body fields (POST):** `opportunity_id`, `type`, `description`

---

## GraphQL API

**Endpoint:** `POST /graphql` (auth required)
**Playground:** `GET /graphiql` (no auth)
**Files:** `src/graphql/schema.js`, `src/graphql/resolvers.js`

### Queries
| Query | Args | Returns |
|---|---|---|
| `prospects` | — | `[Prospect]` with nested contacts, opportunities |
| `prospect(id)` | `id: ID!` | `Prospect` with nested contacts, opportunities |
| `contacts` | — | `[Contact]` with nested prospect |
| `contact(id)` | `id: ID!` | `Contact` with nested prospect |
| `opportunities` | — | `[Opportunity]` with nested prospect, keyContact |
| `opportunity(id)` | `id: ID!` | `Opportunity` with nested prospect, keyContact, activities |
| `activities(opportunity_id)` | `opportunity_id: ID!` | `[Activity]` with nested opportunity |
| `activity(id)` | `id: ID!` | `Activity` with nested opportunity |

### Mutations
| Mutation | Args | Returns |
|---|---|---|
| `createProspect` | `name!`, `segment`, `country`, `website` | `Prospect` |
| `createContact` | `name!`, `role`, `email`, `phone`, `prospect_id` | `Contact` |
| `createOpportunity` | `name!`, `value`, `stage`, `prospect_id`, `key_contact_id` | `Opportunity` |
| `updateOpportunityStage` | `id!`, `stage!` | `Opportunity` |
| `saveOpportunityNotes` | `id!`, `notes!` | `Opportunity` |
| `createActivity` | `opportunity_id!`, `type!`, `description!` | `Activity` |

### Nested Resolver Fields
- `Prospect.contacts` → contacts with matching `prospect_id`
- `Prospect.opportunities` → opportunities with matching `prospect_id`
- `Contact.prospect` → parent prospect
- `Opportunity.prospect` → parent prospect
- `Opportunity.keyContact` → contact record for `key_contact_id`
- `Opportunity.activities` → activities ordered newest first
- `Activity.opportunity` → parent opportunity

---

## Shared Utilities

### Database Helper — `src/db/database.js`
Thin wrapper around the `pg` Pool. Three exports:

| Function | Description |
|---|---|
| `query(sql, params)` | Returns all rows as array |
| `queryOne(sql, params)` | Returns first row or `null` |
| `execute(sql, params)` | Returns raw `pg` result (used for DDL, DELETE) |

SSL is automatically enabled when `DATABASE_URL` contains `"railway"`.

### Auth Config — `src/auth/config.js`
Exports: `JWT_SECRET`, `JWT_EXPIRES_IN` (`"24h"`), `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` — all sourced from environment variables with fallback defaults.

---

## API Documentation

- **Swagger UI:** `http://localhost:3001/api/docs`
  - Fully annotated: Prospects, Activities
  - Not yet annotated: Contacts, Opportunities
- **Health check:** `GET /api/health` → `{ status: "ok", message: "..." }`

---

## Seed Data

On first startup (`src/db/seed.js`), if the database is empty, 4 prospects, 5 contacts, and 5 opportunities are inserted with Russian telecom company data (MTS, Beeline, Megafon, Tele2). No seed activities are created.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Signing secret for JWT tokens |
| `ADMIN_USERNAME` | Login username (default: `admin`) |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password |

---

**Note:** This is a backend-only repository. There is no React frontend, no client-side routing, and no form components here. The sections you requested about React components, frontend API calls, and frontend validation would apply to a separate frontend repository if one exists.
