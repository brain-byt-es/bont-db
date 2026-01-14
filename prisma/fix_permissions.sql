-- Emergency Permission Fix v2
-- Re-applies all necessary grants for app_rw to ensure all tables are accessible.

BEGIN;

-- 1. Ensure schemas are usable
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT USAGE ON SCHEMA phi TO app_rw;

-- 2. Grant FULL permissions on ALL tables first (Base state)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA phi TO app_rw;

-- 3. Apply Operational Hardening (Restrict UPDATE on sensitive tables)
-- We REVOKE full table update and GRANT only on safe columns to prevent Organization/Patient drift.

-- 3.1 Encounter
REVOKE UPDATE ON TABLE "public"."Encounter" FROM app_rw;
GRANT UPDATE (
  "encounterAt", "encounterLocalDate", "status", "treatmentSite", "indication", "productId",
  "dilutionText", "dilutionUnitsPerMl", "totalUnits", "effectNotes", "adverseEventNotes", 
  "isSupervised", "supervisorName", "updatedAt"
) ON TABLE "public"."Encounter" TO app_rw;

-- 3.2 Injection
REVOKE UPDATE ON TABLE "public"."Injection" FROM app_rw;
GRANT UPDATE (
  "muscleId", "side", "units", "volumeMl", "notes", "lotId", "updatedAt"
) ON TABLE "public"."Injection" TO app_rw;

-- 3.3 Patient
REVOKE UPDATE ON TABLE "public"."Patient" FROM app_rw;
GRANT UPDATE (
  "status", "systemLabel", "notes", "updatedAt"
) ON TABLE "public"."Patient" TO app_rw;

-- 3.4 PatientIdentifier (PHI)
REVOKE UPDATE ON TABLE "phi"."PatientIdentifier" FROM app_rw;
GRANT UPDATE (
  "ehrPatientId", "dateOfBirth", "birthYear", "sourceSystem", "updatedAt"
) ON TABLE "phi"."PatientIdentifier" TO app_rw;

-- 3.5 TreatmentGoal
REVOKE UPDATE ON TABLE "public"."TreatmentGoal" FROM app_rw;
GRANT UPDATE (
  "category", "description", "updatedAt"
) ON TABLE "public"."TreatmentGoal" TO app_rw;

-- 3.6 GoalOutcome
REVOKE UPDATE ON TABLE "public"."GoalOutcome" FROM app_rw;
GRANT UPDATE (
  "score", "notes", "updatedAt"
) ON TABLE "public"."GoalOutcome" TO app_rw;

-- 4. Sequences (Required for SERIAL/Identity columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA phi TO app_rw;

COMMIT;