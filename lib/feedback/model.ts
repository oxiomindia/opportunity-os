import { z } from 'zod';

export const feedbackCategories = ['invoice-upload', 'invoice-review', 'dashboard', 'search-filters', 'approval-workflow', 'reports', 'performance', 'user-interface', 'authentication-access', 'security-privacy', 'feature-request', 'other'] as const;
export const feedbackStatuses = ['new', 'under-review', 'more-information-needed', 'planned', 'in-progress', 'resolved', 'declined', 'duplicate'] as const;
export const feedbackPriorities = ['unassigned', 'low', 'medium', 'high', 'critical'] as const;

const meaningful = z.string().trim().max(4000).transform((value) => value || null);
export const feedbackInputSchema = z.object({
  pros: meaningful, cons: meaningful,
  category: z.enum(feedbackCategories),
  featureArea: z.string().trim().max(120).transform((value) => value || null),
  sourceRoute: z.string().trim().max(200).regex(/^\/[a-zA-Z0-9/_?=&.-]*$/).nullable().catch(null),
  rating: z.coerce.number().int().min(1).max(5).nullable().catch(null),
  mayContact: z.boolean(), anonymous: z.boolean(),
  idempotencyKey: z.uuid(),
}).superRefine((value, context) => {
  const content = [value.pros, value.cons].filter(Boolean).join(' ').trim();
  if (content.length < 10) context.addIssue({ code: 'custom', path: ['pros'], message: 'Share at least 10 meaningful characters in Pros or Cons.' });
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;

const urgentRules = [
  { pattern: /(?:other|another) organization.{0,40}(?:data|invoice|visible)|(?:data|invoice).{0,40}(?:other|another) organization|cross[- ]tenant/i, reason: 'Possible cross-tenant data exposure', priority: 'critical' as const },
  { pattern: /unauthorized access|account (?:was )?compromised|data (?:leak|breach|corruption)/i, reason: 'Possible security or data-integrity incident', priority: 'critical' as const },
  { pattern: /financial (?:total|amount).{0,30}(?:wrong|incorrect)|(?:total|amount).{0,30}(?:wrong|incorrect)/i, reason: 'Possible incorrect financial data', priority: 'high' as const },
  { pattern: /cannot log ?in|can't log ?in|application unavailable|service unavailable/i, reason: 'Possible access or availability incident', priority: 'high' as const },
  { pattern: /invoice.{0,30}(?:disappeared|missing)|uploaded document.{0,30}missing|repeated upload fail/i, reason: 'Possible document loss or repeated intake failure', priority: 'high' as const },
];

export function detectUrgency(input: Pick<FeedbackInput, 'pros' | 'cons' | 'category'>) {
  const content = `${input.pros ?? ''}\n${input.cons ?? ''}`.slice(0, 8000);
  for (const rule of urgentRules) if (rule.pattern.test(content)) return { urgent: true, reason: rule.reason, suggestedPriority: rule.priority };
  if (input.category === 'security-privacy') return { urgent: true, reason: 'Security or privacy category selected', suggestedPriority: 'high' as const };
  return { urgent: false, reason: null, suggestedPriority: 'unassigned' as const };
}

export function reviewerIdentity(anonymous: boolean, role: 'product-admin' | 'security-admin' | 'platform-admin', email: string) {
  return anonymous && role === 'product-admin' ? null : email;
}

export function resolvePriority(human: (typeof feedbackPriorities)[number], suggested: (typeof feedbackPriorities)[number]) { return human === 'unassigned' ? { human, suggested } : { human, suggested }; }
export function isValidStatusTransition(from: (typeof feedbackStatuses)[number], to: (typeof feedbackStatuses)[number]) { return from !== to && !(from === 'resolved' && to === 'duplicate'); }
