import './style.css'
import { loadPage } from './pages.ts'

// Rotas definidas
const routes: Record<string, string> = {
  home: '/src/pages/home.html',
}

// Função para navegar entre páginas
function navigate(route: keyof typeof routes) {
  const path = routes[route]
  loadPage(path)
}

// Navegação inicial
navigate('home')

// Exemplo de navegação via botões 
// document.querySelector<HTMLButtonElement>('#nav-home')?.addEventListener('click', () => navigate('home'))
