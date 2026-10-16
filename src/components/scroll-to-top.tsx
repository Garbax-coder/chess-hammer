import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Il router non riporta in cima la pagina quando se ne apre un'altra: chi
// aveva scorso la dashboard arrivava all'allenamento gia' scorso fino alla
// lista, senza vedere la scacchiera. Si riparte dall'alto a ogni cambio di
// pagina, tranne con Indietro/Avanti del browser (POP), che ripristinano da
// soli la posizione di prima.
export function ScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return null
}
