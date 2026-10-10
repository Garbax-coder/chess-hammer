import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_GITHUB_URL,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function TermsEs() {
  return (
    <>
      <p>
        Última actualización: 10 de octubre de 2026. Al usar {SITE_DOMAIN} («Chess
        Hammer», «el Servicio») aceptas estos términos. Si no los aceptas, no uses el
        Servicio.
      </p>

      <h2>Qué es el Servicio</h2>
      <p>
        Chess Hammer es una aplicación web gratuita para entrenar con puzzles de ajedrez
        según el método «Woodpecker» (resolver un conjunto fijo de puzzles en varias
        rondas seguidas, cada vez más rápido). Hoy el Servicio se ofrece gratis, sin
        publicidad ni suscripciones: no garantizamos su continuidad, su disponibilidad ni
        la ausencia de errores.
      </p>

      <h2>Cuenta</h2>
      <ul>
        <li>Debes tener al menos {MIN_AGE} años para registrarte.</li>
        <li>
          Los datos que proporciones al registrarte deben ser correctos; eres responsable
          de mantener tu contraseña en secreto y de toda la actividad de tu cuenta.
        </li>
        <li>
          Puedes eliminar tu cuenta en cualquier momento desde la página{' '}
          <Link to="/profile">Perfil</Link>: la eliminación es definitiva e inmediata.
        </li>
      </ul>

      <h2>Uso permitido</h2>
      <p>Al usar el Servicio te comprometes a no:</p>
      <ul>
        <li>crear cuentas con datos falsos ni suplantar a otras personas;</li>
        <li>
          intentar acceder a cuentas ajenas ni eludir las medidas de seguridad del
          Servicio;
        </li>
        <li>usar el Servicio con fines ilícitos ni para distribuir malware o spam;</li>
        <li>
          sobrecargar deliberadamente la infraestructura (por ejemplo, con peticiones
          automatizadas masivas).
        </li>
      </ul>
      <p>
        Nos reservamos el derecho de suspender o eliminar las cuentas que incumplan estos
        términos.
      </p>

      <h2>Código fuente y licencia</h2>
      <p>
        El código fuente de Chess Hammer, en la versión exacta que funciona en este sitio,
        es público bajo la licencia GNU GPLv3 o posterior:{' '}
        <a href={SITE_GITHUB_URL} target="_blank" rel="noreferrer">
          {SITE_GITHUB_URL}
        </a>
        . Puedes leerlo, modificarlo y distribuirlo según los términos de esa licencia. El
        nombre «Chess Hammer» y el contenido de tu cuenta (tus datos) no están cubiertos
        por la licencia del código. Licencias y atribuciones de componentes de terceros
        (motor Stockfish, base de datos de puzzles de Lichess, juegos de piezas,
        bibliotecas): consulta <Link to="/credits">Créditos</Link>.
      </p>

      <h2>Sin garantía y limitación de responsabilidad</h2>
      <p>
        El Servicio se ofrece «tal cual», sin garantías de ningún tipo, en la medida
        máxima permitida por la ley. No somos responsables de pérdidas de datos,
        interrupciones del Servicio ni daños derivados de su uso, salvo cuando la ley no
        permita excluir la responsabilidad (por ejemplo, dolo o culpa grave). Nada en
        estos términos limita los derechos irrenunciables que la ley te reconoce como
        consumidor.
      </p>

      <h2>Cambios en el Servicio y en estos términos</h2>
      <p>
        Podemos modificar, suspender o cerrar el Servicio en cualquier momento. Si
        modificamos estos términos de forma sustancial (por ejemplo, al introducir un plan
        de pago), actualizaremos esta página y la fecha de arriba, y te lo indicaremos en
        la app antes de que los cambios se apliquen a tu uso del Servicio.
      </p>

      <h2>Idioma</h2>
      <p>
        Estos términos están disponibles en varios idiomas. Si las versiones difieren,
        prevalece el texto en italiano.
      </p>

      <h2>Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por la ley italiana. Cualquier controversia corresponde a
        los tribunales de {SITE_CONTROLLER_CITY} (Italia), sin perjuicio de las
        protecciones irrenunciables que la ley de tu país de residencia reconoce a los
        consumidores.
      </p>

      <h2>Contacto</h2>
      <p>
        Para preguntas sobre estos términos, escribe a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>. Responsable:{' '}
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italia.
      </p>
    </>
  )
}
