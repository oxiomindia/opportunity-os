import type { OpportunityCategory } from './types';

/**
 * Rule-based, deterministic, fully-testable classification and keyword
 * extraction -- not a call to any external AI classifier (no AI/LLM
 * provider is configured anywhere in this app). A future
 * classifier can replace classifyOpportunity/extractKeywords behind these
 * exact function signatures without touching any caller.
 */

const CATEGORY_PATTERNS: Array<{ category: OpportunityCategory; patterns: RegExp[] }> = [
  { category: 'purchase-intent', patterns: [/\b(looking for|need|want to buy|shopping for)\b.*\b(gst|erp|accounting|reconciliation|invoic\w*)\b/i] },
  { category: 'recommendation-request', patterns: [/\b(recommend\w*|suggestions?|which (software|tool|erp))\b/i, /\bany (recommendations|suggestions)\b/i] },
  { category: 'competitor-comparison', patterns: [/\bvs\.?\b|\bversus\b|\bcompared? to\b|\balternative to\b/i] },
  { category: 'complaint', patterns: [/\b(frustrat\w*|hate|terrible|worst|broken|doesn'?t work|annoying)\b/i] },
  { category: 'feature-request', patterns: [/\b(wish (it|there was)|feature request|would be nice if)\b/i] },
  { category: 'support-request', patterns: [/\b(how do i|help with|error|issue with|not working|stuck)\b/i] },
  { category: 'question', patterns: [/\?\s*$/, /\b(how|what|why|when|does anyone)\b/i] },
];

export function classifyOpportunity(snippet: string): OpportunityCategory {
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(snippet))) return category;
  }
  return 'general-discussion';
}

/** The exact phrases the platform brief calls out as opportunity
 * signals. */
const KEYWORD_LIBRARY: readonly string[] = [
  'gst software',
  'erp software',
  'itc reconciliation',
  'gstr-2b',
  'gstr 2b',
  'invoice matching',
  'accounting automation',
  'gst filing',
  'vendor reconciliation',
  'input tax credit',
  'small business erp',
  'accounts payable',
  'accounts receivable',
  'tax compliance',
  'reconciliation',
];

export function extractKeywords(snippet: string): string[] {
  const lower = snippet.toLowerCase();
  return KEYWORD_LIBRARY.filter((keyword) => lower.includes(keyword));
}

const CATEGORY_WEIGHT: Record<OpportunityCategory, number> = {
  'purchase-intent': 40,
  'recommendation-request': 35,
  'competitor-comparison': 25,
  complaint: 20,
  'support-request': 15,
  question: 15,
  'feature-request': 10,
  'general-discussion': 5,
};

export interface PriorityScoreInput {
  category: OpportunityCategory;
  keywords: string[];
  snippet: string;
}

/**
 * 0-100, deterministic and explainable by design -- a human reviewing the
 * Opportunity Queue can see exactly why something ranked where it did:
 * category weight + keyword density + a small bonus for a substantive
 * post (not a one-word mention).
 */
export function scoreOpportunityPriority(input: PriorityScoreInput): number {
  const categoryScore = CATEGORY_WEIGHT[input.category];
  const keywordScore = Math.min(input.keywords.length * 10, 40);
  const substanceBonus = input.snippet.trim().length > 40 ? 10 : 0;
  return Math.min(100, categoryScore + keywordScore + substanceBonus);
}
