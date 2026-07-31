import type { Opportunity, OpportunityCategory } from './types';

export interface DraftContent {
  body: string;
  includesLink: boolean;
  linkRationale?: string;
  suggestedDocs: string[];
}

export interface ReplyAssistantProvider {
  id: string;
  generateDraft(opportunity: Opportunity): Promise<DraftContent> | DraftContent;
}

/** Curated, real pages that already exist in this app -- not invented
 * URLs. A future provider can select more precisely; this one is
 * deliberately simple. */
const DOC_LIBRARY: ReadonlyArray<{ keywords: readonly string[]; url: string; label: string }> = [
  { keywords: ['itc reconciliation', 'input tax credit', 'gstr-2b', 'gstr 2b', 'reconciliation'], url: '/solutions/input-tax-credit-recovery', label: 'Input Tax Credit Recovery' },
  { keywords: ['vendor reconciliation', 'invoice matching'], url: '/solutions/vendor-invoice-processing', label: 'Vendor Invoice Processing' },
  { keywords: ['accounting automation', 'erp software', 'small business erp'], url: '/solutions/finance-process-automation', label: 'Finance Process Automation' },
  { keywords: ['accounts payable'], url: '/solutions/accounts-payable-automation', label: 'Accounts Payable Automation' },
];

const OPENING_BY_CATEGORY: Record<OpportunityCategory, string> = {
  question: 'Happy to help with this.',
  'recommendation-request': 'A few things worth considering:',
  complaint: "Sorry you're running into this.",
  'competitor-comparison': "Fair question -- here's an honest take:",
  'feature-request': 'That would be a genuinely useful addition.',
  'purchase-intent': "If you're evaluating options:",
  'support-request': "Let's see if this helps:",
  'general-discussion': 'Adding a perspective on this:',
};

const LINK_ELIGIBLE_CATEGORIES: ReadonlySet<OpportunityCategory> = new Set(['purchase-intent', 'recommendation-request', 'question', 'support-request']);

/**
 * A rule-based, template draft assistant -- not an LLM. No AI provider
 * (Claude, OpenAI, or otherwise) is configured anywhere in this app, so a
 * "real AI assistant" here would mean fabricating a call to a provider
 * that doesn't exist. This produces an honest starting point a human is
 * expected to substantially rewrite before ever posting it, consistent
 * with "every draft must be reviewed by a human before publication." A
 * future LlmReplyAssistantProvider can implement this exact interface
 * once a real provider is wired up -- see README's "what's deliberately
 * not here."
 */
export class TemplateReplyAssistant implements ReplyAssistantProvider {
  readonly id = 'template-v1';

  generateDraft(opportunity: Opportunity): DraftContent {
    const opening = OPENING_BY_CATEGORY[opportunity.category];
    const lowerSnippet = opportunity.snippet.toLowerCase();
    const matchedDocs = DOC_LIBRARY.filter((doc) => doc.keywords.some((keyword) => opportunity.keywords.includes(keyword) || lowerSnippet.includes(keyword)));

    const includesLink = matchedDocs.length > 0 && LINK_ELIGIBLE_CATEGORIES.has(opportunity.category);
    const excerpt = opportunity.snippet.length > 120 ? `${opportunity.snippet.slice(0, 120)}...` : opportunity.snippet;

    const bodyParts = [opening, `[Draft -- edit before posting] Regarding "${excerpt}"`];
    if (includesLink && matchedDocs[0]) {
      bodyParts.push(`You might find this useful: ${matchedDocs[0].label} (${matchedDocs[0].url}).`);
    }

    return {
      body: bodyParts.join(' '),
      includesLink,
      linkRationale: includesLink ? 'The discussion shows purchase intent or a direct question a relevant page can answer.' : undefined,
      suggestedDocs: matchedDocs.map((doc) => doc.url),
    };
  }
}

export const templateReplyAssistant = new TemplateReplyAssistant();
