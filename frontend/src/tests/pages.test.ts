/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadPage } from '../pages'

// 1. Configura o ambiente DOM falso antes de cada teste
beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`
  vi.restoreAllMocks() // Limpa mocks anteriores
})

// 2. Função auxiliar para Mockar o fetch (Simular o servidor)
function mockFetch(htmlContent: string) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(htmlContent),
  } as Response)
}

describe('loadPage', () => {
  it('deve carregar o arquivo HTML e injetar dentro da div #app', async () => {
    // Cenário:
    const htmlFalso = '<h1>Conteúdo de Teste</h1>'
    mockFetch(htmlFalso)

    // Ação:
    await loadPage('/pagina-qualquer.html')

    // Verificação:
    // O loadPage cumpriu sua ÚNICA responsabilidade? (Colocar o HTML na tela)
    const app = document.querySelector('#app')
    expect(app?.innerHTML).toBe(htmlFalso)
  })
  
  it('deve logar erro se o fetch falhar', async () => {
    // Mockando erro
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false } as Response)

    await loadPage('/caminho-errado.html')

    expect(consoleSpy).toHaveBeenCalled()
  })
})