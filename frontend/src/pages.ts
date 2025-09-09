import { setupCounter } from './counter.ts'

// Função para carregar páginas dinamicamente
export async function loadPage(pagePath: string) {
  const response = await fetch(pagePath)
  const html = await response.text()
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = html

  // Setup das paginas, caso necessário
  switch (pagePath) {
    case '/src/pages/home.html':
      const counterButton = document.querySelector<HTMLButtonElement>('#counter')
      if (counterButton) setupCounter(counterButton)
      break
  }
}
