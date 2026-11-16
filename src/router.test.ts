import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const trackPageview = vi.hoisted(() => vi.fn())
vi.mock('./analytics', () => ({ trackPageview }))

// The router reads the URL when it loads, so each test imports a fresh copy.
async function loadRouterAt(url: string) {
  window.history.replaceState(null, '', url)
  vi.resetModules()
  return import('./router')
}

describe('parse', () => {
  it('reads the Pede assim index', async () => {
    const { parse } = await loadRouterAt('/')
    expect(parse('/pede-assim')).toEqual({ screen: 'pede-assim', anchor: '', instruction: '' })
    expect(parse('/pede-assim/')).toEqual({ screen: 'pede-assim', anchor: '', instruction: '' })
  })

  it('reads one situation, with or without a trailing slash', async () => {
    const { parse } = await loadRouterAt('/')
    const expected = { screen: 'pede-assim', anchor: '', instruction: 'check-out-mais-tarde' }
    expect(parse('/pede-assim/check-out-mais-tarde')).toEqual(expected)
    expect(parse('/pede-assim/check-out-mais-tarde/')).toEqual(expected)
  })

  it('passes an unknown slug through, for the Pede assim screen to handle', async () => {
    const { parse } = await loadRouterAt('/')
    expect(parse('/pede-assim/nao-existe')).toEqual({ screen: 'pede-assim', anchor: '', instruction: 'nao-existe' })
  })

  it('leaves the other screens unchanged', async () => {
    const { parse } = await loadRouterAt('/')
    expect(parse('/')).toEqual({ screen: 'home', anchor: '', instruction: '' })
    expect(parse('/mensagens#cedo')).toEqual({ screen: 'messages', anchor: 'cedo', instruction: '' })
    expect(parse('/obrigado')).toEqual({ screen: 'thanks', anchor: '', instruction: '' })
    expect(parse('/pede-assim-x')).toEqual({ screen: 'home', anchor: '', instruction: '' })
  })
})

describe('useLocation', () => {
  it('starts on the situation in the URL', async () => {
    const { useLocation } = await loadRouterAt('/pede-assim/como-chegar')
    const { result } = renderHook(() => useLocation())
    expect(result.current).toMatchObject({ screen: 'pede-assim', instruction: 'como-chegar', cause: 'initial' })
  })

  it('counts a pageview for each situation opened from the index', async () => {
    const { navigate, useLocation } = await loadRouterAt('/pede-assim')
    trackPageview.mockClear()
    renderHook(() => useLocation())
    expect(trackPageview).toHaveBeenCalledTimes(1)

    act(() => navigate('/pede-assim/como-chegar'))
    act(() => navigate('/pede-assim'))
    expect(trackPageview).toHaveBeenCalledTimes(3)
  })
})
