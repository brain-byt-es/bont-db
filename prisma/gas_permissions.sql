-- GAS (Goal Attainment Scaling) Security & RBAC Setup (Longitudinal v2)
-- Run this to fix "permission denied" errors for the refactored GAS tables.

BEGIN;

-- 1. Grant base permissions to app_rw
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."TreatmentGoal" TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."GoalAssessment" TO app_rw;

-- 2. Grant read access to reporting_ro
GRANT SELECT ON TABLE "public"."TreatmentGoal" TO reporting_ro;
GRANT SELECT ON TABLE "public"."GoalAssessment" TO reporting_ro;

-- 3. Operational Hardening: Column-Level Immutability
-- These rules prevent "Organization/Patient Drift".

-- 3.1 TreatmentGoal: Immutable context
REVOKE UPDATE ON TABLE "public"."TreatmentGoal" FROM app_rw;
GRANT UPDATE (
  "category", 
  "description", 
  "indication",
  "targetRegion",
  "status",
  "updatedAt"
) ON TABLE "public"."TreatmentGoal" TO app_rw;

-- 3.2 GoalAssessment: Immutable goalId and assessedBy
REVOKE UPDATE ON TABLE "public"."GoalAssessment" FROM app_rw;
GRANT UPDATE (
  "score", 
  "notes", 
  "updatedAt"
) ON TABLE "public"."GoalAssessment" TO app_rw;

COMMIT;