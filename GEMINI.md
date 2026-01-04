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
- **`public`**: Contains strictly non-PHI data (Organizations, Users, Encounters, Injections, Preferences).
- **`phi`**: Contains sensitive patient identifiers (`PatientIdentifier`).
- **Isolation:** All PHI-related logic is physically isolated in `src/phi/*`. Data access outside this directory is restricted to non-PHI fields or safe helper extraction.

### Operational Hardening
We use **Composite Foreign Keys** to prevent "Organization Drift".
- `Encounter(orgId, patientId)` -> `Patient(orgId, id)`
- **Immutability:** Updates to `patientId` on existing encounters are blocked by DB security policy.

## 3. Multi-Tenancy & Monetization
The application is **Organization-centric** and features a tiered Plan model.

### Context Resolution
- **`getOrganizationContext()`**:
  1. Checks `injexpro_org_id` cookie for user preference.
  2. Fallbacks to the first active membership.
- **Global Auth Context:** `AuthContextProvider` makes the current user's **Role** and **Plan** (BASIC/PRO) available to all client components.

### Monetization Split
- **BASIC (Daily Documentation):** CORE clinical recording, 100 treatment limit, manual dosage presets. No re-opening of finalized records.
- **PRO (Compliance & Scale):** Unlimited treatments, organization-wide dosage standards, re-opening signed encounters (with audit log), detailed audit trails with filtering/export, advanced exports, compliance-specific documentation modes.
- **Upgrade Moments:** Triggered via `UpgradeDialog` when BASIC users attempt to access PRO features (Re-open, Audit Logs, usage limits, advanced exports).

## 4. Clinical Workflow & Data Integrity

### Encounter Lifecycle
1.  **Draft:** Default state. Features **Unsaved Changes** indicator.
2.  **Signed:** Finalized state.
    -   **Backend:** Updates blocked via `updateTreatment` action guard.
    -   **Frontend:** Form becomes Read-Only.
    -   **Re-open:** Requires **PRO Plan** and explicit "Unlock" action (Audit logged with mandatory reason).
3.  **Void:** Soft-delete state (Audit trail preserved).

### Smart Dose Engine
- **Baseline (All):** Automatic calculation between Units and Volume (ml) based on vial size and dilution.
- **Quick Presets:** Access to common medical concentrations (e.g., 100U in 2.5ml).
- **Organization Standards (PRO):** Automatically pre-fills clinic-wide default dosage settings for all new treatments.

## 5. Key Directories
- `src/generated/client`: Prisma Client (Custom output). Use `.../enums` for client-side role/plan imports.
- `src/phi/`: **PHI Isolation Zone**. All logic touching the `phi` schema must live here.
- `src/components/auth-context-provider.tsx`: Global RBAC and Plan state.
- `src/lib/permissions.ts`: Role-based and Plan-based guards (`checkPermission`, `checkPlan`).
- `src/app/(dashboard)/settings/`: URL-driven settings navigation (`?tab=...`).

## 6. Roadmap & Follow-up Actions

### Phase 3: Scaling & Compliance (Current Focus)
- [x] **PHI Code Isolation:** Complete isolation of `PatientIdentifier` operations.
- [x] **Plan-based Gating:** Functional BASIC/PRO split implemented across the app.
- [x] **Audit Log UI:** Integrated security event monitoring in Settings.
- [x] **Advanced Audit Filter:** Powerful filtering (action, user, date) and search interface for Audit Logs.
- [x] **Compliance Export:** CSV export for Audit Logs to satisfy institutional reporting needs.
- [x] **Containerization:** Production Docker setup completed.
- [ ] **Data Residency Enablers:** Finalize region-specific database routing hooks.
- [ ] **Stripe Integration:** Prepare for actual billing and automated plan switching.

### Future Features
- [x] **Smart Dose Engine (Base):** Automated calculations for toxin dilution.
- [ ] **Clinical Insights:** Aggregated research data views for clinics (Non-PHI).
- [ ] **Smart Defaults (PRO):** Learning-based suggestions for injection patterns based on history.
