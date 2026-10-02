// Where to go after signing in, from the ?next= parameter: only a path on this site ("/admin?x=1"). Anything
// that could leave the site ("//evil.example", "/\evil.example", "https://...", "javascript:...") falls back
// to the home page, so a crafted login link can't send someone elsewhere.
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/')) return '/'
  if (next.startsWith('//') || next.startsWith('/\\')) return '/'
  if ([...next].some((c) => c.charCodeAt(0) < 0x20)) return '/' // tabs / newlines: browsers strip them, "/\t/x" = "//x"
  return next
}
