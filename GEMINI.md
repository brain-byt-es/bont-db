# InjexPro Developer & Architecture Guide

## 1. Core Architecture
- **Framework:** Next.js 15 (App Router)
- **Database:** Azure PostgreSQL Flexible Server (France Central)
- **ORM:** Prisma 7 (Multi-schema: `public` + `phi`)
- **Authentication:** NextAuth.js (Auth.js) v5
  - Providers: Azure AD, Google, LinkedIn
  - Features: DB Account Linking with 7s timeout resilience for serverless environments.
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
The application is **Organization-centric** and features a seat-based tiered Plan model.

### Context Resolution
- **`getOrganizationContext()`**: Resolved via cookie or fallback to first active membership.
- **Global Auth Context:** `AuthContextProvider` provides the current user's **Role** and **Plan** (BASIC/PRO) to all client components.

### Monetization Split
- **BASIC (Free):** CORE clinical recording, 100 treatment limit, manual dose calculator, standard presets.
- **PRO (€59 / seat / mo):**
  - **Seat-based Billing:** Automatically determined by active clinical members.
  - **Automation:** Smart Defaults (Full auto-fill from last visit), clinic-wide dosage standards.
  - **Compliance:** Advanced Audit Trails (Search/Filter/Export), unlock signed records.
  - **Analytics:** Clinical Insights (Outcome trends, dosage distribution).
- **Upgrade Moments:** Integrated `UpgradeDialog` with feature comparison and Stripe Checkout link.

## 4. Clinical Workflow & Data Integrity

### Encounter Lifecycle
1.  **Draft:** Default state. Features **Unsaved Changes** indicator.
2.  **Signed:** Finalized state. Read-only.
3.  **Re-open:** Requires **PRO Plan** and Audit Log entry.
4.  **Void:** Soft-delete state (Audit trail preserved).

### Smart Dose Engine
- **Automatic Calculation:** Live conversion between Units and Volume (ml).
- **Presets:** Quick load common concentrations.
- **PRO Defaults:** Automatically pre-fills clinic-wide standards.

## 5. Roadmap & Follow-up Actions

### Phase 3: Scaling & Monetization (Completed)
- [x] **Stripe Integration:** Full checkout loop and seat-based billing automation.
- [x] **Smart Defaults:** Automated clinical workflow for PRO users.
- [x] **Clinical Insights:** Outcome trends and dosage analytics integrated into Dashboard.
- [x] **Interactive Pricing:** Feature comparison matrix embedded in the upgrade workflow.
- [x] **Audit Compliance:** Advanced filtering and CSV export for security logs.

### Phase 4: Expansion & Polish (Next)
- [ ] **Data Residency Enablers:** Finalize region-specific database routing hooks.
- [ ] **Multi-Admin UX:** Granular team permissions UI.
- [ ] **Advanced Dose Engine:** Smart suggestions based on patient history and indication patterns.
- [ ] **Infrastructure as Code:** Azure Bicep templates for push-button clinic deployments.