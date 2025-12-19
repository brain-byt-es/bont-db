# bont-docs

A web-based clinical documentation system for neurological botulinum toxin treatments.

The project focuses on **clean, efficient clinical workflows**, **certification-ready documentation**, and **research-friendly data structures**, without adding unnecessary friction to daily practice.

---

## 🎯 Goals

- Structured documentation of botulinum toxin treatments (neurology)
- Readiness for AK-BoNT certification requirements
- Built-in support for outcome tracking (scores, follow-ups)
- Research-capable real-world data (RWD) without disrupting clinical workflow
- Clean, minimal, clinician-friendly UI

---

## 🧠 Core Concepts

- **Patients** are pseudonymized (no names or addresses)
- **Treatments** are the central entity
- Each treatment can include:
  - Multiple injection targets
  - Optional follow-ups (success control)
  - Structured outcome scores (assessments)
- Scores are **recommended via UI hints**, not enforced by hard constraints

---

## 🧩 Tech Stack

### Frontend
- Next.js (App Router)
- shadcn/ui
- TypeScript
- Responsive, dashboard-based layout

### Backend
- Supabase (Postgres + Auth)
- Row Level Security (RLS)
- SQL views for exports and statistics

---

## 🗂️ Main Features

### Authentication
- Email/password login
- Protected routes
- Login as start page, dashboard after authentication

### Patients
- Pseudonymized patient records
- Overview table with quick access to treatment history

### Treatments
- Create and manage treatments per patient
- Inline editing of injection targets
- Structured fields for product, dilution, dose, effects, and adverse events

### Injections
- Repeatable rows per treatment
- Muscle selection via searchable, region-filtered dropdown
- Support for favorites and recently used targets

### Follow-ups
- Optional follow-up records
- Used to mark clinical success control
- Timepoint-based (baseline, peak effect, reinjection)

### Scores / Assessments
- Structured outcome scores (e.g. MAS, TWSTRS, HIT-6)
- Timepoint-aware (baseline / peak effect / follow-up)
- UI warnings if recommended scores are missing (no hard blocking)

### Dashboard
- Key progress indicators:
  - Total treatments
  - Treatments with follow-up
  - Indication breakdown
- Traffic-light logic for certification readiness

### Export
- **AK Certification (Minimal)** export
- **AK + Follow-up** export
- CSV format with fixed headers
- Preview before download

---

## 🧪 Research Readiness

The data model is designed to support:
- Longitudinal outcome analysis
- Dose–response exploration
- Indication- and diagnosis-based cohorts
- Easy export to R / Python / SPSS

Research functionality is **additive**, not intrusive.

---

## 🔐 Privacy & Security

- Pseudonymized patient data only
- No direct identifiers stored
- Row Level Security enforced at database level
- Single-user setup supported, multi-user possible later

---

## 🚧 Project Status

- Backend schema: stable (v1)
- Frontend: feature-complete, UI polishing ongoing
- Research add-ons: implemented, expandable

---

## 📌 Design Principles

- Hint, don’t block
- Structure without bureaucracy
- Clinical speed over theoretical perfection
- Research as a byproduct of good documentation

---

## 🛣️ Possible Future Extensions

- PDF export templates
- Multi-center support
- Configurable outcome scales
- Bulk import of legacy data
- Advanced analytics views

---

## 📄 License

MIT License
