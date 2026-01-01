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

### Seeding (Reference Data)
Muscles and Regions must be populated for the dropdowns to work.
The seed script is configured in `prisma.config.ts`.

```bash
npx prisma db seed
```

### Server Actions & Error Handling
- **No Redirect Throws:** Do NOT `throw redirect()` inside a `try/catch` block in client components. Instead, return a plain object `{ success: true, ... }` or `{ error: "message" }`.
- **Decimal Serialization:** Prisma `Decimal` types are NOT serializable to Client Components. You MUST convert them to `number` or `string` in the Server Action before returning.
  ```typescript
  // Example mapping in Server Action
  return {
    ...data,
    units: data.units.toNumber()
  }
  ```
## 5. Key Directories
- `src/generated/client`: **Important!** The Prisma Client is generated here, NOT in `node_modules`. Import from `@/generated/client/client`.
- `src/lib/prisma.ts`: Singleton PrismaClient instance.
- `src/lib/auth-context.ts`: Security helpers (`getUserContext`, `getOrganizationContext`).
- `prisma/schema.prisma`: The source of truth.
- `prisma/migrations`: Versioned SQL migrations.

## 6. Features & UI Components

### Treatment Recording (RecordForm)

- **Smart Templates:** Dedicated "Load PREMPT" functionality for headache protocols, populating 13 standard injection sites including M. occipitalis and M. paraspinalis (cervical).

- **History Copying:** "Copy last visit" feature that intelligently maps previous treatment data (Toxin, Indication, Muscles, Dosages) to the current form, bypassing empty-field restrictions.

- **Auto-Drafting:** Automatic persistence of form state to local storage to prevent data loss during long clinical documentation sessions.

- **Cross-Schema Integration:** Seamlessly links clinical data (`public` schema) with PHI (`phi` schema) during patient creation.

### Data Integrity & Validation

- **Organizational Isolation:** All queries and mutations are gated by `organizationId` at the database level via Row-Level constraints and Server Action context validation.

- **Client-Side Feedback:** Server Action errors (e.g., zero-unit validation) are returned as structured objects and displayed via `sonner` toasts for better user experience.

- **PII Protection:** Integrated validation tools to detect and warn about potential PII in free-text fields.