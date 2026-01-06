export interface Country {
  code: string
  name: string
  region: "EU" | "US"
}

export const COUNTRIES: Country[] = [
  { code: "DE", name: "Germany", region: "EU" },
  { code: "AT", name: "Austria", region: "EU" },
  { code: "CH", name: "Switzerland", region: "EU" },
  { code: "US", name: "United States", region: "US" },
  { code: "GB", name: "United Kingdom", region: "EU" },
  { code: "FR", name: "France", region: "EU" },
  { code: "IT", name: "Italy", region: "EU" },
  { code: "ES", name: "Spain", region: "EU" },
  { code: "NL", name: "Netherlands", region: "EU" },
  { code: "BE", name: "Belgium", region: "EU" },
  { code: "SE", name: "Sweden", region: "EU" },
  { code: "NO", name: "Norway", region: "EU" },
  { code: "DK", name: "Denmark", region: "EU" },
  { code: "FI", name: "Finland", region: "EU" },
  { code: "CA", name: "Canada", region: "US" },
]

export function getRegionForCountry(countryCode: string): "EU" | "US" {
  const country = COUNTRIES.find(c => c.code === countryCode)
  return country?.region || "EU"
}
