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
- **Clinical Protocols:** Indication-specific presets (e.g., PREEMPT Migraine, Spasticity).
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

### Phase 8: High-End Clinical Polish (In Progress)
- [x] **Dynamic Contextual Navigation:** Implemented dynamic Breadcrumbs and a global Command Menu (`⌘K`) for rapid navigation.
- [x] **Workflow Efficiency:** Integrated User-Defined Protocols ("My Protocols"), allowing doctors to save and reuse custom treatment templates.
- [x] **Structured Diagnostics:** Integrated a searchable ICD-10 Diagnostic Catalogue with keyword-based matching and pre-seeded neurological codes.
- [x] **Injection Site Generalization:** Added support for non-muscle targets (Salivary Glands, Axilla) for sialorrhea and hyperhidrosis treatments.
- [x] **Visual Clinical History:** Implementation of a visual Patient Treatment Timeline to track progress chronologically.
- [x] **UX Refinements:** Added purposeful Empty States, transparent reset actions, and environment-aware organization switching.

### Phase 10: AK Botulinum Certification Roadmap (Completed)
The core mission of InjexPro is now fully integrated with automated tracking and evidence generation.

- [x] **Qualification Profile (Settings):**
    - Define target specialty (Neurology: 100/50 rule vs. Neuropediatrics: 50/25 rule).
    - Configure Supervision mode (Direct vs. Guarantor/Bürge) and default supervisor names.
- [x] **Dynamic Certification Tracker (Dashboard):**
    - High-end "Progress Tree" visualizing the path to Full vs. Partial certificates.
    - **Total treatments gate:** Live tracking against the 100 (or 50) required injections.
    - **Success control gate:** Automated counting of treatments with documented clinical follow-ups.
    - **Indication mix validator:** Visual checklist ensuring min. 2 categories (Spasticity, Dystonia, etc.) are covered.
    - **The "25 Rule" Tracker:** Visual alert for the 25-treatment focus requirement in primary indications.
- [x] **Supervision Integration (Treatments):**
    - Optional, collapsible "Certification Details" section added to treatment forms.
    - Ability to tag specific treatments as supervised by a named clinician.
- [x] **Expanded Clinical Targets:** Added Glandula parotis, Submandibularis, and Axilla targets for autonomic certification.
- [x] **Certification Reporting & Export:**
    - Dedicated "Print View" export matching AK Botulinum requirements (File 2).
    - Detailed, collapsible guidance card in Settings with submission instructions and email links.

### Phase 11: Advanced EHR Integration & Scaling (Planned)
- [ ] **FHIR / HL7 Interface Stubs:** Finalize interface bridges for EPIC, KISIM, and other major EHR systems.
- [ ] **PDF Application Bundle:** Automated one-click generation of the formal AK Botulinum application PDF.
- [ ] **Regional Scaling:** Performance optimization for multi-clinic environments and high-concurrency database pooling.
- [ ] **Custom Clinical Branding:** Enhanced white-labeling options for large hospital networks.

### Phase 9: Infrastructure & Connectivity (In Progress)
- [x] **Email System Setup:** Fully integrated Resend SDK for transactional emails (Invites, Payment Failures, Verification).
- [x] **Interactive Support:** Implemented Support/FAQ hub with functional contact form powered by Resend.
- [ ] **Infrastructure as Code:** Azure Bicep templates for push-button clinic deployments.
- [ ] **Enterprise Connectivity:** Finalize EHR/CMS interface stubs for Sales demos.

### Phase 7: Advanced Authentication & Governance (Completed)
- [x] **Secure Auth Flow:** Implemented mandatory Email Verification and full Password Reset flow with secure tokens.
- [x] **Org Governance:** Enabled organization soft-deletion (Close) for owners, with safeguards to prevent deletion of the last active organization.
- [x] **Multi-tenancy Hardening:** Added duplicate organization name checks and strict status filtering in the auth context.
- [x] **Comprehensive Audit logging:** Centralized `logAuditAction` utility tracking Treatment status changes, Admin edits, and Legal acceptances with IP/UA context.
- [x] **Performance & Reliability:** Optimized Dose Engine queries and robust client-side pre-fetching for patient selection.

## 6. Commit Standards (STRICT)
- **Format:** Always use 2x `-m` flags for git commits.
  - `-m "feat/fix: <Short Summary>"`
  - `-m "- Detail 1\n- Detail 2\n- Detail 3"`
- **Example:** `git commit -m "feat: add certification report" -m "- Added dedicated print view page\n- Updated export actions to include muscle details\n- Added collapsible info card in settings"