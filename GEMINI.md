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

### Monetization & Billing Engine
- **Source of Truth:** Database (`Organization.subscriptionStatus`, `stripeSubscriptionId`, `stripeCurrentPeriodEnd`) controls access, not Stripe API directly.
- **Seat-based Billing:** 
  - **Auto-Scaling:** Seat count is automatically reconciled with Stripe via `src/lib/stripe-billing.ts` whenever a member is added (Invite Accepted) or removed.
  - **Roles:** Active `OWNER`, `CLINIC_ADMIN`, `PROVIDER`, and `ASSISTANT` roles count as billable seats.
- **Lifecycle Handling:**
  - **Grace Period:** `PAST_DUE` status allows continued access but shows prominent warnings in Admin UI.
  - **Cancellation:** `CANCELED` status reverts organization to BASIC plan.
- **UI:** Admin Settings provides real-time billing status, active seat count, renewal dates, and direct links to Stripe Customer Portal.

### Plans
- **BASIC (Free):** CORE clinical recording, unlimited documentation for 1 user, manual dose calculator, standard presets.
- **PRO (€59 / org / mo):**
  - **Scale:** Up to 5 active clinical members.
  - **Automation:** Smart Defaults (Full auto-fill from last visit), clinic-wide dosage standards.
  - **Compliance:** Advanced Audit Trails (Search/Filter/Export), unlock signed records.
  - **Analytics:** Clinical Insights (Outcome trends, dosage distribution).
- **ENTERPRISE (Custom):**
  - **Scale:** Unlimited users & multiple locations.
  - **Integrations:** EHR/CMS connectivity (EPIC, KISIM).
  - **Governance:** SSO, SCIM, SLA, and Custom Contracts.

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
- [x] **Robust Billing Engine:** Webhook hardening, Grace Period handling, automated seat reconciliation.
- [x] **Smart Defaults:** Automated clinical workflow for PRO users.
- [x] **Clinical Insights:** Outcome trends and dosage analytics integrated into Dashboard.
- [x] **Interactive Pricing:** Feature comparison matrix embedded in the upgrade workflow.
- [x] **Audit Compliance:** Advanced filtering and CSV export for security logs.

### Phase 4: Expansion & Polish (Next)
- [ ] **Admin Communication:** Transactional emails for invites, payment failures, and welcome flows.
- [ ] **Conversion Triggers:** "Upgrade Moments" at key feature gates (Re-open, Export).
- [ ] **Data Residency Enablers:** Finalize region-specific database routing hooks.
- [ ] **Infrastructure as Code:** Azure Bicep templates for push-button clinic deployments.
