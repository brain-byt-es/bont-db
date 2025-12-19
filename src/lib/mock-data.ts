export const mockSubjects = [
  { id: "1", patient_code: "PAT-001", birth_year: 1985, notes: "Chronic migraine", record_count: 5, last_activity: "2023-10-25" },
  { id: "2", patient_code: "PAT-002", birth_year: 1990, notes: "Cervical dystonia", record_count: 2, last_activity: "2023-11-12" },
  { id: "3", patient_code: "PAT-003", birth_year: 1978, notes: "Blepharospasm", record_count: 8, last_activity: "2023-12-01" },
  { id: "4", patient_code: "PAT-004", birth_year: 1995, notes: "Hyperhidrosis", record_count: 1, last_activity: "2023-09-15" },
  { id: "5", patient_code: "PAT-005", birth_year: 1982, notes: "Spasticity", record_count: 12, last_activity: "2023-12-05" },
]

export const mockRecords = [
  { id: "101", subject_id: "1", date: "2023-10-25", location: "Clinic A", category: "Migraine", product_label: "Botox", total_numeric_value: 155, reviewed: true },
  { id: "102", subject_id: "1", date: "2023-07-20", location: "Clinic A", category: "Migraine", product_label: "Botox", total_numeric_value: 155, reviewed: true },
  { id: "103", subject_id: "2", date: "2023-11-12", location: "Clinic B", category: "Dystonia", product_label: "Dysport", total_numeric_value: 500, reviewed: false },
  { id: "104", subject_id: "3", date: "2023-12-01", location: "Clinic A", category: "Blepharospasm", product_label: "Xeomin", total_numeric_value: 50, reviewed: true },
  { id: "105", subject_id: "5", date: "2023-12-05", location: "Clinic C", category: "Spasticity", product_label: "Botox", total_numeric_value: 300, reviewed: true },
]

export const mockProcedureSteps = [
  { id: "s1", record_id: "101", target_structure: "Frontalis", side: "Left", numeric_value: 10 },
  { id: "s2", record_id: "101", target_structure: "Frontalis", side: "Right", numeric_value: 10 },
  { id: "s3", record_id: "101", target_structure: "Corrugator", side: "Left", numeric_value: 10 },
  { id: "s4", record_id: "101", target_structure: "Corrugator", side: "Right", numeric_value: 10 },
]

export const mockFollowUps = [
  { id: "f1", record_id: "101", date: "2023-11-08", outcome_notes: "Significant reduction in headache frequency. Patient satisfied." },
  { id: "f2", record_id: "102", date: "2023-08-03", outcome_notes: "Moderate improvement. Requested dose adjustment next time." },
]
