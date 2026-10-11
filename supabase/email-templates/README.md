# Template email di Supabase Auth

Ogni email è nella lingua dell'utente (italiano, inglese, francese, spagnolo o
tedesco), letta da `user_metadata.language` (`{{ .Data.language }}`): l'app la
salva alla registrazione e la aggiorna quando l'utente cambia lingua. Se manca
(account creati prima), il corpo è bilingue italiano + inglese e l'oggetto in
italiano. Supabase accetta oggetti di al massimo 255 caratteri: il generatore
si ferma con un errore se un oggetto li supera.

I testi stanno in `scripts/build-email-templates.mjs` (non negli HTML). Per cambiarli:

```bash
npm run email:build     # rigenera HTML, oggetti e supabase/config.toml
npm run email:push      # rigenera e invia i template al progetto collegato
```

`email:push` usa la Supabase CLI (`supabase config push`): prima di scrivere mostra
le differenze e chiede conferma. `supabase/config.toml` dichiara **solo** i tre
template, quindi le altre impostazioni del progetto (SMTP, CAPTCHA, login con
Google) restano come sono. Per il progetto di sviluppo:
`supabase config push --project-ref <ref di sviluppo>`.

| Template Supabase    | Chiave in config.toml              | Corpo                 |
| -------------------- | ---------------------------------- | --------------------- |
| Confirm signup       | `auth.email.template.confirmation` | `confirm-signup.html` |
| Reset password       | `auth.email.template.recovery`     | `reset-password.html` |
| Change email address | `auth.email.template.email_change` | `change-email.html`   |

Magic link, Invite user e Reauthentication non sono usati dall'app.

L'email di avviso prima dell'eliminazione per inattività non passa da Supabase Auth:
è in `account-deletion-warning.sql` (vedi la sezione "Conservazione degli account"
del README principale).

Stile "Carta" con la palette Salvia del sito. Il logo è `public/email/logo.png`,
servito da https://chesshammer.com/email/logo.png: incolla i template dopo aver
pubblicato il sito, altrimenti il logo non si vede.

Variabili usate: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`, `{{ .Data.language }}`.

Con Resend tieni **spento** il click tracking del dominio: riscriverebbe i link di
conferma e li romperebbe.

## Impostazioni collegate (Authentication → URL Configuration)

Il link nelle email di recupero password ed email-change porta a `/reset-password` e
`/profile` del sito. Supabase lo permette solo se l'indirizzo è nei **Redirect URLs**:

- `https://chesshammer.com/**`
- `http://localhost:5173/**` (sviluppo)

Senza, il link atterra sul Site URL (la home) e la pagina di reimpostazione non si apre.
