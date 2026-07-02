export function formatRelevancePercent(score?: number): number | null {
  if (score === undefined || score === null) {
    return null;
  }
  return Math.round(score <= 1 ? score * 100 : score);
}

export function formatRelevanceLabel(score?: number): string | null {
  const percent = formatRelevancePercent(score);
  if (percent === null) {
    return null;
  }
  return `Relevance · ${percent}%`;
}

export function formatVerseReference(verse: {
  book: string;
  chapter: number | string;
  verse: number | string;
}): string {
  return `${verse.book} ${verse.chapter}.${verse.verse}`;
}
