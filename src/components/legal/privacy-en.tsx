import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function PrivacyEn() {
  return (
    <>
      <p>
        Last updated: October 10, 2026. This notice describes what personal data{' '}
        {SITE_DOMAIN} ("Chess Hammer", "the Service") collects, why, and what rights you
        have over it, under Regulation (EU) 2016/679 (GDPR).
      </p>

      <h2>Data controller</h2>
      <p>
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italy. For any request about your
        data, write to <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>:
        we reply within 30 days. The Service is currently offered for free by an
        individual, with no registered business yet: if the Service later moves to a
        company, this page will be updated with the new controller's details.
      </p>

      <h2>Data we collect</h2>
      <ul>
        <li>
          <b>Account data:</b> email address, password (never readable by us: stored as a
          hash by Supabase Auth), or, if you use "Continue with Google", the name, email
          and profile picture Google provides.
        </li>
        <li>
          <b>Training data:</b> the puzzles shown to you, your attempts (solved/failed,
          time taken), your ELO rating, and the training sessions you create.
        </li>
        <li>
          <b>Preferences:</b> language, light/dark theme, app style, board style and piece
          set, sound on/off, auto-advance, free practice filter.
        </li>
        <li>
          <b>Error reports:</b> if the app runs into an error, a technical report (error
          message, page, browser and operating system type, app version, technical
          identifiers such as the training session's). It doesn't contain your email, your
          name or your IP address.
        </li>
        <li>
          <b>Minimal technical data:</b> IP address and browser information, processed by
          our infrastructure providers (below) only to run and secure the Service; we
          don't use it to profile you.
        </li>
      </ul>
      <p>We don't collect payment data: the Service has no cost today.</p>

      <h2>Why we collect it</h2>
      <ul>
        <li>
          <b>To provide the Service you asked for</b> (create and use your account, track
          your training, show your history): legal basis, performance of the usage
          agreement you accept at signup.
        </li>
        <li>
          <b>Service emails</b> (account confirmation, password reset): same basis,
          contract performance.
        </li>
        <li>
          <b>Security</b> (preventing abuse, unauthorized access): legitimate interest in
          protecting the Service and its users.
        </li>
        <li>
          <b>Fixing errors</b> (knowing when and where the app breaks, and checking that
          the site is reachable): legitimate interest in offering a working Service.
        </li>
        <li>
          <b>Aggregate usage statistics</b> (how many people train, how often they come
          back), derived from the Service's own data without any tracking tools, to
          improve it and decide how to develop it: legitimate interest. Only overall
          numbers are used, never profiles of individual users.
        </li>
      </ul>
      <p>
        We show no advertising, we don't sell or share your data with third parties for
        marketing purposes, and we don't use it for commercial profiling.
      </p>

      <h2>Who processes data on our behalf</h2>
      <p>We only share data with who actually makes the Service run:</p>
      <ul>
        <li>
          <b>Supabase</b> (database, authentication) — EU-region infrastructure.
        </li>
        <li>
          <b>Vercel</b> (site hosting) — EU-region infrastructure.
        </li>
        <li>
          <b>Resend</b> (sending service emails through the {SITE_DOMAIN} domain).
        </li>
        <li>
          <b>Google Cloud</b> (private storage for database backup copies) — EU-region
          infrastructure (Belgium).
        </li>
        <li>
          <b>Sentry</b> (error reports and site availability checks) — data stored in the
          EU region (Germany). The availability check queries the site from several
          countries and involves no personal data.
        </li>
        <li>
          <b>Cloudflare</b> ("Turnstile" bot check on signup, sign-in and password reset).
        </li>
        <li>
          <b>Have I Been Pwned</b> (checking that the chosen password doesn't appear in
          known data breaches): only a fragment of its cryptographic fingerprint leaves
          the browser, never the password.
        </li>
        <li>
          <b>Google</b> (only if you choose "Continue with Google"): Google processes data
          as an independent controller per its own privacy notice.
        </li>
      </ul>
      <p>
        When a provider processes data outside the European Union, it does so under GDPR
        safeguards (e.g. standard contractual clauses).
      </p>

      <h2>Where data is stored and for how long</h2>
      <p>
        Data stays as long as your account is active. You can download a copy of your data
        and permanently delete your account at any time from your{' '}
        <Link to="/profile">Profile</Link> page: deletion is immediate and also removes
        linked sessions, attempts and statistics. To protect data against failures, a
        backup copy of the database is saved every week on Google Cloud, in private
        storage in the European Union, and kept for at most 8 weeks: within that period a
        deleted account's data also disappears from the copies. Error reports are deleted
        after 30 days.
      </p>

      <h2>Cookies and browser storage</h2>
      <p>
        The Service doesn't use tracking or third-party cookies, and needs no consent
        banner: we only use the technical browser storage (localStorage) necessary for it
        to work:
      </p>
      <ul>
        <li>your sign-in session (to keep you logged in, managed by Supabase Auth);</li>
        <li>language, theme, sound, board style, piece set, analysis engine settings;</li>
        <li>
          a copy of the current session's puzzle list, so it isn't downloaded in full on
          every visit (deleted when you sign out).
        </li>
      </ul>
      <p>None of this data leaves your browser for tracking purposes.</p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, rectify, erase, restrict processing of, port, and
        object to the use of your data, as well as the right to lodge a complaint with the{' '}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
          Italian Data Protection Authority (Garante)
        </a>{' '}
        or your own country's authority. Access and deletion are self-service from your
        profile; for any other request write to{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>.
      </p>

      <h2>Minimum age</h2>
      <p>
        The Service is intended for users aged {MIN_AGE} or older. That's the highest age
        set by European Union countries for consenting on your own to online services, and
        we apply it in every country.
      </p>

      <h2>Language</h2>
      <p>
        This notice is available in several languages. If the versions differ, the Italian
        text prevails.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        If we make a substantial change to this notice (e.g. moving to a paid model,
        adding advertising, or new providers) we'll update this page and the date at the
        top, and flag it inside the app.
      </p>
    </>
  )
}
