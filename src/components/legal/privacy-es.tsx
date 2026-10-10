import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function PrivacyEs() {
  return (
    <>
      <p>
        Última actualización: 10 de octubre de 2026. Esta política describe qué datos
        personales recoge {SITE_DOMAIN} («Chess Hammer», «el Servicio»), con qué fines y
        qué derechos tienes sobre ellos, según el Reglamento (UE) 2016/679 (RGPD).
      </p>

      <h2>Responsable del tratamiento</h2>
      <p>
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italia. Para cualquier solicitud
        sobre tus datos, escribe a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>: respondemos en
        un plazo de 30 días. Hoy el Servicio lo ofrece gratis una persona física, sin
        actividad económica registrada: si en el futuro el Servicio pasara a una sociedad,
        esta página se actualizará con los datos del nuevo responsable.
      </p>

      <h2>Datos que recogemos</h2>
      <ul>
        <li>
          <b>Datos de la cuenta:</b> dirección de correo, contraseña (nunca la podemos
          leer: Supabase Auth la guarda como hash) o, si usas «Continuar con Google», el
          nombre, el correo y la foto de perfil que proporciona Google.
        </li>
        <li>
          <b>Datos de entrenamiento:</b> los puzzles que se te proponen, tus intentos
          (resuelto/fallado, tiempo empleado), tu puntuación ELO y las sesiones de
          entrenamiento que creas.
        </li>
        <li>
          <b>Preferencias:</b> idioma, tema claro/oscuro, estilo de la app, estilo del
          tablero y juego de piezas, sonidos activados/desactivados, avance automático,
          filtro de la práctica libre.
        </li>
        <li>
          <b>Informes de errores:</b> si la app encuentra un error, un informe técnico
          (mensaje de error, página, tipo de navegador y sistema operativo, versión de la
          app, identificadores técnicos como el de la sesión de entrenamiento). No
          contiene tu correo, tu nombre ni tu dirección IP.
        </li>
        <li>
          <b>Datos técnicos mínimos:</b> dirección IP e información del navegador,
          tratadas por nuestros proveedores de infraestructura (abajo) solo para que el
          Servicio funcione y sea seguro; no las usamos para elaborar perfiles.
        </li>
      </ul>
      <p>No recogemos datos de pago: hoy el Servicio no tiene ningún coste.</p>

      <h2>Para qué los recogemos</h2>
      <ul>
        <li>
          <b>Prestar el Servicio que has solicitado</b> (crear y usar tu cuenta, registrar
          tus entrenamientos, mostrarte el historial): base jurídica, ejecución del
          contrato de uso que aceptas al registrarte.
        </li>
        <li>
          <b>Correos del servicio</b> (confirmación de la cuenta, restablecimiento de la
          contraseña): misma base, ejecución del contrato.
        </li>
        <li>
          <b>Seguridad</b> (prevenir abusos y accesos no autorizados): interés legítimo en
          proteger el Servicio y a sus usuarios.
        </li>
        <li>
          <b>Corrección de errores</b> (saber cuándo y dónde falla la app, y comprobar que
          el sitio está disponible): interés legítimo en ofrecer un Servicio que funcione.
        </li>
        <li>
          <b>Estadísticas de uso agregadas</b> (cuántas personas entrenan, con qué
          frecuencia vuelven), obtenidas de los datos del Servicio sin herramientas de
          seguimiento, para mejorarlo y decidir cómo desarrollarlo: interés legítimo. Solo
          se usan cifras globales, nunca perfiles de usuarios concretos.
        </li>
      </ul>
      <p>
        No mostramos publicidad, no vendemos ni cedemos tus datos a terceros con fines de
        marketing y no los usamos para elaborar perfiles comerciales.
      </p>

      <h2>Quién trata los datos por nuestra cuenta</h2>
      <p>Solo compartimos datos con quienes hacen funcionar el Servicio:</p>
      <ul>
        <li>
          <b>Supabase</b> (base de datos, autenticación) — infraestructura en la región
          UE.
        </li>
        <li>
          <b>Vercel</b> (alojamiento del sitio) — infraestructura en la región UE.
        </li>
        <li>
          <b>Resend</b> (envío de los correos del servicio a través del dominio{' '}
          {SITE_DOMAIN}).
        </li>
        <li>
          <b>Google Cloud</b> (almacenamiento privado de las copias de seguridad de la
          base de datos) — infraestructura en la región UE (Bélgica).
        </li>
        <li>
          <b>Sentry</b> (informes de errores y comprobación de la disponibilidad del
          sitio) — datos guardados en la región UE (Alemania). La comprobación de
          disponibilidad consulta el sitio desde varios países y no afecta a datos
          personales.
        </li>
        <li>
          <b>Cloudflare</b> (verificación antibots «Turnstile» al registrarse, iniciar
          sesión y restablecer la contraseña).
        </li>
        <li>
          <b>Have I Been Pwned</b> (comprobar que la contraseña elegida no aparece en
          filtraciones de datos conocidas): del navegador solo sale un fragmento de su
          huella criptográfica, nunca la contraseña.
        </li>
        <li>
          <b>Google</b> (solo si eliges «Continuar con Google»): Google trata los datos
          como responsable independiente según su propia política de privacidad.
        </li>
      </ul>
      <p>
        Cuando un proveedor trata datos fuera de la Unión Europea, lo hace con las
        garantías adecuadas que prevé el RGPD (por ejemplo, cláusulas contractuales tipo).
      </p>

      <h2>Dónde se guardan los datos y durante cuánto tiempo</h2>
      <p>
        Los datos se conservan mientras tu cuenta esté activa. Puedes descargar una copia
        de tus datos y eliminar definitivamente tu cuenta en cualquier momento desde la
        página <Link to="/profile">Perfil</Link>: la eliminación es inmediata y borra
        también las sesiones, intentos y estadísticas asociados. Para proteger los datos
        ante fallos, cada semana se guarda una copia de seguridad de la base de datos en
        Google Cloud, en un almacenamiento privado en la Unión Europea, y se conserva como
        máximo 8 semanas: en ese plazo los datos de una cuenta eliminada desaparecen
        también de las copias. Los informes de errores se eliminan a los 30 días.
      </p>

      <h2>Cookies y almacenamiento del navegador</h2>
      <p>
        El Servicio no usa cookies de seguimiento ni de terceros y no necesita un aviso de
        consentimiento: solo usamos el almacenamiento técnico del navegador (localStorage)
        necesario para que funcione:
      </p>
      <ul>
        <li>
          la sesión iniciada (para mantenerte conectado, gestionada por Supabase Auth);
        </li>
        <li>
          idioma, tema, sonidos, estilo del tablero, juego de piezas, ajustes del motor de
          análisis;
        </li>
        <li>
          una copia de la lista de puzzles de la sesión en curso, para no descargarla
          entera en cada visita (se borra al cerrar sesión).
        </li>
      </ul>
      <p>Ninguno de estos datos sale de tu navegador con fines de seguimiento.</p>

      <h2>Tus derechos</h2>
      <p>
        Tienes derecho de acceso, rectificación, supresión, limitación del tratamiento,
        portabilidad de los datos y oposición, además del derecho a presentar una
        reclamación ante la{' '}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
          autoridad italiana de protección de datos (Garante)
        </a>{' '}
        o ante la autoridad de tu país, como la AEPD en España. El acceso y la eliminación
        de los datos están disponibles por tu cuenta en el perfil; para cualquier otra
        solicitud escribe a{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
      </p>

      <h2>Edad mínima</h2>
      <p>
        El Servicio está dirigido a usuarios de al menos {MIN_AGE} años. Es la edad más
        alta que fijan los países de la Unión Europea para dar el consentimiento por uno
        mismo a servicios en línea, y la aplicamos en todos los países.
      </p>

      <h2>Idioma</h2>
      <p>
        Esta política está disponible en varios idiomas. Si las versiones difieren,
        prevalece el texto en italiano.
      </p>

      <h2>Cambios en esta política</h2>
      <p>
        Si cambiamos esta política de forma sustancial (por ejemplo, al pasar a un modelo
        de pago, añadir publicidad o nuevos proveedores), actualizaremos esta página y la
        fecha de arriba, y te lo indicaremos en la app.
      </p>
    </>
  )
}
