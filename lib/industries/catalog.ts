export interface Industry {
  id: string;
  label: string;
}

/**
 * Lightweight, expandable list — no icons, no per-industry pages. Adding an
 * industry is one entry here; the section on the homepage grows with it.
 */
export const industries: Industry[] = [
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'retail', label: 'Retail' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'professional-services', label: 'Professional Services' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'construction', label: 'Construction' },
  { id: 'hospitality', label: 'Hospitality' },
];
