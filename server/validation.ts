/** Server-side validation. Never trust browser-side validation alone. */
export const PROJECT_TYPES = [
  'Virtual Tour / 360',
  'Metaverse / Virtual World',
  'XR & Interactive Learning',
  'Website / Application',
  'Other Creative Technology',
] as const;
export interface Inquiry { name: string; email: string; projectType: typeof PROJECT_TYPES[number]; details: string }
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export function validateInquiry(raw: unknown): Inquiry | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.name !== 'string' || typeof b.email !== 'string' ||
    typeof b.projectType !== 'string' || typeof b.details !== 'string') return null;
  const name = b.name.trim();
  const email = b.email.trim();
  const projectType = b.projectType;
  const details = b.details.trim();
  if (name.length < 2 || name.length > 100 || /[\r\n\x00-\x1f\x7f]/.test(name)) return null;
  if (email.length > 254 || !emailPattern.test(email) || /[\r\n]/.test(email)) return null;
  if (!PROJECT_TYPES.includes(projectType as Inquiry['projectType'])) return null;
  if (details.length < 20 || details.length > 5000 || /\x00/.test(details)) return null;
  return { name, email, projectType: projectType as Inquiry['projectType'], details };
}
