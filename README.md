# InjexPro

A professional clinical documentation and governance system for neurological Botulinum Toxin treatments.

InjexPro focuses on **institutional-grade clinical workflows**, **regulatory compliance**, and **intelligent data structures** to turn clinical documentation into a strategic asset for clinics and hospital groups.

---

## 🎯 Strategic Pillars

- **Clinical Excellence:** Streamlined documentation optimized for neurological practice speed.
- **Compliance & Risk:** Audit-proof records with full attribution and longitudinal outcome tracking.
- **Governance at Scale:** Multi-tenant architecture with granular role-based access control (RBAC).
- **Interoperability:** Designed for integration with existing hospital systems (EPIC, KISIM).

---

## 🏗️ Technical Architecture

### Core Stack
- **Framework:** Next.js 15 (App Router / Turbopack)
- **Language:** TypeScript
- **ORM:** Prisma 7
- **Database:** Azure PostgreSQL Flexible Server (Strict PHI Isolation)
- **Auth:** NextAuth.js (v5) with Azure AD & Google providers
- **Billing:** Stripe (Automated Seat-based & Flat-fee logic)
- **UI:** Tailwind CSS 4 + shadcn/ui

### Security & Privacy
- **Strict Data Residency:** Choice of regional storage (EU vs US) during onboarding.
- **PHI Isolation:** Patient identifiers are physically isolated from clinical data.
- **Audit Trails:** Immutable logging of all clinical revisions and access events.

---

## 💎 SaaS Tiers

### BASIC (Free)
- **Single User Access**
- Unlimited clinical documentation
- Manual dose calculations
- Basic audit logs
- Standard templates

### PRO ($59 / Month / Organization)
- **Team Collaboration** (Up to 5 active users)
- **Smart Clinical Defaults:** Auto-fill from last patient visit
- **Advanced Audit:** Unlock signed records and export CSV formats
- **Clinical Insights:** Outcome trends and dosage analytics
- **Automated Billing:** Real-time seat synchronization via Stripe

### ENTERPRISE (Custom)
- **Unlimited Scale:** Unlimited users and multiple locations
- **System Integration:** EHR/CMS connectivity (EPIC, KISIM, HL7/FHIR)
- **Security:** SSO Enforcement (SAML/SCIM) and Audit APIs
- **Commercial:** SLAs, DPAs, and Invoice-based billing

---

## 🧠 Advanced Clinical Intelligence

- **Advanced Dose Engine:** Real-time historical analysis providing dose suggestions based on patient history.
- **Clinical Protocols:** Support for standard schemas like PREMPT (Migraine) and Spasticity flexor syndromes.
- **Smart Calculations:** Automatic live conversion between Units and Volume (ml) based on vial concentration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Stripe & Resend (for emails) API keys

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Generate Prisma client: `npx prisma generate`
5. Deploy database schema: `npx prisma db push`
6. Start development server: `npm run dev`

---

## 🤝 Contribution

We welcome contributions focused on clinical documentation standards and security.

1. Create a feature branch from `main`.
2. Follow established TypeScript and ESLint standards.
3. Ensure all changes pass the build check: `npm run build`.
4. Submit a Pull Request with a clear description of the clinical or technical impact.

---

## 📄 License

MIT License - Copyright (c) 2026 BrainBytes