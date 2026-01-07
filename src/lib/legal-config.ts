export const LEGAL_VERSIONS = {
  TOS: "1.0",
  PRIVACY: "1.0",
  DPA: "1.0",
} as const;

export type LegalDocumentKey = keyof typeof LEGAL_VERSIONS;
