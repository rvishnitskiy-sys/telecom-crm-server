# Sprint 1 Implementation Guide

This file is the authoritative reference for Claude Code when implementing
Sprint 1 stories. Read this before implementing any story. Read the story's
Technical Specification in Notion before writing any code.

---

## Environment

| What | Value |
|---|---|
| Backend URL | http://localhost:3001 |
| Frontend URL | http://localhost:5173 (Vite dev server) |
| Production backend | https://telecom-crm-server-production.up.railway.app/api |
| Frontend env var | VITE_API_URL (not REACT_APP_API_URL) |
| Auth | JWT — Bearer token in Authorization header |
| Login endpoint | POST /api/auth/login with { username, password } |
| Primary keys | SERIAL integers (not UUIDs) |

---

## Authentication

All API endpoints except `/api/auth/login` and `/api/health` require:
```
Authorization: Bearer <token>
```

Apply `requireAuth` middleware on every new route handler. Do not inline
auth logic. The middleware is at `src/auth/middleware.js`.

For Playwright tests: authenticate in `beforeAll` using
`POST /api/auth/login` with `TEST_USER` and `TEST_PASS` env vars.
Store token and set in `localStorage` via `seedAuth` helper before each test.

---

## Backend Conventions

### Response shape
```javascript
// Success
res.status(200).json({ ...fields })           // or array for list endpoints
res.status(201).json({ ...fields })           // for POST (created)
res.status(200).json({ message: "..." })      // for DELETE

// Error
res.status(400).json({ message: "..." })      // validation error
res.status(404).json({ message: "..." })      // not found
res.status(500).json({ message: "Server error" }) // server error
```

### RETURNING * pattern
All INSERT and UPDATE queries use `RETURNING *` to return the full updated
row. The returned row is normalised by the appropriate normalizeX helper
before sending to the client.

### Route file structure
One file per resource in `src/routes/`. Register all routes in `src/index.js`
alongside existing routes. Do not create new entry points.

### Database helper
All DB access via `src/db/database.js`:
```javascript
const { query, queryOne, execute } = require('../db/database');

// Returns array of rows
const rows = await query('SELECT * FROM prospects WHERE id = $1', [id]);

// Returns first row or null
const row = await queryOne('SELECT * FROM prospects WHERE id = $1', [id]);

// Returns raw pg result (use for DDL, DELETE)
await execute('DELETE FROM prospects WHERE id = $1', [id]);
```

### Validation order in route handlers
1. Validate request body fields (return 400 if invalid)
2. Verify parent resource exists where relevant (return 404 if not)
3. Execute database operation
4. Return result

### Name validation (REQ-008)
The PUT /api/contacts/:id handler must validate name server-side:
```javascript
if (!name || !name.trim()) {
  return res.status(400).json({ message: 'Name is required' });
}
```

---

## Frontend Conventions

### State-driven navigation
No React Router. Navigation is controlled by state variables in `App.jsx`:
- `selectedProspectId` (added in REQ-000) controls ProspectDetail view
- `selectedOppId` (existing) controls OpportunityDetail view
- `activeTab` controls which main tab is shown

### useCRM hook
All server-sourced data lives in `useCRM`. The hook exposes:
- `prospects`, `contacts`, `opportunities` — arrays loaded on mount
- Add methods only for operations that affect shared data (contacts, prospects)
- Notes are local state in ProspectDetail — do NOT add to useCRM

**In-place update pattern** (follow this for every useCRM update):
```javascript
// In useCRM — update a prospect in place
function updateProspect(updatedProspect) {
  setProspects(prev =>
    prev.map(p => p.id === updatedProspect.id ? updatedProspect : p)
  );
}

// In useCRM — update a contact in place (REQ-008)
function updateContact(updatedContact) {
  setContacts(prev =>
    prev.map(c => c.id === updatedContact.id ? updatedContact : c)
  );
}
```

Do NOT re-fetch the full list after a single-record update. Always replace
in-place using the object returned by RETURNING *.

### api.js
Base URL from `VITE_API_URL` env var, default `http://localhost:3001/api`.
All requests attach `Authorization: Bearer <token>` from localStorage.
401 response triggers redirect to `/` and clears credentials.

Existing functions: `get`, `post`, `put`, `del`, `prospects.*`,
`contacts.*`, `opportunities.*`, `activities.*`.

Before adding a new function, check if the existing pattern covers it.
The `del` method covers all DELETE calls. Do not duplicate.

### normalizeX helpers
Map snake_case API response fields to camelCase. All helpers live in
`src/data/api.js` or the same file as api calls.

**Current mappings:**
```javascript
// normalizeProspect
id, name, segment, country, website, createdAt (from created_at),
status, statusChangedAt (from status_changed_at),  // REQ-002
updatedAt (from updated_at),                        // REQ-005
primaryContactId (from primary_contact_id)          // REQ-004

// normalizeContact
id, name, role, email, phone, prospectId (from prospect_id), createdAt

// normalizeNote (new in REQ-001)
id, content, prospectId (from prospect_id), createdAt (from created_at)

// normalizeActivity
id, type, description, opportunityId (from opportunity_id),
createdAt (from created_at)
```

When adding a new normalizer, place it alongside the existing ones.
Use `?? null` for nullable fields.

### Timestamp formatting
**`formatTimestamp(isoString)`** in `src/utils/formatTimestamp.js`
Returns `DD MMM YYYY, HH:mm` in local browser time. Used in: REQ-002
(status changed at), REQ-005 (last updated) display in UI.

**`formatDate(isoString)`** — also in `src/utils/formatTimestamp.js`
Returns `DD MMM YYYY` — date only, no time. Used in: REQ-007 CSV export.

Both share `MONTH_NAMES` constant defined at module level.
Use `getDate/getMonth/getFullYear/getHours/getMinutes` — NOT `toLocaleString`.

### Constants
`STAGES` and `SEGMENTS` are in `src/data/defaultData.js`.
`STATUSES` was added in REQ-002: `['Prospect', 'Active', 'Client', 'Lost']`.

Import from `defaultData.js` — do not hardcode status/stage strings
in components.

### data-testid conventions
All interactive elements and state indicators must have `data-testid`.
Naming: `kebab-case`, descriptive, scoped to the feature.

**Established testids by story:**

REQ-000 ProspectDetail:
`prospect-detail`, `prospect-detail-back`, `prospect-detail-name`,
`prospect-detail-segment`, `prospect-detail-country`, `prospect-detail-website`,
`prospect-detail-contacts`, `prospect-detail-contacts-empty`,
`prospect-detail-not-found`, `prospect-contact-row`, `prospect-contact-name`,
`prospect-contact-role`, `prospect-contact-email`, `prospect-contact-phone`,
`prospect-name-link` (in ProspectsTable)

REQ-001 Notes:
`prospect-notes`, `prospect-notes-loading`, `prospect-notes-load-error`,
`prospect-notes-input`, `prospect-notes-counter`, `prospect-notes-add`,
`prospect-notes-validation`, `prospect-notes-limit`, `prospect-notes-save-error`,
`prospect-notes-empty`, `prospect-note-row`, `prospect-note-content`,
`prospect-note-timestamp`, `prospect-note-delete`, `prospect-note-delete-error`

REQ-002 Status:
`prospect-status-select`, `prospect-status-timestamp`, `prospect-status-error`,
`prospects-table-status-cell` (in ProspectsTable)

REQ-003 Search/Filter:
`prospects-search-input`, `prospects-filter-select`, `prospects-search-empty`

REQ-004 Primary Contact:
`contact-primary-badge`, `contact-set-primary-button`,
`contact-set-primary-error`

REQ-005 Last Activity:
`prospect-last-updated`

REQ-006 Notes Delete:
(uses REQ-001 testids — no new testids)

REQ-007 Export:
`prospects-export-button`

REQ-008 Contact Edit:
`contact-edit-button`, `contact-edit-name`, `contact-edit-role`,
`contact-edit-email`, `contact-edit-phone`, `contact-edit-save`,
`contact-edit-cancel`, `contact-edit-name-error`, `contact-edit-error`

---

## Database Migrations

### Migrations needed for Sprint 1
Run these in order before starting development:

```sql
-- REQ-001: prospect_notes table
CREATE TABLE prospect_notes (
  id           SERIAL PRIMARY KEY,
  prospect_id  INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  content      TEXT    NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- REQ-002: status columns on prospects
ALTER TABLE prospects
  ADD COLUMN status             VARCHAR(20) NULL,
  ADD COLUMN status_changed_at  TIMESTAMP   NULL;

-- REQ-004: primary contact FK on prospects
ALTER TABLE prospects
  ADD COLUMN primary_contact_id INTEGER NULL
  REFERENCES contacts(id) ON DELETE SET NULL;

-- REQ-005: updated_at on prospects (run steps in order)
ALTER TABLE prospects
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE prospects SET updated_at = created_at;

ALTER TABLE prospects ALTER COLUMN updated_at DROP DEFAULT;

CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $$ LANGUAGE plpgsql;

CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Migration safety notes
- REQ-001 CASCADE means deleting a prospect deletes all its notes automatically
- REQ-002 columns are nullable — existing rows get NULL (display as "Prospect")
- REQ-004 ON DELETE SET NULL means deleting a contact clears primaryContactId
- REQ-005 trigger must be created AFTER dropping the DEFAULT — order is mandatory
- The trigger function `set_updated_at` is reusable for other tables in future

---

## Implementation Order and Dependencies

Implement in this order — each story unlocks the next:

| Order | REQ | Depends on | Key work |
|---|---|---|---|
| 1 | REQ-000 | — | New ProspectDetail component, App.jsx nav state |
| 2 | REQ-001 | REQ-000 | New table, 3 endpoints, Notes section in ProspectDetail |
| 3 | REQ-002 | REQ-000 | 2 new columns, PATCH endpoint, status control |
| 4 | REQ-005 | REQ-002 | updated_at column + trigger, display field |
| 5 | REQ-006 | REQ-001 | Delete handler in ProspectDetail (spec in REQ-001) |
| 6 | REQ-003 | REQ-002 | Client-side filter in ProspectsTable only |
| 7 | REQ-004 | REQ-000 | FK column, PATCH endpoint, primary badge |
| 8 | REQ-007 | REQ-003 | exportToCsv.js utility, Export button |
| 9 | REQ-008 | REQ-000 | Inline edit form, useCRM.updateContact |

---

## Story-by-Story Key Decisions

### REQ-000 Prospect Detail View
- Frontend-only — zero API calls in ProspectDetail
- Prospect and contacts passed as props from App.jsx (already in useCRM)
- Contacts filtered client-side: `contacts.filter(c => c.prospectId === id)`
- Not-found guard: if `prospect === undefined`, render not-found message + Back
- `prospect-name-link` in ProspectsTable must be `<button>` not `<a>`

### REQ-001 Prospect Quick Notes
- Notes fetch on ProspectDetail mount: `GET /api/prospects/:id/notes`
- Notes are local state in ProspectDetail — NOT in useCRM
- Add note: prepend returned note to local notes array (maintains reverse order)
- Delete note: filter by id from local notes array on 200 response
- Character limit is soft — typing continues past 2000, saving is blocked
- `disabled` on Add Note: `noteInput.trim().length === 0 || noteInput.length > 2000`

### REQ-002 Prospect Status Management
- NULL in DB = "never set" — display as "Prospect", timestamp as "Status not yet set"
- Same-status guard is server-side (returns 200 with no change if same value)
- PATCH returns RETURNING * — includes updated_at after REQ-005 trigger is added
- useCRM in-place update on PATCH success
- `settingPrimary` disables dropdown during request

### REQ-003 Prospect Search and Filter
- Pure client-side — zero API calls on search/filter
- Local state in ProspectsTable: `searchTerm` and `statusFilter`
- Filtering logic (implement verbatim):
```javascript
const filtered = prospects.filter(p => {
  const name   = (p.name || '').toLowerCase();
  const term   = searchTerm.trim().toLowerCase();
  const status = p.status ?? 'Prospect';
  const nameMatch   = term === '' || name.includes(term);
  const statusMatch = statusFilter === 'All' || status === statusFilter;
  return nameMatch && statusMatch;
});
```
- Two empty states: search empty (`prospects-search-empty`) vs no data loaded
- No debounce — every keystroke triggers synchronous filter
- Placeholder must use ellipsis character `…` not three dots `...`

### REQ-004 Primary Contact Flag
- FK on prospects: `primary_contact_id INTEGER NULL REFERENCES contacts(id) ON DELETE SET NULL`
- isPrimary derived per row: `contact.id === prospect.primaryContactId`
- PATCH endpoint: `PATCH /api/prospects/:id/primary-contact` with `{ contactId }`
- Single SQL UPDATE — atomically replaces previous primary
- Validate server-side that contactId belongs to this prospect (400 if not)
- Section-level error (not per-row) — one `setPrimaryError` string state
- All set-primary buttons disabled via single `settingPrimary` boolean

### REQ-005 Prospect Last Activity
- Migration step order is mandatory — see Migrations section above
- `formatDate` added to `src/utils/formatTimestamp.js` — date only, no time
- `updatedAt` added to `normalizeProspect`
- REQ-002 PATCH already returns RETURNING * which includes updated_at after trigger
- No additional frontend logic needed for AC-5 — useCRM in-place update propagates it

### REQ-006 Prospect Notes Delete
- Follows REQ-001 Tech Spec exactly — no deviations
- Confirmed deletion (not optimistic) — remove from local state only on 200
- `deletingNoteId` (number | null) — disables only the in-flight note's button
- `deleteNoteError` (number | null) — scoped to the specific note row by id
- Reset `deleteNoteError = null` at start of any new delete attempt

### REQ-007 Prospect Export to CSV
- Export utility: `src/utils/exportToCsv.js` — one public function
- Receives `filtered` array from ProspectsTable (not full useCRM array)
- RFC 4180 quoting — wrap in `"` if field contains `,`, `"`, or `\n`
- Escape embedded quotes by doubling: `str.replaceAll('"', '""')`
- Prepend UTF-8 BOM `\uFEFF` for Excel compatibility
- Row separator: `\r\n` (CRLF per RFC 4180)
- Download via transient `<a download="prospects.csv">` — do NOT append to DOM
- Revoke object URL immediately after `.click()`
- `escapeField` simplification (fix redundant null check):
```javascript
function escapeField(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replaceAll('"', '""') + '"';
  }
  return str;
}
```

### REQ-008 Contact Details Edit
- PUT /api/contacts/:id already exists — add server-side name validation only
- Local state in ProspectDetail:
  - `editingContactId` (number | null) — which contact is in edit mode
  - `editFormValues` ({ name, role, email, phone } | null) — in-progress values
  - `savingContact` (boolean) — disables both Save and Cancel
  - `nameError` (boolean) — controls name validation message
  - `saveError` (boolean) — controls save failure message
- Switching contacts: `handleEditContact` sets `editingContactId` to new ID —
  previous form's values are automatically discarded (atomic state replacement)
- `prospect_id` must be passed unchanged in PUT body (required by existing endpoint)
- useCRM.updateContact added — follows identical pattern to useCRM prospect update
- nameError resets on name input `onChange`
- saveError resets at start of `handleSaveContact` and `handleEditContact`

---

## Playwright Test Setup

All test files in `/e2e/`. Auth pattern for every test file:

```typescript
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
const API_URL  = BASE_URL.replace('5173', '3001');

let token: string;

test.beforeAll(async () => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.TEST_USER,
      password: process.env.TEST_PASS,
    }),
  });
  const data = await res.json();
  token = data.token;
});

async function seedAuth(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.evaluate((t) => localStorage.setItem('token', t), token);
  await page.reload();
}
```

All tests annotated with `@REQ-XXX` in the test name string.
Use `data-testid` selectors only — never CSS classes or element types.

---

## Before You Start Each Story

1. Read CLAUDE.md in this repo
2. Read baseline-server.md or baseline-react.md (whichever applies)
3. Open the story's Technical Specification in Notion (Telecom CRM Pilot /
   Tech Specs / [REQ-XXX] [Title] — Technical Specification)
4. Check the implementation order — verify all dependencies are implemented
5. Run the migration if the story requires it
6. Implement server changes first, then frontend, then complete Playwright stubs
7. Verify locally before opening a PR
