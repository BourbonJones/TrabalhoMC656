export async function loadPage(pagePath: string) {
  const response = await fetch(pagePath)
  const html = await response.text()
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = html

  if (pagePath === '/src/pages/home.html') {
    setupHomePage()
    return
  }

  if (pagePath.startsWith('/src/pages/exercicios/')) {
    document
      .querySelector<HTMLButtonElement>('#back-home')
      ?.addEventListener('click', () => loadPage('/src/pages/home.html'))
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

  // Mudar no futuro o valor 5 para aceitar dinamicamente
  const exerciseList = document.querySelector<HTMLDivElement>('#exercise-list')!
  const totalExercicios = 5 // <-- mude aqui se quiser mais ou menos

  for (let i = 1; i <= totalExercicios; i++) {
    const btn = document.createElement('button')
    btn.className = 'btn-marcar'
    btn.dataset.faseid = String(i)
    btn.textContent = `Exercício ${i}`
    btn.addEventListener('click', () =>
      loadPage(`/src/pages/exercicios/exercicio${i}.html`)
    )
    exerciseList.appendChild(btn)
  }
}
