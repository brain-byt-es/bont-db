# InjexPro Developer & Architecture Guide

## 1. Core Architecture
- **Framework:** Next.js 15 (App Router)
- **Database:** Azure PostgreSQL Flexible Server (France Central)
- **ORM:** Prisma 7 (Multi-schema: `public` + `phi`)
- **Authentication:** NextAuth.js (Auth.js) v5
  - Providers: Azure AD, Google, LinkedIn
  - Features: DB Account Linking with 7s timeout resilience for serverless environments.
- **UI:** Tailwind CSS + Shadcn/UI

## 2. UI & Styling Standards
- **Color Mandate:** NEVER hardcode hex, rgb, or named colors (e.g., `text-[#3b82f6]` or `bg-blue-500`) in components.
- **Variable Usage:** Always use Tailwind theme variables defined in `src/app/globals.css` (e.g., `text-primary`, `bg-muted`, `border-border`).
- **Semantic Classes:** Prefer semantic utility classes (`text-muted-foreground`, `bg-accent`) to ensure consistent Dark Mode support and brand alignment.

## 3. Database Schema & Security
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
  - **BASIC:** Limited to **1 active user**. Unlimited clinical documentation.
  - **PRO:** Limited to **5 active users**. Pauschalpreis (Flat Fee) billed via Stripe.
  - **ENTERPRISE:** Unlimited users. Managed manually via Sales/Invoices.
- **Automated Reconciliation:** Stripe subscription quantities are automatically synced in `src/lib/stripe-billing.ts` upon team changes (Invite/Remove).
- **Lifecycle & Support:**
  - **Grace Period:** `PAST_DUE` status triggers warnings but maintains access.
  - **Kill-Switch:** Manual overrides enabled for support/sales intervention.
- **Admin UI:** Real-time seat tracking (e.g. "3 / 5 used") and direct portal integration.

### Plans
- **BASIC (Free):** Single user, unlimited documentation, manual calculations.
- **PRO ($49 / mo):** Up to 5 users, Smart Defaults, Audit Re-open, CSV Exports, Clinical Insights.
- **ENTERPRISE (Custom):** Unlimited users, EHR Integration (EPIC, KISIM), SSO/SAML, SLA, Custom Contracts.

## 4. Clinical Workflow & Data Integrity

### Encounter Lifecycle
1.  **Draft:** Default state. Features **Unsaved Changes** indicator.
2.  **Signed:** Finalized state. Read-only.
3.  **Re-open:** Requires **PRO Plan** and Audit Log entry.
4.  **Void:** Soft-delete state (Audit trail preserved).

### Advanced Dose Engine
- **Automatic Calculation:** Live conversion between Units and Volume (ml).
- **Clinical Protocols:** Indication-specific presets (e.g., PREMPT Migraine, Spasticity).
- **Smart Suggestions:** Automated dose hints based on specific patient history and muscle selection.
- **Query Optimization:** Two-step history fetching (Encounters -> Injections) to avoid complex joins and ensure high performance.

## 5. Roadmap & Follow-up Actions

### Phase 3: Scaling & Monetization (Completed)
- [x] **Stripe Integration:** Full checkout loop and flat-fee organization billing.
- [x] **PRO + ENTERPRISE Split:** Hierarchical plan structure with hard seat limits.
- [x] **Conversion Triggers:** Active upgrade prompts for Exports and Smart Defaults.
- [x] **Support Tools:** Manual plan overrides and support period flags.
- [x] **Admin UI:** Enhanced billing dashboard with seat usage tracking.

### Phase 4: Expansion & Polish (Completed)
- [x] **Data Residency Enablers:** Regional onboarding selection (EU vs US) with storage transparency.
- [x] **Advanced Dose Engine:** Intelligent historical suggestions and clinical protocol support.
- [x] **Multi-Admin UX:** Granular role management, membership updates, and ownership transfer.
- [x] **Strategic UX:** Compact upsell teasers and searchable country selection.

### Phase 5: Legal & Compliance Framework (Completed)
- [x] **Legal Hub:** Centralized, accessible pages for Terms, Privacy, DPA, Subprocessors, and TOMs using Tailwind typography.
- [x] **DPA Acceptance Gate:** Mandatory, high-conversion modal blocking clinical access until DPA is accepted by Organization Owner.
- [x] **Compliance Audit Trail:** `LegalAcceptance` table tracks execution details (User, IP, Version, Timestamp) for GDPR accountability.
- [x] **UX Optimization:** "Product-moment" design for DPA gate with clear "Why" messaging and minimal friction.

### Phase 6: Infrastructure & Connectivity (In Progress)
- [x] **Email System Setup:** Fully integrated Resend SDK for transactional emails (Invites, Payment Failures).
- [x] **Interactive Support:** Implemented Support/FAQ hub with functional contact form powered by Resend.
- [ ] **Infrastructure as Code:** Azure Bicep templates for push-button clinic deployments.
- [ ] **Enterprise Connectivity:** Finalize EHR/CMS interface stubs for Sales demos.

### Phase 7: Advanced Authentication & Governance (Completed)
- [x] **Secure Auth Flow:** Implemented mandatory Email Verification and full Password Reset flow with secure tokens.
- [x] **Org Governance:** Enabled organization soft-deletion (Close) for owners, with safeguards to prevent deletion of the last active organization.
- [x] **Multi-tenancy Hardening:** Added duplicate organization name checks and strict status filtering in the auth context.
- [x] **Comprehensive Audit logging:** Centralized `logAuditAction` utility tracking Treatment status changes, Admin edits, and Legal acceptances with IP/UA context.
- [x] **Performance & Reliability:** Optimized Dose Engine queries and robust client-side pre-fetching for patient selection.
