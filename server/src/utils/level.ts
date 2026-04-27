export function allowedLevels(hskLevel: number): string[] {
  return Array.from({ length: hskLevel }, (_, i) => `HSK${i + 1}`)
}
