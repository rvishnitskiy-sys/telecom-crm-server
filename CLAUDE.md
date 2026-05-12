\# Telecom CRM — Server

\## Baseline documentation
Read baseline-server.md before making any changes. It describes the current data model, all existing API endpoints, auth setup, and database helper patterns.

\## Project overview

B2B telecom CRM backend. Node.js/Express REST API. PostgreSQL database.

Manages Prospects (companies), Contacts, and Opportunities.



\## File structure

\- Routes in /routes — one file per resource

\- Database queries in /db — one file per resource

\- Entry point: server.js or app.js



\## Coding standards

\- Validate all request bodies before database operations

\- Return { data: ... } for success, { error: 'message' } for failures

\- Status codes: 200 success, 201 created, 400 validation,

&#x20; 404 not found, 500 server error

\- Always verify parent resource exists before operating on child resources

\- Use async/await — no raw promise chains



\## Test requirements

\- Annotate all tests with @REQ-XXX matching the requirement covered

\- Test files in /tests directory, named <resource>.test.js

\- Coverage target: all acceptance criteria covered

