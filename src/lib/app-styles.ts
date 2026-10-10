export type AppStyleId = 'sage' | 'slatewood' | 'ochre'

export interface AppStyle {
  id: AppStyleId
  // Colori del logo: le due case della scacchiera di sfondo e il martello.
  // I colori dell'interfaccia stanno invece in src/index.css ([data-style]).
  logo: { lightSquare: string; darkSquare: string; hammer: string }
}

export const APP_STYLES: AppStyle[] = [
  {
    id: 'sage',
    logo: { lightSquare: '#F8EEB0', darkSquare: '#97A87E', hammer: '#2C4657' },
  },
  {
    id: 'slatewood',
    logo: { lightSquare: '#F8EEB0', darkSquare: '#B08D57', hammer: '#24394A' },
  },
  {
    id: 'ochre',
    logo: { lightSquare: '#ECC87C', darkSquare: '#92733D', hammer: '#2A1F0E' },
  },
]

export const DEFAULT_APP_STYLE: AppStyleId = 'sage'

export function appStyleById(id: string | null | undefined): AppStyle {
  return (
    APP_STYLES.find((s) => s.id === id) ??
    APP_STYLES.find((s) => s.id === DEFAULT_APP_STYLE)!
  )
}

// Lo stile scelto vale solo da utente autenticato: home, login e le pagine
// pubbliche restano sempre sullo stile predefinito, come il logo mostrato
// da Google al login.
export function resolveAppStyle(
  isAuthenticated: boolean,
  savedStyle: string | null | undefined,
): AppStyleId {
  return isAuthenticated ? appStyleById(savedStyle).id : DEFAULT_APP_STYLE
}
