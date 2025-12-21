
export interface PIIResult {
  score: number;
  detected: string[];
  isCritical: boolean; // Score >= 3
}

const PATTERNS = {
  email: {
    regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    score: 3,
    label: "E-Mail Address"
  },
  phone: {
    regex: /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{2,4}[\s-]?\d{2,4}[\s-]?\d{0,4}/, 
    score: 2,
    label: "Phone Number"
  },
  dateDDMMYYYY: {
    regex: /\b(0?[1-9]|[12]\d|3[01])[.\-\/](0?[1-9]|1[0-2])[.\-\/](19|20)\d{2}\b/,
    score: 2,
    label: "Date of Birth (DD.MM.YYYY)"
  },
  dateYYYYMMDD: {
    regex: /\b(19|20)\d{2}-[01]\d-[0-3]\d\b/,
    score: 2,
    label: "Date of Birth (YYYY-MM-DD)"
  },
  street: {
    regex: /\b([A-ZÄÖÜ][a-zäöüß]+(strasse|straße|weg|gasse|platz|allee|ring|ufer|street|road|avenue|lane|drive|court|place|square|way|rue|boulevard|chemin|route|impasse|quai|via|viale|piazza|corso|vicolo)\s+\d+[a-z]?)\b/i,
    score: 2,
    label: "Address (Street/House Number)"
  },
  insurance: {
    regex: /(\b756\.\d{4}\.\d{4}\.\d{2}\b)|(\b(versicherten\s*nr|versicherung\s*nr|krankenkasse|policen\s*nr|ahv|svnr|insurance\s*no|policy\s*no|ssn|social\s*security|num\w*\s*assur|nss|sécu|num\w*\s*assicur)\b)/i,
    score: 3,
    label: "Insurance/Social Security Identifier"
  },
  iban: {
    regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i,
    score: 3,
    label: "IBAN"
  },
  honorific: {
    regex: /\b(herr|frau|mr|ms|mrs|miss|dr|prof|monsieur|madame|mme|mlle|signore|signora|sig|sig\.ra|dott)\.?\s+[A-ZÄÖÜ][a-zäöüß]+\b/i,
    score: 1,
    label: "Name Indicator (Honorific)"
  },
  nameKeyword: {
    regex: /\b(name|vorname|nachname|first\s*name|last\s*name|surname|family\s*name|nom|prénom|prenom|nome|cognome)\s*:\s*/i,
    score: 1,
    label: "Name Indicator (Keyword)"
  }
};

export function validatePII(text: string | undefined | null): PIIResult {
  if (!text) return { score: 0, detected: [], isCritical: false };

  let totalScore = 0;
  const detectedSet = new Set<string>();

  // Check Email
  if (PATTERNS.email.regex.test(text)) {
    totalScore += PATTERNS.email.score;
    detectedSet.add(PATTERNS.email.label);
  }

  // Check Phone (basic check length > 7 to avoid matching short numbers)
  const phoneMatch = text.match(PATTERNS.phone.regex);
  if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 7) {
    totalScore += PATTERNS.phone.score;
    detectedSet.add(PATTERNS.phone.label);
  }

  // Check Dates
  if (PATTERNS.dateDDMMYYYY.regex.test(text) || PATTERNS.dateYYYYMMDD.regex.test(text)) {
    totalScore += PATTERNS.dateDDMMYYYY.score; // Assume score is same for both
    detectedSet.add("Full Date");
  }

  // Check Address
  if (PATTERNS.street.regex.test(text)) {
    totalScore += PATTERNS.street.score;
    detectedSet.add(PATTERNS.street.label);
  }

  // Check Insurance
  if (PATTERNS.insurance.regex.test(text)) {
    totalScore += PATTERNS.insurance.score;
    detectedSet.add(PATTERNS.insurance.label);
  }

  // Check IBAN
  if (PATTERNS.iban.regex.test(text)) {
    totalScore += PATTERNS.iban.score;
    detectedSet.add(PATTERNS.iban.label);
  }

  // Check Names
  if (PATTERNS.honorific.regex.test(text) || PATTERNS.nameKeyword.regex.test(text)) {
    totalScore += PATTERNS.honorific.score; // Use base score
    detectedSet.add("Name Indicator");
  }

  return {
    score: totalScore,
    detected: Array.from(detectedSet),
    isCritical: totalScore >= 3
  };
}
