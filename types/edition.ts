export const productEditions = ['ap', 'ar', 'finance_suite'] as const;
export type ProductEdition = (typeof productEditions)[number];

export const editionLabels: Record<ProductEdition, string> = {
  ap: 'Oxiom Accounts Payable',
  ar: 'Oxiom Accounts Receivable',
  finance_suite: 'Oxiom Finance Suite',
};
