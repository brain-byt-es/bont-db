-- GAS (Goal Attainment Scaling) Security & RBAC Setup
-- Run this to fix "permission denied" errors for the new GAS tables.

BEGIN;

-- 1. Grant base permissions to app_rw
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."TreatmentGoal" TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."GoalOutcome" TO app_rw;

-- 2. Grant read access to reporting_ro
GRANT SELECT ON TABLE "public"."TreatmentGoal" TO reporting_ro;
GRANT SELECT ON TABLE "public"."GoalOutcome" TO reporting_ro;

-- 3. Operational Hardening: Column-Level Immutability
-- These rules ensure that once a goal or outcome is linked to an encounter, 
-- that linkage cannot be changed by the application user, preventing "data drift".

-- 3.1 TreatmentGoal: Immutable encounterId
REVOKE UPDATE ON TABLE "public"."TreatmentGoal" FROM app_rw;
GRANT UPDATE (
  "category", 
  "description", 
  "updatedAt"
) ON TABLE "public"."TreatmentGoal" TO app_rw;

-- 3.2 GoalOutcome: Immutable goalId and assessmentEncounterId
REVOKE UPDATE ON TABLE "public"."GoalOutcome" FROM app_rw;
GRANT UPDATE (
  "score", 
  "notes", 
  "updatedAt"
) ON TABLE "public"."GoalOutcome" TO app_rw;

COMMIT;
