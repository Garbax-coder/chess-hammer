# Template email di Supabase Auth

Ogni email è nella lingua dell'utente (italiano, inglese, francese, spagnolo o
tedesco), letta da `user_metadata.language` (`{{ .Data.language }}`): l'app la
salva alla registrazione e la aggiorna quando l'utente cambia lingua. Se manca
(account creati prima), il corpo è bilingue italiano + inglese e l'oggetto in
italiano. Supabase accetta oggetti di al massimo 255 caratteri: il generatore
si ferma con un errore se un oggetto li supera.

I file si generano con `node scripts/build-email-templates.mjs`: i testi vanno
modificati lì, non negli HTML. Supabase **non** li legge dal repo, vanno
incollati a mano nel pannello.

Dashboard → Authentication → Emails → Templates (o "Email Templates"):

| Template Supabase    | Subject (incolla il contenuto del file)  | Corpo (Message body)  |
| -------------------- | ---------------------------------------- | --------------------- |
| Confirm signup       | `confirm-signup.subject.txt`             | `confirm-signup.html` |
| Reset password       | `reset-password.subject.txt`             | `reset-password.html` |
| Change email address | `change-email.subject.txt`               | `change-email.html`   |

Per ciascuno: sostituisci Subject e corpo, Save.
Magic link, Invite user e Reauthentication non sono usati dall'app: lasciali predefiniti.

Dopo averli salvati, prova una registrazione con un indirizzo `+prova` e una
lingua diversa dall'italiano. Se l'oggetto arriva con le parentesi graffe
(`{{ $lang := ...`), Supabase non interpreta le condizioni nell'oggetto: usa
allora un oggetto fisso, ad es. `Chess Hammer · Conferma email / Confirm email`.

Variabili usate: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`, `{{ .Data.language }}`.

Con Resend tieni **spento** il click tracking del dominio: riscriverebbe i link di
conferma e li romperebbe.

## Impostazioni collegate (Authentication → URL Configuration)

Il link nelle email di recupero password ed email-change porta a `/reset-password` e
`/profile` del sito. Supabase lo permette solo se l'indirizzo è nei **Redirect URLs**:

- `https://chesshammer.com/**`
- `http://localhost:5173/**` (sviluppo)

Senza, il link atterra sul Site URL (la home) e la pagina di reimpostazione non si apre.
