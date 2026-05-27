export function normalizeTag(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.startsWith("##") ? trimmed.slice(2).trim() : trimmed;
}

export function tagsOverlap(a: string[], b: string[]): boolean {
  const normalizedB = new Set(
    b.map(normalizeTag).filter(Boolean).map((tag) => tag.toLowerCase()),
  );
  return a.some((tag) => {
    const normalized = normalizeTag(tag).toLowerCase();
    return normalized.length > 0 && normalizedB.has(normalized);
  });
}
