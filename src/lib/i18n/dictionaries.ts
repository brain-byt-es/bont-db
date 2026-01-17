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
      error: "Error",
      none: "None",
      notes: "Notes",
      all: "All",
      status: "Status"
    },
    status: {
      draft: "Draft",
      signed: "Signed",
      void: "Void",
      active: "Active",
      achieved: "Achieved",
      retired: "Retired",
      pending: "Pending"
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
        sample_data: "Sample Data",
        preview_title: "Unlock Clinical Intelligence",
        preview_desc: "Gain deep visibility into your treatment outcomes, dosing patterns, and documentation quality.",
        preview_cta: "Unlock Pro Analytics"
      },
      certification: {
        title: "Certification Roadmap",
        gates: "Requirement Gates",
        treatments: "Total Treatments documented",
        followups: "Clinical Success Controls",
        diversity: "Indication Diversity",
        rule25: "The \"25 Rule\"",
        focus: "Primary Focus",
        milestone: "Available Milestone",
        partial: "Partial Certificate",
        ready: "Ready for Application",
        in_progress: "In Progress"
      }
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
        notes: "Notes",
        born: "Born"
      }
    },
    patient_detail: {
      tabs: {
        timeline: "Timeline",
        goals: "Goals & GAS",
        records: "Records",
        notes: "Notes",
        insights: "Insights"
      },
      header: {
        reveal: "Reveal Identity",
        verified: "Verified Identity"
      }
    },
    treatment: {
      title: "Treatments",
      new_record: "New Record",
      indications: {
        kopfschmerz: "Headache",
        dystonie: "Dystonia",
        spastik: "Spasticity",
        autonom: "Autonomous",
        andere: "Other"
      },
      table: {
        patient: "Patient",
        date: "Date",
        status: "Status",
        location: "Location",
        indication: "Indication",
        product: "Product",
        total_units: "Total Units"
      },
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
        supervised: "Performed under supervision",
        supervisor: "Supervisor Name",
        concentration: "Concentration",
        accumulated: "Accumulated Dose",
        sites: "Injection Sites",
        units: "Units",
        volume: "Volume (ml)"
      },
      actions: {
        sign: "Sign & Finalize",
        draft: "Save Draft",
        add_site: "Add Injection Site",
        reopen: "Re-open to Edit",
        copy_last: "Copy Last Visit",
        clear: "Clear All"
      }
    },
    charts: {
      mas_improvement: "MAS Improvement",
      therapeutic_gain: "Therapeutic gain",
      avg_dose: "Average Dosage",
      units_per_indication: "Units per indication",
      case_mix: "Case Mix",
      indication_breakdown: "Indication breakdown",
      product_mix: "Product Mix",
      toxin_utilization: "Toxin utilization",
      activity_trend: "Activity Trend",
      top_muscles: "Top Muscles",
      documentation_quality: "Documentation Quality",
      confidence_score: "Confidence Score",
      improvement: "Improvement",
      units: "Units",
      treatments: "Treatments"
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
      subtitle: "Find answers to common questions or reach out to our team.",
      search_title: "How can we help?",
      search_placeholder: "Search for answers...",
      contact_title: "Contact Support",
      contact_desc: "Our team of clinical specialists is ready to help.",
      email_card: "Email us directly",
      sla_card: "Enterprise SLA",
      guides_card: "Clinical Guides",
      related_to: "Related To",
      record_id: "Link to Record (Optional)"
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
      error: "Fehler",
      none: "Keine",
      notes: "Notizen",
      all: "Alle",
      status: "Status"
    },
    status: {
      draft: "Entwurf",
      signed: "Signiert",
      void: "Ungültig",
      active: "Aktiv",
      achieved: "Erreicht",
      retired: "Archiviert",
      pending: "Ausstehend"
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
        sample_data: "Beispieldaten",
        preview_title: "Klinische Intelligenz freischalten",
        preview_desc: "Erhalten Sie tiefe Einblicke in Ihre Behandlungsergebnisse, Dosierungsmuster und Dokumentationsqualität.",
        preview_cta: "Pro Analytics freischalten"
      },
      certification: {
        title: "Zertifizierungspfad",
        gates: "Anforderungshürden",
        treatments: "Behandlungen dokumentiert",
        followups: "Erfolgskontrollen",
        diversity: "Indikations-Mix",
        rule25: "Die \"25er Regel\"",
        focus: "Hauptfokus",
        milestone: "Verfügbarer Meilenstein",
        partial: "Teilzertifikat",
        ready: "Bereit zur Beantragung",
        in_progress: "In Bearbeitung"
      }
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
        notes: "Notizen",
        born: "Geboren"
      }
    },
    patient_detail: {
      tabs: {
        timeline: "Zeitstrahl",
        goals: "Ziele & GAS",
        records: "Einträge",
        notes: "Notizen",
        insights: "Einblicke"
      },
      header: {
        reveal: "Identität aufdecken",
        verified: "Verifizierte Identität"
      }
    },
    treatment: {
      title: "Behandlungen",
      new_record: "Neuer Eintrag",
      indications: {
        kopfschmerz: "Kopfschmerz",
        dystonie: "Dystonie",
        spastik: "Spastik",
        autonom: "Autonom",
        andere: "Andere"
      },
      table: {
        patient: "Patient",
        date: "Datum",
        status: "Status",
        location: "Ort",
        indication: "Indikation",
        product: "Präparat",
        total_units: "Gesamtdosis"
      },
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
        supervised: "Unter Supervision durchgeführt",
        supervisor: "Name des Supervisors",
        concentration: "Konzentration",
        accumulated: "Gesamtdosis",
        sites: "Injektionsstellen",
        units: "Einheiten (U)",
        volume: "Volumen (ml)"
      },
      actions: {
        sign: "Signieren & Abschließen",
        draft: "Entwurf speichern",
        add_site: "Injektionsstelle hinzufügen",
        reopen: "Erneut öffnen",
        copy_last: "Letzte Sitzung kopieren",
        clear: "Zurücksetzen"
      }
    },
    charts: {
      mas_improvement: "MAS Verbesserung",
      therapeutic_gain: "Therapeutischer Gewinn",
      avg_dose: "Durchschnittsdosis",
      units_per_indication: "Einheiten pro Indikation",
      case_mix: "Indikations-Mix",
      indication_breakdown: "Aufteilung nach Indikation",
      product_mix: "Präparate-Mix",
      toxin_utilization: "Toxin-Verbrauch",
      activity_trend: "Aktivitätsverlauf",
      top_muscles: "Häufigste Muskeln",
      documentation_quality: "Dokumentationsqualität",
      confidence_score: "Konfidenzwert",
      improvement: "Verbesserung",
      units: "Einheiten",
      treatments: "Behandlungen"
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
      guides_card: "Klinische Leitfäden",
      related_to: "Bezieht sich auf",
      record_id: "Link zum Eintrag (Optional)"
    }
  }
} as const