# Template email di Supabase Auth

Ogni email è bilingue (italiano sopra, inglese sotto), così funziona per tutti senza
dover conoscere la lingua dell'utente. I file sono solo la sorgente: Supabase **non**
li legge dal repo, vanno incollati a mano nel pannello.

Dashboard → Authentication → Emails → Templates (o "Email Templates"):

| Template Supabase       | Oggetto (Subject)                                    | File                  |
| ----------------------- | ---------------------------------------------------- | --------------------- |
| Confirm signup          | `Conferma la tua email · Confirm your email`         | `confirm-signup.html` |
| Reset password          | `Reimposta la password · Reset your password`        | `reset-password.html` |
| Change email address    | `Conferma il nuovo indirizzo email · Confirm your new email address` | `change-email.html` |

Per ciascuno: cambia il Subject, sostituisci tutto il corpo con il contenuto del file, Save.
Magic link, Invite user e Reauthentication non sono usati dall'app: lasciali predefiniti.

Variabili usate: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`.

Con Resend tieni **spento** il click tracking del dominio: riscriverebbe i link di
conferma e li romperebbe.

## Impostazioni collegate (Authentication → URL Configuration)

Il link nelle email di recupero password ed email-change porta a `/reset-password` e
`/profile` del sito. Supabase lo permette solo se l'indirizzo è nei **Redirect URLs**:

- `https://chesshammer.com/**`
- `http://localhost:5173/**` (sviluppo)

Senza, il link atterra sul Site URL (la home) e la pagina di reimpostazione non si apre.
