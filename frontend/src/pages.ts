// src/pages.ts

// A única responsabilidade desta função é: Buscar o arquivo HTML e Colocar o texto dentro da div #app
export async function loadPage(pagePath: string) {
  try {
    const response = await fetch(pagePath)
    if (!response.ok) throw new Error(`Erro ao carregar ${pagePath}`)
    
    const html = await response.text()
    const app = document.querySelector<HTMLDivElement>('#app')!
    app.innerHTML = html
    
    // NENHUMA lógica de negócio ou criação deve ficar aqui.
  } catch (error) {
    console.error(error)
  }
}