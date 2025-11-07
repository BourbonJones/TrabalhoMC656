/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadPage } from '.././pages'
import { waitFor } from '@testing-library/dom'
// cria um container fake para injetar as páginas
beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`
})

// mock do fetch


function mockFetchOnce(map: Record<string, string | object>) {
  globalThis.fetch = vi.fn((url: string) => {
    const response = map[url]
    if (!response) throw new Error(`No mock for ${url}`)

    return Promise.resolve({
      text: () =>
        Promise.resolve(typeof response === 'string' ? response : JSON.stringify(response)),
      json: () =>
        Promise.resolve(typeof response === 'object' ? response : { nome: 'aluno' }),
    } as Response)
  }) as any
}


describe('loadPage', () => {
  it('mostra o nome do usuário vindo do backend', async () => {
  mockFetchOnce({
    '/src/pages/home.html': `
      <div>
        <header id="user-header"></header>
        <div id="exercise-list" class="exercise-list"></div>
      </div>
    `,
    'http://localhost:3000/user': { nome: 'Andre' }
  })

  await loadPage('/src/pages/home.html')

  await waitFor(() => {
    expect(document.querySelector('#user-header')?.textContent).toBe('Olá, Andre')
  })
})
 }
)

