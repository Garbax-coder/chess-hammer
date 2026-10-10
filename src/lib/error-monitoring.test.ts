import type { ErrorEvent } from '@sentry/react'
import { describe, expect, it } from 'vitest'
import { scrubBreadcrumb, scrubEvent, scrubUrl } from './error-monitoring'

describe('error monitoring privacy', () => {
  it('removes query strings and fragments, where auth tokens travel', () => {
    expect(
      scrubUrl('https://chesshammer.com/reset-password#access_token=abc&type=recovery'),
    ).toBe('https://chesshammer.com/reset-password')
    expect(scrubUrl('https://x.supabase.co/rest/v1/user_stats?user_id=eq.123')).toBe(
      'https://x.supabase.co/rest/v1/user_stats',
    )
    expect(scrubUrl('/sessions/abc')).toBe('/sessions/abc')
  })

  it('drops clicks, typing and console breadcrumbs', () => {
    for (const category of ['ui.click', 'ui.input', 'console']) {
      expect(
        scrubBreadcrumb({ category, message: 'button "marco@example.com"' }),
      ).toBeNull()
    }
  })

  it('scrubs URLs in navigation and request breadcrumbs', () => {
    expect(
      scrubBreadcrumb({
        category: 'navigation',
        data: { from: '/login', to: '/dashboard#access_token=x' },
      }),
    ).toEqual({ category: 'navigation', data: { from: '/login', to: '/dashboard' } })
    expect(
      scrubBreadcrumb({
        category: 'fetch',
        data: { url: 'https://x.supabase.co/rest?a=1', status_code: 200 },
      }),
    ).toEqual({
      category: 'fetch',
      data: { url: 'https://x.supabase.co/rest', status_code: 200 },
    })
  })

  it('strips the page URL fragment and any user from events', () => {
    const event = {
      type: undefined,
      request: {
        url: 'https://chesshammer.com/dashboard#access_token=x',
        cookies: { a: 'b' },
      },
      user: { email: 'marco@example.com' },
    } as unknown as ErrorEvent
    const scrubbed = scrubEvent(event)
    expect(scrubbed.request?.url).toBe('https://chesshammer.com/dashboard')
    expect(scrubbed.request?.cookies).toBeUndefined()
    expect(scrubbed.user).toBeUndefined()
  })
})
