export interface ParsedSource {
  raw: string;
  book: string;
  chapter?: string;
  verse?: string;
}

/** Parse references like "Bhagavad Gita 2.47" or "Yoga Sutras 1.2". */
export function parseSourceRef(ref: string): ParsedSource {
  const trimmed = ref.trim();
  const match = trimmed.match(/^(.+?)\s+(\d+)[.:](\d+)$/);

  if (!match) {
    return { raw: trimmed, book: trimmed };
  }

  return {
    raw: trimmed,
    book: match[1].trim(),
    chapter: match[2],
    verse: match[3],
  };
}

export function formatSourceLocation(source: ParsedSource): string {
  if (source.chapter && source.verse) {
    return `Chapter ${source.chapter} · Verse ${source.verse}`;
  }
  return source.book;
}

export function verseRefKey(verse: {
  book: string;
  chapter: number | string;
  verse: number | string;
}): string {
  return `${verse.book} ${verse.chapter}.${verse.verse}`;
}

export function formatVerseCopyText(verse: {
  book: string;
  chapter: number | string;
  verse: number | string;
  sanskrit?: string;
  translation?: string;
}): string {
  const lines = [
    `${verse.book} ${verse.chapter}:${verse.verse}`,
    verse.sanskrit ? `\n${verse.sanskrit}` : "",
    verse.translation ? `\n${verse.translation}` : "",
  ].filter(Boolean);

  return lines.join("\n").trim();
}
