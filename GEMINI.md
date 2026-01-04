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
- **Add Team:** Existing users can create additional organizations via `/onboarding`.
- **Switching:** Sidebar contains an Organization Switcher. Selection persists via cookies. Automatic switch occurs after organization creation or invite acceptance.
- **Invites:** `CLINIC_ADMIN` can generate invite links. New users land on `/invite/accept`. Features "Email Mismatch" warning for security transparency.

### RBAC (Role-Based Access Control)
- **Backend:** Enforced via `requirePermission()` helper in Server Actions.
- **Frontend:** Components are permission-aware.
  - `AppSidebar`: Hides restricted navigation items (e.g., Settings).
  - `RecordForm`: Disables fields and hides write actions for `READONLY` users.
- **Isomorphic Logic:** `src/lib/permissions.ts` provides the source of truth for both layers.

## 4. Clinical Workflow & Data Integrity

### Encounter Lifecycle
1.  **Draft:** Default state. Editable by Providers/Assistants. Features **Unsaved Changes** indicator.
2.  **Signed:** Finalized state.
    -   **Backend:** Updates blocked via `updateTreatment` action guard.
    -   **Frontend:** Form becomes Read-Only.
    -   **Re-open:** Requires explicit "Unlock" action (Audit logged with mandatory reason).
3.  **Void:** Soft-delete state (Audit trail preserved).

### Treatment Recording (RecordForm)
- **Smart Templates:** Dedicated "Load PREMPT" functionality.
- **History Copying:** "Copy last visit" feature.
- **Autosave:** Drafts are saved to `localStorage` for new records.
- **Safety:** Critical actions (Sign, Delete, Re-open) are protected by confirmation dialogs.

## 5. Key Directories
- `src/generated/client`: Prisma Client (Custom output). Use `.../enums` for client-side role imports.
- `src/lib/auth-context.ts`: Security helpers (`getUserContext`, `getOrganizationContext`).
- `src/lib/permissions.ts`: RBAC definitions and guards.
- `src/app/actions`: Global/Shared actions (e.g., `org-switching.ts`).
- `src/app/(dashboard)/settings`: Settings pages (Profile, Org, Team).
- `src/app/(dashboard)/treatments/status-actions.ts`: Workflow transitions.

## 6. Roadmap & Follow-up Actions

### Phase 3: Scaling & Compliance (Current Focus)
- [x] **PHI Code Separation:** Isolated all code touching the `phi` schema into `src/phi/*` with strict data extraction helpers and fragment-based joins.
- [x] **Audit UI:** Built a dedicated view for `CLINIC_ADMIN` to browse audit logs, integrated into Organization Settings.
- [x] **Containerization:** Added production-ready `Dockerfile` using multi-stage builds and Next.js standalone output.
- [ ] **Infrastructure as Code:** Prepare Azure App Service deployment templates (Bicep/Terraform).
- [x] **Regional Split (Base):** Added `src/lib/region.ts` to handle environment-based region awareness (EU/US) for future data residency enforcement.

### Future Features
- [ ] **Dose Calculation:** Automatic calculation based on dilution and units.
- [ ] **Smart Defaults:** Learning-based suggestions for injection patterns.