-- Grant update permissions for new certification columns to app_rw
-- Required for Certification Roadmap features
GRANT UPDATE (
  "isSupervised",
  "supervisorName"
) ON TABLE "public"."Encounter" TO app_rw;
