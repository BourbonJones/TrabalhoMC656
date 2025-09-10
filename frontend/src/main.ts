import './style.css'
import { loadPage } from './pages.ts'

// Rotas definidas
const routes: Record<string, string> = {
  home: '/src/pages/home.html',
  login: '/src/pages/login.html',      
  register: '/src/pages/register.html',
  ex1: '/src/pages/exercicios/exercicio1.html',
  ex2: '/src/pages/exercicios/exercicio2.html',
  ex3: '/src/pages/exercicios/exercicio3.html',
  ex4: '/src/pages/exercicios/exercicio4.html',
  ex5: '/src/pages/exercicios/exercicio5.html' 
}

// Integração 

// Recupera token do localStorage
function getAuthTokenHeader(): Record<string, string> | undefined {
  const raw = localStorage.getItem('token')
  if (!raw) return undefined
  const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
  return { Authorization: token }
}

// Carregar usuário autenticado no header
async function carregarUsuario(): Promise<void> {
  const headerEl = document.getElementById('user-header')
  if (!headerEl) return

  try {
    const headers = getAuthTokenHeader() ?? {}
    const res = await fetch('/user', { headers })
    if (!res.ok) {
      headerEl.textContent = 'Olá, visitante'
      return
    }
    const data = await res.json()
    const nome = data?.nome ?? 'Visitante'
    headerEl.textContent = `Olá, ${nome}`
  } catch (err) {
    console.error('Erro carregarUsuario:', err)
    headerEl.textContent = 'Olá, visitante'
  }
}

// Marcar progresso de uma fase
async function marcarProgresso(faseId: number): Promise<boolean> {
  const headers = getAuthTokenHeader()
  if (!headers) {
    alert('É necessário estar logado para marcar progresso.')
    return false
  }

  try {
    const res = await fetch(`/fases/progresso/${faseId}`, {
      method: 'POST',
      headers,
    })
    if (!res.ok) return false
    const data = await res.json()
    console.log('Progresso atualizado:', data)
    return true
  } catch (err) {
    console.error('Erro marcarProgresso:', err)
    return false
  }
}

// Após carregar página, aplica integração
async function initIntegracao() {
  await carregarUsuario()

   // Botões de marcar progresso + navegação para página do exercício
  document.querySelectorAll('.btn-marcar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const el = e.currentTarget as HTMLElement
      const idStr = el.getAttribute('data-faseid')
      if (!idStr) return

      const faseId = Number(idStr)
      const ok = await marcarProgresso(faseId)

      if (ok) {
        const page = `ex${faseId}` as keyof typeof routes
        navigate(page) // abre a página do exercício
      }
    })
  })


  // Botão de logout
  const logoutBtn = document.getElementById('btn-logout')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token')
      alert('Você saiu da conta.')
      navigate('login')
    })
  }
}


// Inicializar página de login
async function initLoginPage() {
  const btn = document.getElementById('btn-login')
  const linkReg = document.getElementById('link-register')
  if (linkReg) {
    linkReg.addEventListener('click', () => navigate('register'))
  }
  if (!btn) return

  btn.addEventListener('click', async () => {
    const username = (document.getElementById('username') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement).value

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        alert('Login falhou')
        return
      }

      const data = await res.json()
      localStorage.setItem('token', data.token)
      alert('Login bem-sucedido!')
      navigate('home')
    } catch (err) {
      console.error('Erro no login:', err)
    }
  })
}



// Inicializar página de registro
async function initRegisterPage() {
  const btn = document.getElementById('btn-register')
  const linkLogin = document.getElementById('link-login')
  if (linkLogin) {
    linkLogin.addEventListener('click', () => navigate('login'))
  }
  if (!btn) return

  btn.addEventListener('click', async () => {
    const username = (document.getElementById('reg-username') as HTMLInputElement).value
    const password = (document.getElementById('reg-password') as HTMLInputElement).value

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        alert('Registro falhou')
        return
      }

      alert('Usuário registrado! Agora faça login.')
      navigate('login')
    } catch (err) {
      console.error('Erro no registro:', err)
    }
  })
}



// Função para navegar entre páginas
async function navigate(route: keyof typeof routes) {
  const path = routes[route]
  await loadPage(path)

  if (route === 'home') {
    await initIntegracao()
  } else if (route === 'login') {
    await initLoginPage()
  } else if (route === 'register') {
    await initRegisterPage()
  } else if (route.startsWith('ex')) {
    // adiciona evento no botão voltar
    const backBtn = document.getElementById('back-home')
    if (backBtn) {
      backBtn.addEventListener('click', () => navigate('home'))
    }
  }
}

// Navegação inicial
navigate('home')

// Exemplo de navegação via botões 
// document.querySelector<HTMLButtonElement>('#nav-home')?.addEventListener('click', () => navigate('home'))
