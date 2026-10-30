// Arabic count of reviews: 1 مراجعة واحدة, 2 مراجعتان, 3–10 مراجعات, 11+ مراجعة.
export function reviewCountLabel(n: number): string {
  if (n === 1) return "مراجعة واحدة";
  if (n === 2) return "مراجعتان";
  if (n >= 3 && n <= 10) return `${n} مراجعات`;
  return `${n} مراجعة`;
}
