import { describe, expect, it } from 'vitest'
import { otherTheme, resolveTheme } from '../src/lib/theme'

describe('resolveTheme', () => {
  it('uses an explicit choice regardless of the OS setting', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('light', true)).toBe('light')
  })
  it('follows the OS setting without a valid choice', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
    expect(resolveTheme('purple', true)).toBe('dark')
  })
})

describe('otherTheme', () => {
  it('toggles between light and dark', () => {
    expect(otherTheme('light')).toBe('dark')
    expect(otherTheme('dark')).toBe('light')
  })
})
