# InjexPro Developer & Architecture Guide

## 1. Core Architecture
- **Framework:** Next.js 15 (App Router)
- **Database:** Azure PostgreSQL Flexible Server (France Central)
- **ORM:** Prisma 7 (Multi-schema: `public` + `phi`)
- **Authentication:** NextAuth.js (Auth.js) v5
  - Providers: Azure AD, Google, LinkedIn
  - Adapter: Prisma Adapter (Custom mapping to `User` / `UserIdentity`)
- **UI:** Tailwind CSS + Shadcn/UI

## 2. Database Schema & Security
The database is strictly partitioned for PHI (Protected Health Information) compliance.

### Schemas
- **`public`**: Contains strictly non-PHI data (Organizations, Users, Encounters, Injections).
- **`phi`**: Contains sensitive patient identifiers (`PatientIdentifier`).
- **Access Control:**
  - `migrator_admin`: Owner of schemas, runs DDL.
  - `runtime_user`: Application user, limited to DML.
  - `reporting_ro`: Read-only reporting user (NO ACCESS to `phi` schema).

### Operational Hardening
We use **Composite Foreign Keys** to prevent "Organization Drift" (e.g., ensuring a Patient never accidentally gets linked to an Encounter from a different Org).
- `Encounter(orgId, patientId)` -> `Patient(orgId, id)`
- `Injection(orgId, encounterId)` -> `Encounter(orgId, id)`

## 3. Multi-Tenancy
The application is **Organization-centric**.
- Users belong to an `Organization` via `OrganizationMembership`.
- All data queries MUST filter by `organizationId`.
- **Helper:** Use `getOrganizationContext()` in Server Actions to securely retrieve the current user's active organization.

## 4. Development Workflow

### Database Migrations
**DO NOT** run `prisma migrate dev` with your personal DB user.
Use the dedicated `migrator_admin` connection string.

```bash
# Apply migrations
npx prisma migrate dev
```

### Server Actions
All data mutations happen via Server Actions in `src/app/**/actions.ts`.
- ALWAYS verify `organizationId` context.
- Use `prisma.$transaction` for multi-table writes (e.g., Encounter + Injections).

## 5. Key Directories
- `src/lib/prisma.ts`: Singleton PrismaClient instance.
- `src/lib/auth-context.ts`: Security helpers (`getUserContext`, `getOrganizationContext`).
- `prisma/schema.prisma`: The source of truth.
- `prisma/migrations`: Versioned SQL migrations.
