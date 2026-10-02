import { describe, expect, it } from 'vitest'
import { BUS_FALLBACK_COLOR, LINES, busLine, lineBadgeSvg, lineForRoute, linesForStop, matchLines, smartScore, type Line } from './lines'

const bus = (code: string, name = `Route ${code}`): Line => ({ ...busLine('127A78', name), id: `bus-${code}`, code })
const ids = (ls: Line[]) => ls.map((l) => l.id)

describe('line data', () => {
  it('ids are unique and colours are #RRGGBB', () => {
    expect(new Set(ids(LINES)).size).toBe(LINES.length)
    for (const l of LINES) {
      expect(l.color).toMatch(/^#[0-9A-F]{6}$/i)
      expect(l.textColor).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it('finds a line from a plan-trip leg', () => {
    expect(lineForRoute('rapid-rail-kl', 'KJ')?.id).toBe('lrt-kelana-jaya')
    expect(lineForRoute('ktmb', 'SH')?.id).toBe('ktm-intercity')
    expect(lineForRoute('rapid-rail-kl', 'NOPE')).toBeUndefined()
  })

  it('lists the lines at an interchange in LINES order', () => {
    expect(ids(linesForStop('rapid-rail-kl', ['PYL', 'KGL']))).toEqual(['mrt-kajang', 'mrt-putrajaya'])
    expect(linesForStop('rapid-rail-kl')).toEqual([])
  })
})

describe('smartScore (typo-tolerant search)', () => {
  it('matches exact words and prefixes with score 0', () => {
    expect(smartScore('kelana', 'LRT Kelana Jaya Line')).toBe(0)
    expect(smartScore('kel', 'LRT Kelana Jaya Line')).toBe(0)
  })
  it('allows typos in longer words', () => {
    expect(smartScore('kelanna', 'LRT Kelana Jaya Line')).not.toBeNull()
    expect(smartScore('putrajya', 'MRT Putrajaya Line')).not.toBeNull()
  })
  it('never allows typos in numbers', () => {
    expect(smartScore('seksyen 8', 'Seksyen 7')).toBeNull()
    expect(smartScore('t353', 'T352')).toBeNull()
  })
  it('every typed word must match', () => {
    expect(smartScore('kelana ampang', 'LRT Kelana Jaya Line')).toBeNull()
  })
  it('empty query matches everything', () => expect(smartScore('  ', 'anything')).toBe(0))
})

describe('matchLines', () => {
  const buses = [bus('T352'), bus('T411'), bus('T789'), bus('400'), bus('T4110')]

  it('route codes: spacing, case and leading zeros do not matter', () => {
    for (const q of ['T352', 't352', 'T 352', 'T0352', 'bus T352']) expect(matchLines(q, buses)[0]?.code, q).toBe('T352')
  })
  it('number alone finds the lettered code', () => expect(matchLines('789', buses)[0]?.code).toBe('T789'))
  it('one character too many offers the nearest real code', () => expect(matchLines('T3521', buses)[0]?.code).toBe('T352'))
  it('rail line codes and aliases', () => {
    expect(matchLines('KGL')[0]?.id).toBe('mrt-kajang')
    expect(matchLines('komuter').map((l) => l.mode)).toContain('KTM')
    expect(matchLines('monorel')[0]?.id).toBe('monorail')
    expect(matchLines('lrt3')[0]?.id).toBe('lrt-shah-alam')
  })
  it('typo in a line name', () => expect(matchLines('kelanna jaya')[0]?.id).toBe('lrt-kelana-jaya'))
  it('no match and blank query give nothing', () => {
    expect(matchLines('zzzzqqq', buses)).toEqual([])
    expect(matchLines('   ', buses)).toEqual([])
  })
  it('caps the list at 40', () => {
    const many = Array.from({ length: 60 }, (_, i) => bus(`T${100 + i}`))
    expect(matchLines('T1', many).length).toBe(40)
  })
})

describe('busLine and badges', () => {
  it('uses the GTFS colour when published, RONDA navy otherwise', () => {
    expect(busLine('127a78').color).toBe('#127A78')
    expect(busLine('#abcdef').color).toBe('#ABCDEF')
    expect(busLine(null).color).toBe(BUS_FALLBACK_COLOR)
    expect(busLine(null).colorSource).toBe('unverified')
  })
  it('badge SVG escapes the line name', () => {
    const svg = lineBadgeSvg({ ...busLine(null, 'A <b> & "C"') })
    expect(svg).toContain('aria-label="A &lt;b&gt; &amp; &quot;C&quot;"')
    expect(svg).not.toContain('<b>')
    expect(lineBadgeSvg(LINES[0], { title: false })).not.toContain('<title>')
  })
})
