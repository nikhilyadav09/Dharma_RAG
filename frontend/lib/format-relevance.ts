export type CitationRole = "primary" | "supporting" | "related";

const CITATION_LABELS: Record<CitationRole, string> = {
  primary: "Primary Teaching",
  supporting: "Supporting Teaching",
  related: "Related Teaching",
};

export type ScriptureBook = "Bhagavad Gita" | "Yoga Sutras" | "unknown";

const BOOK_BADGE_LABELS: Record<ScriptureBook, string> = {
  "Bhagavad Gita": "Bhagavad Gita",
  "Yoga Sutras": "Yoga Sutras",
  unknown: "Scripture",
};

/** @deprecated Scores are kept internal; use citation roles in the UI instead. */
export function formatRelevancePercent(score?: number): number | null {
  if (score === undefined || score === null) {
    return null;
  }
  return Math.round(score <= 1 ? score * 100 : score);
}

export function detectScriptureBook(book?: string): ScriptureBook {
  if (!book) {
    return "unknown";
  }
  const lowered = book.toLowerCase();
  if (lowered.includes("gita") || lowered.includes("bhagavad")) {
    return "Bhagavad Gita";
  }
  if (lowered.includes("yoga") || lowered.includes("sutra")) {
    return "Yoga Sutras";
  }
  return "unknown";
}

export function formatBookBadge(book?: string): string {
  return BOOK_BADGE_LABELS[detectScriptureBook(book)];
}

export function getCitationRole(
  index: number,
  isPrimary: boolean,
): CitationRole {
  if (isPrimary || index === 0) {
    return "primary";
  }
  if (index <= 2) {
    return "supporting";
  }
  return "related";
}

export function formatCitationLabel(role: CitationRole): string {
  return CITATION_LABELS[role];
}

/** @deprecated Use formatCitationLabel(getCitationRole(...)) instead. */
export function formatRelevanceLabel(score?: number): string | null {
  if (score === undefined || score === null) {
    return null;
  }
  return formatCitationLabel("primary");
}

export function formatVerseReference(verse: {
  book: string;
  chapter: number | string;
  verse: number | string;
}): string {
  return `${verse.book} ${verse.chapter}.${verse.verse}`;
}
