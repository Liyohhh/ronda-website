// Typo-tolerant matching for the site's small local searches (featured places, trails): letters and digits only,
// any case; each word of the search must start a word of the text, or be found inside it (3+ letters), or be one
// letter off a word (5+ letters: "hawkr", "pertma"). Spaces and dashes don't matter ("lala port" = "LaLaport").

// letters and digits only, lower case; accents dropped ("Café" = "cafe")
export const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()

// at most one letter wrong, missing or extra
export function nearWord(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0, j = 0, edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else { i++; j++ }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

function wordHits(w: string, words: string[], joined: string) {
  if (words.some((x) => x.startsWith(w))) return 2
  if (w.length >= 3 && joined.includes(w)) return 1
  if (w.length >= 5 && words.some((x) => nearWord(w, x) || (x.length > w.length && nearWord(w, x.slice(0, w.length))))) return 1
  return 0
}

// how well a search matches some texts: 0 = not at all, higher = better (a name that starts with the search is best)
export function matchScore(query: string, texts: string[]): number {
  const q = fold(query)
  if (!q) return 0
  const qWords = q.split(' ')
  let best = 0
  for (const text of texts) {
    const f = fold(text)
    if (!f) continue
    const words = f.split(' '), joined = f.replace(/ /g, '')
    if (f.startsWith(q) || joined.startsWith(q.replace(/ /g, ''))) { best = Math.max(best, 100); continue }
    let score = 0
    for (const w of qWords) {
      const h = wordHits(w, words, joined)
      if (!h) { score = 0; break }
      score += h
    }
    best = Math.max(best, score)
  }
  return best
}
