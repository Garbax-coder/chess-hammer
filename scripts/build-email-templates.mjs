// Genera i template delle email di Supabase Auth in supabase/email-templates/
// a partire dai testi qui sotto: node scripts/build-email-templates.mjs
//
// Ogni email sceglie la lingua da user_metadata.language ({{ .Data.language }}),
// che l'app salva alla registrazione e tiene allineata alla lingua scelta
// (vedi src/lib/auth.ts e LanguageProvider). Senza lingua salvata (account
// creati prima) l'email resta bilingue italiano + inglese, come prima.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'supabase',
  'email-templates',
)
const LANGS = ['it', 'en', 'fr', 'es', 'de']
const LANGUAGE_NAMES = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
}

// Un default "or" evita l'errore di confronto quando la chiave manca.
const LANG_VAR = '{{ $lang := or .Data.language "" }}'

const COMMON = {
  it: {
    tagline: 'Allenamento tattico per scacchisti',
    fallback: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
  },
  en: {
    tagline: 'Chess tactics training',
    fallback: 'If the button doesn’t work, copy and paste this link into your browser:',
  },
  fr: {
    tagline: 'Entraînement tactique aux échecs',
    fallback:
      'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :',
  },
  es: {
    tagline: 'Entrenamiento táctico de ajedrez',
    fallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
  },
  de: {
    tagline: 'Taktiktraining für Schach',
    fallback:
      'Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:',
  },
}

const TEMPLATES = {
  'confirm-signup': {
    it: {
      subject: 'Conferma la tua email',
      title: 'Conferma il tuo indirizzo email',
      intro:
        'Grazie per esserti registrato su Chess Hammer. Conferma l’indirizzo email per attivare il tuo account e iniziare ad allenarti.',
      button: 'Conferma email',
      ignore:
        'Se non hai creato tu un account su Chess Hammer, puoi ignorare questa email.',
    },
    en: {
      subject: 'Confirm your email',
      title: 'Confirm your email address',
      intro:
        'Thanks for signing up for Chess Hammer. Confirm your email address to activate your account and start training.',
      button: 'Confirm email',
      ignore: 'If you didn’t create a Chess Hammer account, you can ignore this email.',
    },
    fr: {
      subject: 'Confirmez votre e-mail',
      title: 'Confirmez votre adresse e-mail',
      intro:
        'Merci de vous être inscrit sur Chess Hammer. Confirmez votre adresse e-mail pour activer votre compte et commencer à vous entraîner.',
      button: 'Confirmer l’e-mail',
      ignore:
        'Si vous n’avez pas créé de compte Chess Hammer, vous pouvez ignorer cet e-mail.',
    },
    es: {
      subject: 'Confirma tu correo',
      title: 'Confirma tu dirección de correo',
      intro:
        'Gracias por registrarte en Chess Hammer. Confirma tu dirección de correo para activar la cuenta y empezar a entrenar.',
      button: 'Confirmar correo',
      ignore: 'Si no has creado una cuenta en Chess Hammer, puedes ignorar este correo.',
    },
    de: {
      subject: 'Bestätige deine E-Mail',
      title: 'Bestätige deine E-Mail-Adresse',
      intro:
        'Danke für deine Registrierung bei Chess Hammer. Bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren und mit dem Training zu beginnen.',
      button: 'E-Mail bestätigen',
      ignore:
        'Wenn du kein Konto bei Chess Hammer erstellt hast, kannst du diese E-Mail ignorieren.',
    },
  },
  'reset-password': {
    it: {
      subject: 'Reimposta la password',
      title: 'Reimposta la tua password',
      intro:
        'Abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account Chess Hammer. Usa il pulsante qui sotto per sceglierne una nuova. Per sicurezza il link ha una validità limitata.',
      button: 'Reimposta password',
      ignore:
        'Se non hai richiesto tu la reimpostazione, ignora questa email: la tua password resta invariata.',
    },
    en: {
      subject: 'Reset your password',
      title: 'Reset your password',
      intro:
        'We received a request to reset the password for your Chess Hammer account. Use the button below to choose a new one. For your security, the link expires after a short time.',
      button: 'Reset password',
      ignore:
        'If you didn’t request a reset, ignore this email: your password stays the same.',
    },
    fr: {
      subject: 'Nouveau mot de passe',
      title: 'Réinitialisez votre mot de passe',
      intro:
        'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Chess Hammer. Utilisez le bouton ci-dessous pour en choisir un nouveau. Par sécurité, le lien n’est valable que peu de temps.',
      button: 'Réinitialiser le mot de passe',
      ignore:
        'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre mot de passe ne change pas.',
    },
    es: {
      subject: 'Restablece tu contraseña',
      title: 'Restablece tu contraseña',
      intro:
        'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Chess Hammer. Usa el botón de abajo para elegir una nueva. Por seguridad, el enlace caduca en poco tiempo.',
      button: 'Restablecer contraseña',
      ignore: 'Si no lo has solicitado tú, ignora este correo: tu contraseña no cambia.',
    },
    de: {
      subject: 'Passwort zurücksetzen',
      title: 'Setze dein Passwort zurück',
      intro:
        'Wir haben eine Anfrage erhalten, das Passwort deines Chess-Hammer-Kontos zurückzusetzen. Wähle über den Button unten ein neues. Aus Sicherheitsgründen ist der Link nur kurz gültig.',
      button: 'Passwort zurücksetzen',
      ignore:
        'Wenn du das nicht angefordert hast, ignoriere diese E-Mail: Dein Passwort bleibt unverändert.',
    },
  },
  'change-email': {
    it: {
      subject: 'Conferma la nuova email',
      title: 'Conferma il nuovo indirizzo email',
      intro:
        'Hai chiesto di cambiare l’indirizzo email del tuo account Chess Hammer da <strong>{{ .Email }}</strong> a <strong>{{ .NewEmail }}</strong>. Conferma per completare la modifica.',
      button: 'Conferma modifica',
      ignore:
        'Se non hai richiesto tu questa modifica, ignora questa email e considera di cambiare la password.',
    },
    en: {
      subject: 'Confirm your new email',
      title: 'Confirm your new email address',
      intro:
        'You asked to change the email address of your Chess Hammer account from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>. Confirm to complete the change.',
      button: 'Confirm change',
      ignore:
        'If you didn’t request this change, ignore this email and consider changing your password.',
    },
    fr: {
      subject: 'Confirmez le nouvel e-mail',
      title: 'Confirmez votre nouvelle adresse e-mail',
      intro:
        'Vous avez demandé à remplacer l’adresse e-mail de votre compte Chess Hammer <strong>{{ .Email }}</strong> par <strong>{{ .NewEmail }}</strong>. Confirmez pour finaliser le changement.',
      button: 'Confirmer le changement',
      ignore:
        'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail et pensez à changer votre mot de passe.',
    },
    es: {
      subject: 'Confirma tu nuevo correo',
      title: 'Confirma tu nueva dirección de correo',
      intro:
        'Has pedido cambiar el correo de tu cuenta de Chess Hammer de <strong>{{ .Email }}</strong> a <strong>{{ .NewEmail }}</strong>. Confirma para completar el cambio.',
      button: 'Confirmar cambio',
      ignore:
        'Si no has pedido este cambio, ignora este correo y plantéate cambiar la contraseña.',
    },
    de: {
      subject: 'Bestätige deine neue E-Mail',
      title: 'Bestätige deine neue E-Mail-Adresse',
      intro:
        'Du möchtest die E-Mail-Adresse deines Chess-Hammer-Kontos von <strong>{{ .Email }}</strong> zu <strong>{{ .NewEmail }}</strong> ändern. Bestätige, um die Änderung abzuschließen.',
      button: 'Änderung bestätigen',
      ignore:
        'Wenn du diese Änderung nicht angefordert hast, ignoriere diese E-Mail und ändere am besten dein Passwort.',
    },
  },
}

// Stile "Carta" (come le schede del sito, palette Salvia): fondo crema,
// logo e nome sopra, scheda bianca con bordo sottile, pulsante salvia.
const COLORS = {
  page: '#F7F6EE',
  card: '#FFFFFF',
  border: '#E1E2D3',
  divider: '#ECEEE2',
  ink: '#262B22',
  body: '#4A5143',
  muted: '#5A6251',
  faint: '#7C826F',
  sage: '#5A6D43',
}
const FONT =
  "'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
// PNG perche' Gmail e Outlook non mostrano gli SVG: e' public/email/logo.png.
const LOGO_URL = 'https://chesshammer.com/email/logo.png'

function block(lang, copy, { label, link = '{{ .ConfirmationURL }}' }) {
  const heading = label
    ? `\n          <p style="margin:0 0 14px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${COLORS.sage};">${LANGUAGE_NAMES[lang]}</p>`
    : ''
  return `<div lang="${lang}">${heading}
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${COLORS.ink};">${copy.title}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${COLORS.body};">${copy.intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:${COLORS.sage};">
            <a href="${link}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">${copy.button}</a>
          </td></tr></table>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:${COLORS.muted};">${COMMON[lang].fallback}</p>
          <p style="margin:0 0 20px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="${link}" style="color:${COLORS.sage};">${link}</a></p>
          <p style="margin:0;padding-top:18px;border-top:1px solid ${COLORS.divider};font-size:13px;line-height:1.5;color:${COLORS.muted};">${copy.ignore}</p>
          </div>`
}

// {{ if eq $lang "it" }}…{{ else if … }}…{{ else }}fallback{{ end }}
function byLanguage(render, fallback) {
  const branches = LANGS.map(
    (lang, i) =>
      `${i === 0 ? '{{ if' : '{{ else if'} eq $lang "${lang}" }}${render(lang)}`,
  )
  return `${LANG_VAR}${branches.join('')}{{ else }}${fallback}{{ end }}`
}

function page(copies) {
  const bilingual = `${block('it', copies.it, { label: true })}
          <hr style="border:0;border-top:1px solid ${COLORS.divider};margin:32px 0;">
          ${block('en', copies.en, { label: true })}`
  const body = byLanguage(
    (lang) => block(lang, copies[lang], { label: false }),
    bilingual,
  )
  const preheader = byLanguage(
    (lang) => copies[lang].subject,
    `${copies.it.subject} / ${copies.en.subject}`,
  )
  const tagline = byLanguage((lang) => COMMON[lang].tagline, COMMON.it.tagline)
  return layout(body, preheader, tagline)
}

function layout(body, preheader, tagline) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Chess Hammer</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${COLORS.page};font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.page};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;"><img src="${LOGO_URL}" width="32" height="32" alt="" style="display:block;border:0;border-radius:7px;"></td>
            <td style="font-size:17px;font-weight:700;color:${COLORS.ink};letter-spacing:-.01em;">Chess Hammer</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;padding:32px;">
          ${body}
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.6;color:${COLORS.faint};">Chess Hammer &middot; ${tagline}<br><a href="https://chesshammer.com" style="color:${COLORS.faint};text-decoration:none;">chesshammer.com</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`
}

// L'oggetto ha un limite di 255 caratteri in Supabase: forma compatta, e
// l'italiano fa anche da ripiego per gli account senza lingua salvata.
const SUBJECT_MAX = 255

function subject(copies) {
  const others = LANGS.filter((lang) => lang !== 'it').map(
    (lang, i) =>
      `{{${i === 0 ? 'if' : 'else if'} eq $l "${lang}"}}${copies[lang].subject}`,
  )
  return `{{$l := or .Data.language ""}}${others.join('')}{{else}}${copies.it.subject}{{end}}`
}

for (const [name, copies] of Object.entries(TEMPLATES)) {
  writeFileSync(join(OUT, `${name}.html`), page(copies))
  const text = subject(copies)
  if ([...text].length > SUBJECT_MAX) {
    throw new Error(
      `${name}: oggetto di ${[...text].length} caratteri, il massimo è ${SUBJECT_MAX}`,
    )
  }
  writeFileSync(join(OUT, `${name}.subject.txt`), text + '\n')
  console.log(`email-templates: ${name}.html, ${name}.subject.txt`)
}

// Avviso di eliminazione per inattivita' (24 mesi senza accessi, vedi la
// migrazione 0027): non passa da Supabase Auth ma dalla funzione
// run_account_retention(), che lo invia con Resend 30 giorni prima. Una pagina
// per lingua, senza condizioni Go; {{DELETE_DATE}} e {{LOGIN_URL}} si
// sostituiscono all'invio. Il risultato e' SQL: per cambiare i testi gia' in
// produzione si rigenera e si copia in una nuova migrazione.
const ACCOUNT_DELETION_WARNING = {
  it: {
    subject: 'Il tuo account Chess Hammer sarà eliminato',
    title: 'Il tuo account sta per essere eliminato',
    intro:
      'Non usi Chess Hammer da quasi due anni. Come previsto dall’informativa privacy, il tuo account e tutti i suoi dati verranno eliminati il <strong>{{DELETE_DATE}}</strong>. Per tenerlo basta accedere prima di quella data: l’eliminazione si annulla da sola.',
    button: 'Accedi',
    ignore: 'Se non ti serve più, non devi fare nulla.',
  },
  en: {
    subject: 'Your Chess Hammer account will be deleted',
    title: 'Your account is about to be deleted',
    intro:
      'You haven’t used Chess Hammer for almost two years. As stated in our privacy notice, your account and all its data will be deleted on <strong>{{DELETE_DATE}}</strong>. To keep it, just sign in before that date: the deletion is cancelled automatically.',
    button: 'Sign in',
    ignore: 'If you no longer need it, you don’t have to do anything.',
  },
  fr: {
    subject: 'Votre compte Chess Hammer va être supprimé',
    title: 'Votre compte va bientôt être supprimé',
    intro:
      'Vous n’avez pas utilisé Chess Hammer depuis près de deux ans. Comme prévu par notre politique de confidentialité, votre compte et toutes ses données seront supprimés le <strong>{{DELETE_DATE}}</strong>. Pour le conserver, il suffit de vous connecter avant cette date : la suppression est annulée automatiquement.',
    button: 'Se connecter',
    ignore: 'Si vous n’en avez plus besoin, vous n’avez rien à faire.',
  },
  es: {
    subject: 'Tu cuenta de Chess Hammer se va a eliminar',
    title: 'Tu cuenta está a punto de eliminarse',
    intro:
      'Hace casi dos años que no usas Chess Hammer. Como indica nuestra política de privacidad, tu cuenta y todos sus datos se eliminarán el <strong>{{DELETE_DATE}}</strong>. Para conservarla, basta con iniciar sesión antes de esa fecha: la eliminación se cancela sola.',
    button: 'Iniciar sesión',
    ignore: 'Si ya no la necesitas, no tienes que hacer nada.',
  },
  de: {
    subject: 'Dein Chess-Hammer-Konto wird gelöscht',
    title: 'Dein Konto wird bald gelöscht',
    intro:
      'Du hast Chess Hammer seit fast zwei Jahren nicht genutzt. Wie in unserer Datenschutzerklärung beschrieben, werden dein Konto und alle zugehörigen Daten am <strong>{{DELETE_DATE}}</strong> gelöscht. Wenn du es behalten möchtest, melde dich einfach vor diesem Datum an: Die Löschung wird dann automatisch aufgehoben.',
    button: 'Anmelden',
    ignore: 'Wenn du es nicht mehr brauchst, musst du nichts tun.',
  },
}

const warningRows = LANGS.map((lang) => {
  const copy = ACCOUNT_DELETION_WARNING[lang]
  const html = layout(
    block(lang, copy, { label: false, link: '{{LOGIN_URL}}' }),
    copy.subject,
    COMMON[lang].tagline,
  )
  if (html.includes('$tpl$')) throw new Error('il testo contiene il delimitatore $tpl$')
  return `  ('account-deletion-warning', '${lang}', $tpl$${copy.subject}$tpl$, $tpl$${html}$tpl$)`
})
writeFileSync(
  join(OUT, 'account-deletion-warning.sql'),
  `-- Generato da scripts/build-email-templates.mjs: non modificare a mano.
insert into public.app_email_templates (name, lang, subject, html) values
${warningRows.join(',\n')}
on conflict (name, lang) do update set subject = excluded.subject, html = excluded.html;
`,
)
console.log('email-templates: account-deletion-warning.sql')
