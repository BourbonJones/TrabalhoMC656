export async function loadPage(pagePath: string) {
  const response = await fetch(pagePath)
  const html = await response.text()
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = html

  switch (pagePath) {
    case '/src/pages/home.html':
        setupHomePage()
        break

    case '/src/pages/exercicios/exercicio1.html':
        document.querySelector<HTMLButtonElement>('#back-home')?.addEventListener('click', () => loadPage('/src/pages/home.html'))
        break
    case '/src/pages/exercicios/exercicio2.html':
        document.querySelector<HTMLButtonElement>('#back-home')?.addEventListener('click', () => loadPage('/src/pages/home.html'))
        break
    case '/src/pages/exercicios/exercicio3.html':
        document.querySelector<HTMLButtonElement>('#back-home')?.addEventListener('click', () => loadPage('/src/pages/home.html'))
        break
    case '/src/pages/exercicios/exercicio4.html':
        document.querySelector<HTMLButtonElement>('#back-home')?.addEventListener('click', () => loadPage('/src/pages/home.html'))
        break
    case '/src/pages/exercicios/exercicio5.html':
        document.querySelector<HTMLButtonElement>('#back-home')?.addEventListener('click', () => loadPage('/src/pages/home.html'))
        break
  }
}

async function setupHomePage() {
  // Busca o nome do usuário no backend
  document.querySelector('#user-header')!.textContent = 'Olá, .....'
  try {
    const response = await fetch('http://localhost:3000/user') // exemplo backend
    const data = await response.json()
    const nome = data?.nome ?? 'aluno'
    document.querySelector('#user-header')!.textContent = `Olá, ${nome}`
  } catch {
    document.querySelector('#user-header')!.textContent = 'Olá, aluno'
  }

  // Navegação pelos botões de exercício
  document.querySelector<HTMLButtonElement>('#ex1')?.addEventListener('click', () => loadPage('/src/pages/exercicios/exercicio1.html'))
  document.querySelector<HTMLButtonElement>('#ex2')?.addEventListener('click', () => loadPage('/src/pages/exercicios/exercicio2.html'))
  document.querySelector<HTMLButtonElement>('#ex3')?.addEventListener('click', () => loadPage('/src/pages/exercicios/exercicio3.html'))
  document.querySelector<HTMLButtonElement>('#ex4')?.addEventListener('click', () => loadPage('/src/pages/exercicios/exercicio4.html'))
  document.querySelector<HTMLButtonElement>('#ex5')?.addEventListener('click', () => loadPage('/src/pages/exercicios/exercicio5.html'))
}
