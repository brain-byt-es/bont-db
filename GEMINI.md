# InjexPro Developer & Architecture Guide

## 1. Core Architecture
- **Framework:** Next.js 15 (App Router)
- **Database:** Azure PostgreSQL Flexible Server (France Central)
- **ORM:** Prisma 7 (Multi-schema: `public` + `phi`)
- **Authentication:** NextAuth.js (Auth.js) v5
  - Providers: Azure AD, Google, LinkedIn
  - Adapter: Prisma Adapter (Custom mapping to `User` / `UserIdentity`)
  - **Linking:** Implicit linking via email + explicit linking via Profile Settings.
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

## 3. Multi-Tenancy & Identity
The application is **Organization-centric** but supports **User Portability**.

### Context Resolution
- **`getOrganizationContext()`**:
  1. Checks `injexpro_org_id` cookie for user preference.
  2. Fallbacks to the first active membership.
  3. Returns `null` if no membership exists.
- **Middleware/Layout:** `DashboardLayout` enforces existence of Org Context. Redirects to `/onboarding` if missing.

### Onboarding & Switching
- **Zero-State:** Users without an organization are routed to `/onboarding` to create their first clinic.
- **Switching:** Sidebar contains an Organization Switcher. Selection persists via cookies.
- **Invites:** `CLINIC_ADMIN` can generate invite links (7-day expiry). New users land on `/invite/accept`.

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
- **Updates & Transactions:** Use `$transaction` for complex updates (e.g., `updateTreatment`) to ensure atomic replacement of nested relations like `Injections` and `Assessments`.

## 5. Key Directories
- `src/generated/client`: **Important!** The Prisma Client is generated here, NOT in `node_modules`. Import from `@/generated/client/client`.
- `src/lib/auth-context.ts`: Security helpers (`getUserContext`, `getOrganizationContext`).
- `src/app/actions`: Global/Shared actions (e.g., `org-switching.ts`).
- `src/app/(dashboard)/settings`: Settings pages (Profile, Org, Team).
- `src/components/app-sidebar.tsx`: Main navigation + Org Switcher.

## 6. Features & UI Components

### Treatment Recording (RecordForm)
- **Smart Templates:** Dedicated "Load PREMPT" functionality for headache protocols.
- **History Copying:** "Copy last visit" feature maps previous treatment data.
- **Assessment Management:** Integrated `AssessmentManager` for clinical scores.
- **Auto-Drafting:** Automatic persistence to local storage.

### Team Management
- **Invite Flow:** Link-based invitations.
- **Members:** List view with Role badges.
- **Profile:** Provider linking (Google/Microsoft) UI.

### Data Integrity & Validation
- **Organizational Isolation:** All queries and mutations are gated by `organizationId`.
- **PII Protection:** Integrated validation tools to detect PII in free-text fields.

### UI Polishing (Jan 2026)
- **Sidebar:** Dynamic Organization Header with Initials Icon.
- **Settings:** Tabbed interface for better UX.
- **Dashboard:** Semantic feedback colors (Green/Amber/Rose).