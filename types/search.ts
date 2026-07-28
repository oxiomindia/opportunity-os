export type SearchResultCategory = 'navigation' | 'invoice' | 'account' | 'activity' | 'report';

export interface GlobalSearchResult {
  id: string;
  title: string;
  description: string;
  category: SearchResultCategory;
  href: string;
  metadata: string[];
  keywords: string[];
}
