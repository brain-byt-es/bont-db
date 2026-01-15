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
- **GAS Hardening:** `TreatmentGoal(encounterId)` and `GoalOutcome(goalId, assessmentEncounterId)` are immutable to ensure data integrity across treatment cycles.
- **Demo Isolation:** Organizations with status `DEMO` are technically isolated and feature a programmatic reset capability to maintain a "Gold State" for sales.

## 3. Multi-Tenancy & Monetization
The application is **Organization-centric** and features a tiered plan model (BASIC, PRO, ENTERPRISE).

### Demo Account Mode
InjexPro features a high-fidelity "Demo Center" for prospects.
- **Seeding Engine:** Uses a flat `createMany` strategy with manual cryptographically secure UUID generation (bypassing Prisma's client-side `@default(uuid())` limitation).
- **Clinical Simulation:** Programmatically generates ~365 days of activity, including realistic follow-up intervals, MAS improvement trends, and GAS goal attainment.
- **Safety:** Prospects are landed in a sandboxed `DEMO` organization with a persistent UI banner and simulated reset intervals.

### Context Resolution
// ... existing content ...

### Phase 12: Sales & Enablement (Completed)
- [x] **Demo Mode Infrastructure:** Implemented isolated `DEMO` status for organizations with session-based data safety.
- [x] **High-Fidelity Data Generator:** Created a programmatic clinical simulator generating 365 days of realistic clinic history (Encounters, Injections, GAS Goals, MAS scores).
- [x] **One-Click Launch:** Integrated "Launch Demo Center" into the onboarding flow for immediate prospect engagement.
- [x] **Technical Seeding Engine:** Developed a flat, chunked `createMany` seeding strategy with manual UUID generation to bypass Prisma client-side limitations.
- [x] **Demo UX:** Added persistent `DemoBanner` for environment awareness and simulated environment resets.

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