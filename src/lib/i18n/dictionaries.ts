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
      reset: "Reset",
      success: "Success",
      error: "Error"
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
      title: "Dashboard",
      subtitle: "Clinical Activity & Progress",
      stats: {
        total_patients: "Total Patients",
        total_treatments: "Total Treatments",
        follow_up_rate: "Follow-up Rate",
        next_actions: "Next Actions"
      },
      insights: {
        title: "Clinical Insights",
        unlock: "Upgrade to unlock",
        sample_data: "Sample Data"
      },
      certification: "Certification Roadmap"
    },
    patients: {
      title: "Patients",
      subtitle: "Manage your patient database and view histories.",
      new_patient: "New Subject",
      search_placeholder: "Search patients...",
      no_patients: "No patients yet",
      table: {
        code: "Patient Code",
        birth_year: "Birth Year",
        records: "Records",
        last_activity: "Last Activity",
        notes: "Notes"
      }
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
    },
    settings: {
      title: "Settings",
      general: {
        title: "General",
        desc: "Manage your clinic's public profile and details.",
        org_details: "Organization Details",
        data_residency: "Data Residency"
      },
      team: {
        title: "Team & Roles",
        desc: "Manage members and their access levels."
      },
      clinical: {
        title: "Clinical Defaults",
        desc: "Configure standard doses, vials, and decision support.",
        decision_support: "Clinical Decision Support",
        logs: "Security Logs"
      },
      billing: {
        title: "Billing & Plan",
        desc: "Manage your subscription and usage limits.",
        plan: "Subscription Plan",
        status: "Status",
        seats: "Active Seats",
        renews: "Renews On"
      },
      audit: {
        title: "Audit Logs",
        desc: "Detailed activity history for compliance and security."
      }
    },
    support: {
      title: "Support & FAQ",
      subtitle: "Find answers to common questions or reach out to our clinical and technical support team.",
      search_title: "How can we help?",
      search_placeholder: "Search for answers...",
      contact_title: "Contact Support",
      contact_desc: "Our team of clinical specialists is ready to help.",
      email_card: "Email us directly",
      sla_card: "Enterprise SLA",
      guides_card: "Clinical Guides"
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
      reset: "Zurücksetzen",
      success: "Erfolg",
      error: "Fehler"
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
      title: "Übersicht",
      subtitle: "Klinische Aktivität & Fortschritt",
      stats: {
        total_patients: "Patienten Gesamt",
        total_treatments: "Behandlungen Gesamt",
        follow_up_rate: "Follow-up Rate",
        next_actions: "Nächste Schritte"
      },
      insights: {
        title: "Klinische Einblicke",
        unlock: "Upgrade erforderlich",
        sample_data: "Beispieldaten"
      },
      certification: "Zertifizierungspfad"
    },
    patients: {
      title: "Patienten",
      subtitle: "Verwalten Sie Ihre Patientendatenbank und Historien.",
      new_patient: "Neuer Patient",
      search_placeholder: "Patienten suchen...",
      no_patients: "Noch keine Patienten",
      table: {
        code: "Patienten-Code",
        birth_year: "Geburtsjahr",
        records: "Einträge",
        last_activity: "Letzte Aktivität",
        notes: "Notizen"
      }
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
    },
    settings: {
      title: "Einstellungen",
      general: {
        title: "Allgemein",
        desc: "Verwalten Sie das öffentliche Profil Ihrer Klinik.",
        org_details: "Organisationsdetails",
        data_residency: "Datenstandort"
      },
      team: {
        title: "Team & Rollen",
        desc: "Verwalten Sie Mitglieder und Zugriffsrechte."
      },
      clinical: {
        title: "Klinische Standards",
        desc: "Konfigurieren Sie Standarddosen, Vials und Entscheidungshilfen.",
        decision_support: "Klinische Entscheidungshilfe",
        logs: "Sicherheitsprotokolle"
      },
      billing: {
        title: "Abrechnung & Plan",
        desc: "Verwalten Sie Ihr Abonnement und Nutzungslimits.",
        plan: "Abo-Plan",
        status: "Status",
        seats: "Aktive Plätze",
        renews: "Erneuerung am"
      },
      audit: {
        title: "Audit-Logs",
        desc: "Detaillierter Verlauf für Compliance und Sicherheit."
      }
    },
    support: {
      title: "Hilfe & FAQ",
      subtitle: "Finden Sie Antworten oder kontaktieren Sie unseren Support.",
      search_title: "Wie können wir helfen?",
      search_placeholder: "Nach Antworten suchen...",
      contact_title: "Support Kontaktieren",
      contact_desc: "Unser klinisches Team hilft Ihnen gerne weiter.",
      email_card: "Direkt E-Mail senden",
      sla_card: "Enterprise SLA",
      guides_card: "Klinische Leitfäden"
    }
  }
} as const
