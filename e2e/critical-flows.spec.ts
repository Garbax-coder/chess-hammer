import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { Chess } from 'chess.js'
import { it as t } from '../src/lib/i18n/translations'
import { E2E_EMAIL_PREFIX } from './dev-env'

// I flussi principali, nell'ordine in cui li vive un utente: registrazione,
// allenamento, preferenze, esportazione dei dati, eliminazione dell'account.
test.describe.configure({ mode: 'serial' })

const email = `${E2E_EMAIL_PREFIX}${Date.now()}@gmail.com`
const password = `E2e-${Math.random().toString(36).slice(2, 12)}`
let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

async function logIn() {
  await page.goto('/login')
  await page.locator('input[type=email]').fill(email)
  await page.locator('input[type=password]').fill(password)
  await page.locator('form button[type=submit]').click()
}

// Posizione letta dalla scacchiera: chi risolve gioca dal basso.
async function boardPosition(): Promise<string> {
  const { pieces, whiteAtBottom } = await page.evaluate(() => {
    const squares = [...document.querySelectorAll<HTMLElement>('[data-square]')]
    const pieces: Record<string, string> = {}
    for (const sq of squares) {
      const piece = sq.querySelector<HTMLElement>('[data-piece]')?.dataset.piece
      if (piece) pieces[sq.dataset.square!] = piece
    }
    const y = (name: string) =>
      document.querySelector(`[data-square="${name}"]`)!.getBoundingClientRect().top
    return { pieces, whiteAtBottom: y('a1') > y('a8') }
  })
  const rows: string[] = []
  for (let rank = 8; rank >= 1; rank--) {
    let row = ''
    let empty = 0
    for (const file of 'abcdefgh') {
      const piece = pieces[`${file}${rank}`]
      if (!piece) {
        empty += 1
        continue
      }
      if (empty) row += String(empty)
      empty = 0
      row += piece[0] === 'w' ? piece[1].toUpperCase() : piece[1].toLowerCase()
    }
    rows.push(row + (empty ? String(empty) : ''))
  }
  return `${rows.join('/')} ${whiteAtBottom ? 'w' : 'b'} - - 0 1`
}

test('sign up and log in', async () => {
  await page.goto('/signup')
  await page.locator('input[type=email]').fill(email)
  await page.locator('input[type=password]').fill(password)
  await page.getByRole('checkbox').check()
  await page.locator('form button[type=submit]').click()
  await expect(page.getByText(t.signup.checkEmail)).toBeVisible()

  await logIn()
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('create a session and record an attempt on the board', async () => {
  await page.goto('/sessions/new')
  await page.getByRole('button', { name: t.newSession.start }).click()
  await expect(page).toHaveURL(/\/train$/)
  await expect(page.locator('[data-square]')).toHaveCount(64)
  await page.waitForTimeout(1500) // mossa d'apertura dell'avversario

  // Mosse legali qualsiasi finche' il primo puzzle non e' registrato (sbagliato o
  // risolto): il contatore del giorno passa da 1/10 a 2/10. Il messaggio di esito
  // resta visibile solo un attimo, con l'avanzamento automatico attivo.
  await expect(page.getByText(t.train.todayPuzzle(1, 10))).toBeVisible()
  const recorded = page.getByText(t.train.todayPuzzle(2, 10))
  for (let i = 0; i < 8 && !(await recorded.isVisible()); i++) {
    const moves = new Chess(await boardPosition()).moves({ verbose: true })
    const move = moves.find((m) => !m.promotion) ?? moves[0]
    await page.locator(`[data-square="${move.from}"]`).click()
    await page.locator(`[data-square="${move.to}"]`).click()
    if (move.promotion) {
      await page.getByRole('button', { name: t.puzzleBoard.promotionPieces.q }).click()
    }
    await page.waitForTimeout(2500) // risposta dell'avversario o passaggio al puzzle dopo
  }
  await expect(recorded).toBeVisible()

  await page.goto('/dashboard')
  await expect(page.getByText(t.dashboard.todayProgress(1, 10))).toBeVisible()
})

test('change the language from the profile', async () => {
  await page.goto('/profile')
  await page.getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await page.getByRole('button', { name: 'Italiano' }).click()
  await expect(page.getByRole('heading', { name: t.profile.title })).toBeVisible()
})

test('download your data as JSON', async () => {
  await page.goto('/profile')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: t.profile.exportJson }).click()
  const data = JSON.parse(readFileSync(await (await download).path(), 'utf8'))
  expect(data.puzzleAttempts).toHaveLength(1)
  expect(data.sessions).toHaveLength(1)
})

test('delete the account', async () => {
  await page.goto('/profile')
  await page.getByRole('button', { name: t.profile.deleteAccount }).click()
  await page.locator('#delete-confirm').fill(email)
  await page.getByRole('button', { name: t.profile.deleteConfirmButton }).click()
  await expect(page).toHaveURL(/\/$/)

  await logIn()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText(/Invalid login credentials/)).toBeVisible()
})
