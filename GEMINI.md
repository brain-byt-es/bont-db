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
The application is **Organization-centric** and features a tiered plan model (BASIC, PRO, ENTERPRISE).

### Context Resolution
- **`getOrganizationContext()`**: Resolved via cookie or fallback to first active membership.
- **Effective Plan Resolution:** Manual overrides (`planOverride`) and support windows (`proUntil`) take precedence over Stripe-synced data via `getEffectivePlan()`.

### Monetization & Billing Engine
- **Source of Truth:** Database holds the primary subscription state.
- **Seat-based Gating:**
  - **BASIC:** Limited to **1 active user**. Unlimited documentation.
  - **PRO:** Limited to **5 active users**. Pauschalpreis (Flat Fee) billed via Stripe.
  - **ENTERPRISE:** Unlimited users. Managed manually via Sales/Invoices.
- **Automated Reconciliation:** Stripe subscription quantities are automatically synced in `src/lib/stripe-billing.ts` upon team changes (Invite/Remove).
- **Lifecycle & Support:**
  - **Grace Period:** `PAST_DUE` status triggers warnings but maintains access.
  - **Kill-Switch:** Manual overrides enabled for support/sales intervention.
- **Admin UI:** Real-time seat tracking (e.g. "3 / 5 used") and direct portal integration.

### Plans
- **BASIC (Free):** Single user, unlimited documentation, manual calculations.
- **PRO (€59 / org / mo):** Up to 5 users, Smart Defaults, Audit Re-open, CSV Exports, Clinical Insights.
- **ENTERPRISE (Custom):** Unlimited users, EHR Integration (EPIC, KISIM), SSO/SAML, SLA, Custom Contracts.

## 4. Clinical Workflow & Data Integrity

### Encounter Lifecycle
1.  **Draft:** Default state. Features **Unsaved Changes** indicator.
2.  **Signed:** Finalized state. Read-only.
3.  **Re-open:** Requires **PRO Plan** and Audit Log entry.
4.  **Void:** Soft-delete state (Audit trail preserved).

## 5. Roadmap & Follow-up Actions

### Phase 3: Scaling & Monetization (Completed)
- [x] **Stripe Integration:** Full checkout loop and flat-fee organization billing.
- [x] **PRO + ENTERPRISE Split:** Hierarchical plan structure with hard seat limits.
- [x] **Conversion Triggers:** Active upgrade prompts for Exports and Smart Defaults.
- [x] **Support Tools:** Manual plan overrides and support period flags.
- [x] **Admin UI:** Enhanced billing dashboard with seat usage tracking.

### Phase 4: Expansion & Polish (Next)
- [ ] **Email System Setup:** **CRITICAL:** `RESEND_API_KEY` must be configured and `resend` package installed to enable transactional emails (Invites, Payment Failures).
- [ ] **Data Residency Enablers:** Finalize region-specific database routing hooks.
- [ ] **Advanced Dose Engine:** Smart suggestions based on patient history.
- [ ] **Infrastructure as Code:** Azure Bicep templates for push-button deployments.