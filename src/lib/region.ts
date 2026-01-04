import { Region } from "@/generated/client/enums"

/**
 * Returns the current runtime region of the application.
 * Controlled via NEXT_PUBLIC_DEPLOYMENT_REGION environment variable.
 * Defaults to EU if not specified.
 */
export function getDeploymentRegion(): Region {
  const region = process.env.NEXT_PUBLIC_DEPLOYMENT_REGION
  
  if (region === 'US') return Region.US
  return Region.EU
}

/**
 * Returns a human-readable label for the current region.
 */
export function getRegionLabel(): string {
  const region = getDeploymentRegion()
  return region === Region.US ? 'United States' : 'European Union'
}

/**
 * Checks if the current organization's data residency matches the deployment region.
 * Useful for future multi-region routing.
 */
export function validateDataResidency(orgRegion: Region): boolean {
  return orgRegion === getDeploymentRegion()
}
