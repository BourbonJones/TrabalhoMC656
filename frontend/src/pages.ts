// src/pages.ts

// A única responsabilidade desta função é: Buscar o arquivo HTML e injetar na div #app
export async function loadPage(pagePath: string) {
  try {
    const response = await fetch(pagePath)
    if (!response.ok) throw new Error(`Erro ao carregar ${pagePath}`)
    
    const html = await response.text()
    const app = document.querySelector<HTMLDivElement>('#app')!
    app.innerHTML = html
    // Lógica de negócio, criação de botões e fetch de usuário foram movidos para o main.ts para respeitar a arquitetura MVC.
    
  } catch (error) {
    console.error(error)
  }
}