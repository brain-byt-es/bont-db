export type Locale = 'en' | 'de'

export const dictionaries = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      create: "Create",
      search: "Search...",
      loading: "Loading...",
      continue: "Continue",
      back: "Back",
      reset: "Reset"
    },
    sidebar: {
      dashboard: "Dashboard",
      patients: "Patients",
      treatments: "Treatments",
      export: "Export & Report",
      settings: "Settings",
      support: "Support",
      legal: "Legal & Compliance",
      logout: "Log out"
    },
    dashboard: {
      welcome: "Welcome back",
      subtitle: "Here is your clinical activity overview."
    },
    patients: {
      title: "Patients",
      subtitle: "Manage your patient database and view histories.",
      new_patient: "New Patient"
    },
    treatment: {
      steps: {
        context: "Context",
        intent: "Intent",
        procedure: "Procedure",
        review: "Review"
      },
      labels: {
        patient: "Patient",
        date: "Date",
        indication: "Indication",
        diagnosis: "Diagnosis",
        product: "Toxin Product",
        notes: "Clinical Session Notes",
        supervised: "Performed under supervision"
      },
      actions: {
        sign: "Sign & Finalize",
        draft: "Save Draft",
        add_site: "Add Injection Site",
        reopen: "Re-open to Edit"
      }
    }
  },
  de: {
    common: {
      save: "Speichern",
      cancel: "Abbrechen",
      edit: "Bearbeiten",
      delete: "Löschen",
      create: "Erstellen",
      search: "Suchen...",
      loading: "Lädt...",
      continue: "Weiter",
      back: "Zurück",
      reset: "Zurücksetzen"
    },
    sidebar: {
      dashboard: "Übersicht",
      patients: "Patienten",
      treatments: "Behandlungen",
      export: "Berichte & Export",
      settings: "Einstellungen",
      support: "Hilfe",
      legal: "Rechtliches",
      logout: "Abmelden"
    },
    dashboard: {
      welcome: "Willkommen zurück",
      subtitle: "Hier ist Ihre klinische Übersicht."
    },
    patients: {
      title: "Patienten",
      subtitle: "Verwalten Sie Ihre Patientendatenbank.",
      new_patient: "Neuer Patient"
    },
    treatment: {
      steps: {
        context: "Kontext",
        intent: "Ziele (GAS)",
        procedure: "Prozedur",
        review: "Abschluss"
      },
      labels: {
        patient: "Patient",
        date: "Datum",
        indication: "Indikation",
        diagnosis: "Diagnose",
        product: "Präparat",
        notes: "Klinische Notizen",
        supervised: "Unter Supervision durchgeführt"
      },
      actions: {
        sign: "Signieren & Abschließen",
        draft: "Entwurf speichern",
        add_site: "Injektionsstelle hinzufügen",
        reopen: "Erneut öffnen"
      }
    }
  }
} as const
