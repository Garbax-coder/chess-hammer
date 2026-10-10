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
    fallback: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
  },
  en: {
    fallback: 'If the button doesn’t work, copy and paste this link into your browser:',
  },
  fr: {
    fallback:
      'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :',
  },
  es: { fallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:' },
  de: {
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

function block(lang, copy, { label }) {
  const heading = label
    ? `\n          <p style="margin:0 0 16px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">${LANGUAGE_NAMES[lang]}</p>`
    : ''
  return `<div lang="${lang}">${heading}
          <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:#111827;">${copy.title}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">${copy.intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="border-radius:8px;background:#111827;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${copy.button}</a>
          </td></tr></table>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#6b7280;">${COMMON[lang].fallback}</p>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#2563eb;">{{ .ConfirmationURL }}</a></p>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">${copy.ignore}</p>
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
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:32px 0;">
          ${block('en', copies.en, { label: true })}`
  const body = byLanguage(
    (lang) => block(lang, copies[lang], { label: false }),
    bilingual,
  )
  const preheader = byLanguage(
    (lang) => copies[lang].subject,
    `${copies.it.subject} / ${copies.en.subject}`,
  )
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Chess Hammer</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#111827;">&#9822; Chess Hammer</td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
          ${body}
        </td></tr>
        <tr><td style="padding:16px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">Chess Hammer &middot; chesshammer.com</td></tr>
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
