import { describe, expect, it } from 'vitest'
import { legalContent } from '../src/legal/content'

const EMPTY = { name: '', street: '', postalCode: '', city: '', email: '', phone: '' }
const FILLED = {
  name: 'Max Mustermann',
  email: 'max@example.de',
}
const shape = (blocks) => blocks.map((b) => Object.keys(b)[0] + (b.ul ? b.ul.length : b.lines ? b.lines.length : ''))
const allText = (c) => JSON.stringify(c)

describe('legal content', () => {
  for (const section of ['imprint', 'privacy']) {
    it(`${section}: German and English have the same structure`, () => {
      const de = legalContent('de', FILLED, '2026-10-19')[section]
      const en = legalContent('en', FILLED, '2026-10-19')[section]
      expect(shape(en)).toEqual(shape(de))
    })
  }

  it('marks every missing operator detail as a placeholder', () => {
    const imprint = allText(legalContent('de', EMPTY, '2026-10-19').imprint)
    for (const label of ['Vor- und Nachname', 'E-Mail-Adresse']) {
      expect(imprint).toContain(`[[${label}]]`)
    }
  })

  it('has no placeholders once the operator details are filled in', () => {
    for (const lang of ['de', 'en']) {
      expect(allText(legalContent(lang, FILLED, '2026-10-19'))).not.toContain('[[')
    }
  })
})
