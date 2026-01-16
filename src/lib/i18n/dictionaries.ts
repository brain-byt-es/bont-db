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
      loading: "Loading..."
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
      loading: "Lädt..."
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
    }
  }
} as const
