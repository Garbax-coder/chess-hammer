import { Link } from 'react-router-dom'
import {
  SITE_CONTROLLER_CITY,
  SITE_CONTROLLER_NAME,
  SITE_DOMAIN,
  SITE_GITHUB_URL,
  SITE_PRIVACY_EMAIL,
} from '@/lib/site-info'
import { MIN_AGE } from '@/lib/legal'

export default function TermsEn() {
  return (
    <>
      <p>
        Last updated: October 10, 2026. By using {SITE_DOMAIN} ("Chess Hammer", "the
        Service") you accept these terms. If you don't accept them, don't use the Service.
      </p>

      <h2>What the Service is</h2>
      <p>
        Chess Hammer is a free web app for training with chess puzzles using the
        "woodpecker" method (solving a fixed set of puzzles over several consecutive
        rounds, increasing speed each round). The Service is currently offered for free,
        with no advertising or subscriptions: we make no guarantee of continuity,
        availability, or error-free operation.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must be at least {MIN_AGE} years old to register.</li>
        <li>
          Information provided at signup must be accurate; you're responsible for keeping
          your password confidential and for all activity on your account.
        </li>
        <li>
          You can delete your account at any time from your{' '}
          <Link to="/profile">Profile</Link> page: deletion is final and immediate.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>By using the Service you agree not to:</p>
      <ul>
        <li>create accounts with false information or impersonate others;</li>
        <li>try to access other accounts or bypass the Service's security measures;</li>
        <li>use the Service for unlawful purposes or to distribute malware or spam;</li>
        <li>
          deliberately overload the infrastructure (e.g. with massive automated requests).
        </li>
      </ul>
      <p>We may suspend or delete accounts that violate these terms.</p>

      <h2>Source code and license</h2>
      <p>
        Chess Hammer's source code, in the exact version running on this site, is public
        under the GNU GPLv3 license or later:{' '}
        <a href={SITE_GITHUB_URL} target="_blank" rel="noreferrer">
          {SITE_GITHUB_URL}
        </a>
        . You may read, modify and distribute it under that license's terms. The "Chess
        Hammer" name and your account content (your data) are not covered by the code's
        license. Third-party component licenses and attributions (Stockfish engine,
        Lichess puzzle database, piece sets, libraries): see{' '}
        <Link to="/credits">Credits</Link>.
      </p>

      <h2>No warranty and limitation of liability</h2>
      <p>
        The Service is provided "as is", with no warranties of any kind, to the fullest
        extent permitted by law. We're not liable for data loss, Service interruptions, or
        damages arising from its use, except where the law doesn't allow excluding
        liability (e.g. willful misconduct or gross negligence). Nothing here limits any
        mandatory rights the law grants you as a consumer.
      </p>

      <h2>Changes to the Service and these terms</h2>
      <p>
        We may change, suspend, or shut down the Service at any time. If we materially
        update these terms (e.g. introducing a paid plan), we'll update this page and the
        date at the top, and flag it inside the app before the changes apply to your use
        of the Service.
      </p>

      <h2>Language</h2>
      <p>
        These terms are available in several languages. If the versions differ, the
        Italian text prevails.
      </p>

      <h2>Governing law and jurisdiction</h2>
      <p>
        These terms are governed by Italian law. Any dispute falls under the jurisdiction
        of {SITE_CONTROLLER_CITY}, Italy, without prejudice to any mandatory consumer
        protections of your country of residence.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these terms, write to{' '}
        <a href={`mailto:${SITE_PRIVACY_EMAIL}`}>{SITE_PRIVACY_EMAIL}</a>. Controller:{' '}
        {SITE_CONTROLLER_NAME}, {SITE_CONTROLLER_CITY}, Italy.
      </p>
    </>
  )
}
