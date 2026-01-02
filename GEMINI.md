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
We use **Composite Foreign Keys** to prevent "Organization Drift".
- `Encounter(orgId, patientId)` -> `Patient(orgId, id)`
- **Immutability:** Updates to `patientId` on existing encounters are blocked by DB security policy.

## 3. Multi-Tenancy & Identity
The application is **Organization-centric** but supports **User Portability**.

### Context Resolution
- **`getOrganizationContext()`**:
  1. Checks `injexpro_org_id` cookie for user preference.
  2. Fallbacks to the first active membership.
  3. Returns `null` if no membership exists.
- **Middleware/Layout:** `DashboardLayout` enforces existence of Org Context. Redirects to `/onboarding` if missing.

### Onboarding & Switching
- **Zero-State:** Users without an organization are routed to `/onboarding`.
- **Switching:** Sidebar contains an Organization Switcher. Selection persists via cookies.
- **Invites:** `CLINIC_ADMIN` can generate invite links (7-day expiry). New users land on `/invite/accept`.

### RBAC (Role-Based Access Control)
Enforced via `requirePermission()` helper in Server Actions.
- **`OWNER`**: Org Settings, Billing.
- **`CLINIC_ADMIN`**: Manage Team, Invites.
- **`PROVIDER`**: Write/Delete Clinical Data.
- **`ASSISTANT`**: Write Clinical Data (No Delete).
- **`READONLY`**: View Only.

## 4. Clinical Workflow & Data Integrity

### Encounter Lifecycle
1.  **Draft:** Default state. Editable by Providers/Assistants.
2.  **Signed:** Finalized state.
    -   **Backend:** Updates blocked via `updateTreatment` action guard.
    -   **Frontend:** Form becomes Read-Only.
    -   **Re-open:** Requires explicit "Unlock" action (Audit logged).
3.  **Void:** Soft-delete state (Audit trail preserved).

### Treatment Recording (RecordForm)
- **Smart Templates:** Dedicated "Load PREMPT" functionality.
- **History Copying:** "Copy last visit" feature.
- **Bulk Actions:** Table supports multi-select for "Bulk Sign" and "Bulk Delete".
- **Safety:** Critical actions (Sign, Delete, Re-open) are protected by confirmation dialogs.

## 5. Key Directories
- `src/generated/client`: Prisma Client (Custom output).
- `src/lib/auth-context.ts`: Security helpers (`getUserContext`, `getOrganizationContext`).
- `src/lib/permissions.ts`: RBAC definitions and guards.
- `src/app/actions`: Global/Shared actions (e.g., `org-switching.ts`).
- `src/app/(dashboard)/settings`: Settings pages (Profile, Org, Team).
- `src/app/(dashboard)/treatments/status-actions.ts`: Workflow transitions.

## 6. Future Roadmap
- **Product Features:** Dose Calculation/Smart Defaults.
- **Ops:** Azure App Service Deployment & CI/CD.
- **Compliance:** PHI Code Separation (Physical directory isolation).
