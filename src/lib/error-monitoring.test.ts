import type { ErrorEvent } from '@sentry/react'
import { describe, expect, it } from 'vitest'
import {
  scrubBreadcrumb,
  scrubEvent,
  scrubPath,
  scrubSpan,
  scrubUrl,
} from './error-monitoring'

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

describe('tracing privacy', () => {
  const ID = '5d3e20cf-f7d4-4d28-ae19-8746880b4067'

  it('replaces ids and dates in page names', () => {
    expect(scrubPath(`/sessions/${ID}/summary`)).toBe('/sessions/:id/summary')
    expect(scrubPath(`/sessions/${ID}/day/2026-10-18`)).toBe('/sessions/:id/day/:date')
    expect(scrubPath('/sessions')).toBe('/sessions')
  })

  it('drops the filters of Supabase calls, which carry the user id', () => {
    const span = {
      trace_id: 't',
      span_id: 's',
      name: `GET https://x.supabase.co/rest/v1/user_stats?select=current_elo&user_id=eq.${ID}`,
      start_timestamp: 0,
      status: 'ok' as const,
      is_segment: false,
      attributes: {
        'url.full': `https://x.supabase.co/rest/v1/user_stats?select=current_elo&user_id=eq.${ID}`,
        'http.response.status_code': 200,
        'sentry.op': 'http.client',
      },
    }
    const scrubbed = scrubSpan(span)

    expect(scrubbed.name).toBe('GET https://x.supabase.co/rest/v1/user_stats')
    expect(scrubbed.attributes).toEqual({
      'url.full': 'https://x.supabase.co/rest/v1/user_stats',
      'http.response.status_code': 200,
      'sentry.op': 'http.client',
    })
    expect(JSON.stringify(scrubbed)).not.toContain(ID)
  })

  it('keeps the auth tokens of the page address out of the page load span', () => {
    const span = {
      trace_id: 't',
      span_id: 's',
      name: '/reset-password',
      start_timestamp: 0,
      status: 'ok' as const,
      is_segment: true,
      attributes: {
        'url.full': 'https://chesshammer.com/reset-password#access_token=abc',
      },
    }
    expect(scrubSpan(span).attributes['url.full']).toBe(
      'https://chesshammer.com/reset-password',
    )
  })
})
