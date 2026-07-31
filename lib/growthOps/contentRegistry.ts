import { randomUUID } from 'node:crypto';
import type { ContentEntry, ContentType, PublishStatus, RegisterContentInput } from './types';

/** The Content Registry: blogs, guides, FAQs, case studies. Same
 * in-process, self-contained pattern as landingPageRegistry.ts. */
const content = new Map<string, ContentEntry>();

export function registerContent(input: RegisterContentInput): ContentEntry {
  const entry: ContentEntry = {
    id: randomUUID(),
    type: input.type,
    title: input.title,
    url: input.url,
    status: input.status ?? 'draft',
    lastUpdated: new Date().toISOString(),
  };
  content.set(entry.id, entry);
  return entry;
}

export function listContent(): ContentEntry[] {
  return Array.from(content.values());
}

export function listContentByType(type: ContentType): ContentEntry[] {
  return listContent().filter((entry) => entry.type === type);
}

export function getContent(id: string): ContentEntry | undefined {
  return content.get(id);
}

export function updateContentStatus(id: string, status: PublishStatus): ContentEntry | undefined {
  const entry = content.get(id);
  if (!entry) return undefined;
  entry.status = status;
  entry.lastUpdated = new Date().toISOString();
  return entry;
}

/** Test-only: not intended for production use. */
export function clearContentRegistryForTests(): void {
  content.clear();
}
