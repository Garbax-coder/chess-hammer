export type BoardThemeId = 'classic' | 'ocean' | 'forest' | 'slate' | 'coral'

export interface BoardTheme {
  id: BoardThemeId
  light: string
  dark: string
}

// 'classic' usa esattamente i colori di default di react-chessboard
// (#F0D9B5/#B58863): chi non ha ancora scelto un tema non vede alcun
// cambiamento visivo.
export const BOARD_THEMES: BoardTheme[] = [
  { id: 'classic', light: '#F0D9B5', dark: '#B58863' },
  { id: 'ocean', light: '#DEE3E6', dark: '#6B8CA3' },
  { id: 'forest', light: '#EEEED2', dark: '#6B8F57' },
  { id: 'slate', light: '#E8EAED', dark: '#78899A' },
  { id: 'coral', light: '#F3E1D3', dark: '#C97B5F' },
]

export const DEFAULT_BOARD_THEME: BoardThemeId = 'classic'

export function boardThemeById(id: string | null | undefined): BoardTheme {
  return BOARD_THEMES.find((theme) => theme.id === id) ?? BOARD_THEMES[0]
}
