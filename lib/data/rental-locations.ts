/**
 * Location options for rental price lookup (postcode + display label).
 * Used by the rent estimator dropdown and plan API.
 */
export const RENTAL_LOCATION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "2006", label: "University of Sydney (2006)" },
  { value: "2052", label: "UNSW Sydney (2052)" },
  { value: "2007", label: "University of Technology Sydney (2007)" },
  { value: "2109", label: "Macquarie University (2109)" },
  { value: "2751", label: "Western Sydney University (2751)" },
  { value: "2522", label: "University of Wollongong (2522)" },
  { value: "2308", label: "University of Newcastle (2308)" },
  { value: "2678", label: "Charles Sturt University (2678)" },
  { value: "2480", label: "Southern Cross University (2480)" },
  { value: "2351", label: "University of New England (2351)" },
  { value: "2060", label: "Australian Catholic University (2060)" },
  { value: "2000", label: "Sydney CBD (2000)" },
]

export function getLocationLabel(postcode: string, knownLabel?: string): string {
  const opt = RENTAL_LOCATION_OPTIONS.find((o) => o.value === postcode)
  return knownLabel ?? opt?.label ?? `Postcode ${postcode}`
}
