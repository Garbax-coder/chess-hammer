/**
 * Le pagine con la scacchiera delle aperture (Learn, Drill, Consulta, Cicli),
 * che su desktop occupano esattamente lo schermo (OpeningPageLayout): li'
 * AppShell nasconde il piè di pagina, che farebbe scorrere la pagina e
 * spostare la scacchiera.
 */
export function isOpeningBoardPath(pathname: string): boolean {
  return /^\/openings\/(?!(import|eco)\/?$)[^/]+(\/(learn|lines|cycles))?\/?$/.test(
    pathname,
  )
}
