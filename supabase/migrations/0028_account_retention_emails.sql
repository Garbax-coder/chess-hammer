-- Testi dell'email di avviso prima dell'eliminazione per inattivita' (vedi 0027),
-- copiati da supabase/email-templates/account-deletion-warning.sql.
-- Generato da scripts/build-email-templates.mjs: non modificare a mano.
insert into public.app_email_templates (name, lang, subject, html) values
  ('account-deletion-warning', 'it', $tpl$Il tuo account Chess Hammer sarà eliminato$tpl$, $tpl$<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Chess Hammer</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F7F6EE;font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Il tuo account Chess Hammer sarà eliminato</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;"><img src="https://chesshammer.com/email/logo.png" width="32" height="32" alt="" style="display:block;border:0;border-radius:7px;"></td>
            <td style="font-size:17px;font-weight:700;color:#262B22;letter-spacing:-.01em;">Chess Hammer</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#FFFFFF;border:1px solid #E1E2D3;border-radius:12px;padding:32px;">
          <div lang="it">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#262B22;">Il tuo account sta per essere eliminato</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A5143;">Non usi Chess Hammer da quasi due anni. Come previsto dall’informativa privacy, il tuo account e tutti i suoi dati verranno eliminati il <strong>{{DELETE_DATE}}</strong>. Per tenerlo basta accedere prima di quella data: l’eliminazione si annulla da sola.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#5A6D43;">
            <a href="{{LOGIN_URL}}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">Accedi</a>
          </td></tr></table>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#5A6251;">Se il pulsante non funziona, copia e incolla questo link nel browser:</p>
          <p style="margin:0 0 20px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{LOGIN_URL}}" style="color:#5A6D43;">{{LOGIN_URL}}</a></p>
          <p style="margin:0;padding-top:18px;border-top:1px solid #ECEEE2;font-size:13px;line-height:1.5;color:#5A6251;">Se non ti serve più, non devi fare nulla.</p>
          </div>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.6;color:#7C826F;">Chess Hammer &middot; Allenamento tattico per scacchisti<br><a href="https://chesshammer.com" style="color:#7C826F;text-decoration:none;">chesshammer.com</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
$tpl$),
  ('account-deletion-warning', 'en', $tpl$Your Chess Hammer account will be deleted$tpl$, $tpl$<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Chess Hammer</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F7F6EE;font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Chess Hammer account will be deleted</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;"><img src="https://chesshammer.com/email/logo.png" width="32" height="32" alt="" style="display:block;border:0;border-radius:7px;"></td>
            <td style="font-size:17px;font-weight:700;color:#262B22;letter-spacing:-.01em;">Chess Hammer</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#FFFFFF;border:1px solid #E1E2D3;border-radius:12px;padding:32px;">
          <div lang="en">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#262B22;">Your account is about to be deleted</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A5143;">You haven’t used Chess Hammer for almost two years. As stated in our privacy notice, your account and all its data will be deleted on <strong>{{DELETE_DATE}}</strong>. To keep it, just sign in before that date: the deletion is cancelled automatically.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#5A6D43;">
            <a href="{{LOGIN_URL}}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">Sign in</a>
          </td></tr></table>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#5A6251;">If the button doesn’t work, copy and paste this link into your browser:</p>
          <p style="margin:0 0 20px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{LOGIN_URL}}" style="color:#5A6D43;">{{LOGIN_URL}}</a></p>
          <p style="margin:0;padding-top:18px;border-top:1px solid #ECEEE2;font-size:13px;line-height:1.5;color:#5A6251;">If you no longer need it, you don’t have to do anything.</p>
          </div>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.6;color:#7C826F;">Chess Hammer &middot; Chess tactics training<br><a href="https://chesshammer.com" style="color:#7C826F;text-decoration:none;">chesshammer.com</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
$tpl$),
  ('account-deletion-warning', 'fr', $tpl$Votre compte Chess Hammer va être supprimé$tpl$, $tpl$<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Chess Hammer</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F7F6EE;font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Votre compte Chess Hammer va être supprimé</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;"><img src="https://chesshammer.com/email/logo.png" width="32" height="32" alt="" style="display:block;border:0;border-radius:7px;"></td>
            <td style="font-size:17px;font-weight:700;color:#262B22;letter-spacing:-.01em;">Chess Hammer</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#FFFFFF;border:1px solid #E1E2D3;border-radius:12px;padding:32px;">
          <div lang="fr">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#262B22;">Votre compte va bientôt être supprimé</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A5143;">Vous n’avez pas utilisé Chess Hammer depuis près de deux ans. Comme prévu par notre politique de confidentialité, votre compte et toutes ses données seront supprimés le <strong>{{DELETE_DATE}}</strong>. Pour le conserver, il suffit de vous connecter avant cette date : la suppression est annulée automatiquement.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#5A6D43;">
            <a href="{{LOGIN_URL}}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">Se connecter</a>
          </td></tr></table>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#5A6251;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="margin:0 0 20px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{LOGIN_URL}}" style="color:#5A6D43;">{{LOGIN_URL}}</a></p>
          <p style="margin:0;padding-top:18px;border-top:1px solid #ECEEE2;font-size:13px;line-height:1.5;color:#5A6251;">Si vous n’en avez plus besoin, vous n’avez rien à faire.</p>
          </div>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.6;color:#7C826F;">Chess Hammer &middot; Entraînement tactique aux échecs<br><a href="https://chesshammer.com" style="color:#7C826F;text-decoration:none;">chesshammer.com</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
$tpl$),
  ('account-deletion-warning', 'es', $tpl$Tu cuenta de Chess Hammer se va a eliminar$tpl$, $tpl$<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Chess Hammer</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F7F6EE;font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu cuenta de Chess Hammer se va a eliminar</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;"><img src="https://chesshammer.com/email/logo.png" width="32" height="32" alt="" style="display:block;border:0;border-radius:7px;"></td>
            <td style="font-size:17px;font-weight:700;color:#262B22;letter-spacing:-.01em;">Chess Hammer</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#FFFFFF;border:1px solid #E1E2D3;border-radius:12px;padding:32px;">
          <div lang="es">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#262B22;">Tu cuenta está a punto de eliminarse</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A5143;">Hace casi dos años que no usas Chess Hammer. Como indica nuestra política de privacidad, tu cuenta y todos sus datos se eliminarán el <strong>{{DELETE_DATE}}</strong>. Para conservarla, basta con iniciar sesión antes de esa fecha: la eliminación se cancela sola.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#5A6D43;">
            <a href="{{LOGIN_URL}}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">Iniciar sesión</a>
          </td></tr></table>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#5A6251;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="margin:0 0 20px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{LOGIN_URL}}" style="color:#5A6D43;">{{LOGIN_URL}}</a></p>
          <p style="margin:0;padding-top:18px;border-top:1px solid #ECEEE2;font-size:13px;line-height:1.5;color:#5A6251;">Si ya no la necesitas, no tienes que hacer nada.</p>
          </div>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.6;color:#7C826F;">Chess Hammer &middot; Entrenamiento táctico de ajedrez<br><a href="https://chesshammer.com" style="color:#7C826F;text-decoration:none;">chesshammer.com</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
$tpl$),
  ('account-deletion-warning', 'de', $tpl$Dein Chess-Hammer-Konto wird gelöscht$tpl$, $tpl$<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Chess Hammer</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F7F6EE;font-family:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Dein Chess-Hammer-Konto wird gelöscht</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6EE;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 4px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;"><img src="https://chesshammer.com/email/logo.png" width="32" height="32" alt="" style="display:block;border:0;border-radius:7px;"></td>
            <td style="font-size:17px;font-weight:700;color:#262B22;letter-spacing:-.01em;">Chess Hammer</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#FFFFFF;border:1px solid #E1E2D3;border-radius:12px;padding:32px;">
          <div lang="de">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#262B22;">Dein Konto wird bald gelöscht</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4A5143;">Du hast Chess Hammer seit fast zwei Jahren nicht genutzt. Wie in unserer Datenschutzerklärung beschrieben, werden dein Konto und alle zugehörigen Daten am <strong>{{DELETE_DATE}}</strong> gelöscht. Wenn du es behalten möchtest, melde dich einfach vor diesem Datum an: Die Löschung wird dann automatisch aufgehoben.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#5A6D43;">
            <a href="{{LOGIN_URL}}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">Anmelden</a>
          </td></tr></table>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#5A6251;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
          <p style="margin:0 0 20px;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{LOGIN_URL}}" style="color:#5A6D43;">{{LOGIN_URL}}</a></p>
          <p style="margin:0;padding-top:18px;border-top:1px solid #ECEEE2;font-size:13px;line-height:1.5;color:#5A6251;">Wenn du es nicht mehr brauchst, musst du nichts tun.</p>
          </div>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font-size:12px;line-height:1.6;color:#7C826F;">Chess Hammer &middot; Taktiktraining für Schach<br><a href="https://chesshammer.com" style="color:#7C826F;text-decoration:none;">chesshammer.com</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
$tpl$)
on conflict (name, lang) do update set subject = excluded.subject, html = excluded.html;
