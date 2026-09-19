# Bluestock IPO Web App - MERN

This repository implements the supplied Bluestock IPO project document as a MERN application. The source document describes an IPO information platform with public browsing, admin CRUD, company logos, RHP/DRHP documents, search/filter/sort, pagination, authentication, and REST APIs. The original document names Django/PostgreSQL; this implementation follows the requested React, Node/Express, MongoDB stack.

## Current Status

Phase 1 is complete and Phase 2's first vertical slice is implemented:

- React + Vite + TypeScript client in `apps/web`
- Express + TypeScript API in `apps/api`
- `GET /api/v1/health` runtime check
- Workspace build scripts and environment template
- Initial responsive foundation screen for the implementation roadmap
- Mongoose Company and IPO schemas with indexes
- Public IPO list/detail API with search, status filtering, sorting, and pagination
- Deterministic fallback seed records for local development without MongoDB credentials
- Derived `listingGain` and `currentReturn` values in the API response

## Run Locally

```powershell
npm install
npm --prefix apps/web install
npm --prefix apps/api install
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:11000`.

## Code Quality Commands

```powershell
npm run format       # format supported source and documentation files
npm run format:check # verify formatting without changing files
npm run lint         # run ESLint across both apps
npm run lint:fix     # apply automatic ESLint fixes
npm run check        # format check, lint, and production build
```

Formatting is shared through `.prettierrc`; linting is shared through `eslint.config.js` and covers TypeScript, React, and Node code in both applications.

For the API only:

```powershell
npm --prefix apps/api run dev
Invoke-RestMethod http://localhost:11000/api/v1/health
Invoke-RestMethod 'http://localhost:11000/api/v1/ipos?status=listed&limit=10'
Invoke-RestMethod http://localhost:11000/api/v1/ipos/seed-orbit-fintech
```

Copy `apps/api/.env.example` to `apps/api/.env` before adding MongoDB, JWT, and storage credentials. Secrets must not be committed.

## Phased Implementation

1. **Foundation:** Express app, security middleware, environment validation, health route, React shell.
2. **IPO domain:** Mongoose Company/IPO models, indexes, deterministic seed data, list/detail API, search/filter/sort/pagination, derived listing gain and current return. Initial public slice is implemented; Mongo-backed persistence and seed command remain next.
3. **Authentication:** Admin user model, bcrypt password hashing, JWT access/refresh flow, protected routes, role checks.
4. **Admin workflow:** Figma-aligned dashboard, IPO create/edit/delete, confirmation states, validation, and error handling.
5. **Media:** Logo and RHP/DRHP uploads with MIME/size validation and cloud object storage metadata.
6. **Quality and release:** Swagger/OpenAPI, API/UI tests, accessibility, CI, deployment, and production CORS configuration.

## Architecture Direction

Public reads remain accessible through versioned endpoints such as `/api/v1/ipos`; admin mutations are protected by authentication and authorization middleware. MongoDB references preserve the document's Company -> IPO -> Documents boundaries without forcing unrelated data into one large record. Listing gain and current return should be derived in the service/serializer layer so persisted metrics cannot become stale.

## Validation

The current implementation has been verified with `npm run check`, a live health request, and live IPO list/detail requests including filtering and derived return calculations.
