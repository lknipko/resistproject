/**
 * Environment section tag taxonomy.
 * 7 consolidated topic tags replace the original 16 granular tags.
 *
 * Old → New mapping:
 *   Climate, Air Quality, Science & Monitoring → Climate & Atmosphere
 *   Public Lands, Forests, Wildlife            → Land & Wilderness
 *   Water, Oceans & Coasts                     → Water & Oceans
 *   Energy, Policy & Regulation                → Energy & Extraction
 *   Toxics & Chemicals, Health, Agriculture    → Toxics & Health
 *   Environmental Justice, Corporate Account.  → People & Justice
 *   Utah & Local                               → Utah & Local (unchanged)
 */
export const ENVIRONMENT_TOPIC_TAGS: string[] = [
  'Climate & Atmosphere',
  'Land & Wilderness',
  'Water & Oceans',
  'Energy & Extraction',
  'Toxics & Health',
  'People & Justice',
  'Utah & Local',
]

export const ENVIRONMENT_STATUS_TAGS: string[] = [
  'Urgent',
  'Ongoing',
  'Under Litigation',
  'Comment Period Open',
  'New',
]
