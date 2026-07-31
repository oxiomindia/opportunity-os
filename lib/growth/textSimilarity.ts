/**
 * A lexical similarity heuristic (Jaccard token overlap), deliberately not
 * called "semantic similarity" -- true semantic similarity needs an
 * embedding model, and no AI/embedding provider is configured anywhere in
 * this app. This is an honest, real, deterministic proxy: two replies
 * that reuse a lot of the same words score high even if phrased slightly
 * differently, which is enough to flag "you're about to send something
 * very close to what you already sent" for human review. A future
 * embedding-backed implementation can replace this behind the same
 * function signature.
 */
export function textSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}
