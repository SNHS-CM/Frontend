// Skin tone options — labels are translated via i18n keys; every heritage is
// represented so each person can pick what fits them.
export const SKIN_TONES: { id: string; labelKey: string; swatch: string }[] = [
  { id: 'skin.white', labelKey: 'skin.white', swatch: '#F3D6BE' },
  { id: 'skin.africanBlack', labelKey: 'skin.africanBlack', swatch: '#5A3B2E' },
  { id: 'skin.britishBlack', labelKey: 'skin.britishBlack', swatch: '#6E4A38' },
  { id: 'skin.meBlack', labelKey: 'skin.meBlack', swatch: '#8A5A3C' },
  { id: 'skin.asian', labelKey: 'skin.asian', swatch: '#EBC79E' },
  { id: 'skin.southAsian', labelKey: 'skin.southAsian', swatch: '#C68A5E' },
  { id: 'skin.hispanic', labelKey: 'skin.hispanic', swatch: '#D2A074' },
  { id: 'skin.indigenous', labelKey: 'skin.indigenous', swatch: '#B07A50' },
  { id: 'skin.mixed', labelKey: 'skin.mixed', swatch: '#9C6B45' },
  { id: 'skin.na', labelKey: 'skin.na', swatch: '#C9C6BE' },
]

// Style keywords are unique fashion terms — kept in English across all languages.
export const STYLES: { token: string; emoji: string }[] = [
  { token: 'Minimal', emoji: '◻️' },
  { token: 'Street', emoji: '🧢' },
  { token: 'Sporty', emoji: '👟' },
  { token: 'Casual', emoji: '👕' },
  { token: 'Formal', emoji: '🕴️' },
  { token: 'Vintage', emoji: '📻' },
  { token: 'Chic', emoji: '🕶️' },
  { token: 'Bohemian', emoji: '🌾' },
]

export const FITS: { token: string; descKey: string }[] = [
  { token: 'Slim Fit', descKey: 'fit.slim.desc' },
  { token: 'Regular Fit', descKey: 'fit.regular.desc' },
  { token: 'Over Fit', descKey: 'fit.over.desc' },
]

const VIBE: Record<string, string> = {
  Minimal: 'Casual',
  Street: 'Bold',
  Sporty: 'Active',
  Casual: 'Everyday',
  Formal: 'Polished',
  Vintage: 'Retro',
  Chic: 'Elegant',
  Bohemian: 'Free',
}

export const MAX_STYLES = 3

/** Combine the survey answers into English keyword tokens the AI shows under the
 *  user's name: the chosen styles (up to 3) plus the preferred fit. */
export function deriveKeywords(styles: string[], fit: string | null): string[] {
  const out: string[] = [...styles]
  if (fit && !out.includes(fit)) out.push(fit)
  // If only one style was picked, add a complementary vibe so the profile isn't bare.
  if (styles.length === 1) {
    const vibe = VIBE[styles[0]]
    if (vibe && !out.includes(vibe)) out.push(vibe)
  }
  return out.slice(0, 4)
}
