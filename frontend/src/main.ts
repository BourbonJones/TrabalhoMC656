import './style.css'
import { loadPage } from './pages.ts'
// Importa a Engine do jogo (certifique-se que o caminho está correto)
import { CircuitGame } from './game/CircuitEngine.ts';

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

// --- Integração e Autenticação ---

function getAuthTokenHeader(): Record<string, string> | undefined {
  const raw = localStorage.getItem('token')
  if (!raw) return undefined
  const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
  return { Authorization: token }
}

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


async function marcarProgresso(faseId: number): Promise<boolean> {
  const headers = getAuthTokenHeader()
  

  if (!headers) {
    alert('Parabéns! Você completou o circuito. (Faça login para salvar seu progresso).')
    return false
  }

  try {
    const res = await fetch(`/fases/progresso/${faseId}`, {
      method: 'POST',
      headers,
    })
    if (!res.ok) return false
    const data = await res.json()
    
    // Feedback visual para o usuário
    alert(`Fase ${faseId} Concluída! Progresso salvo.`)
    console.log('Progresso atualizado:', data)
    return true
  } catch (err) {
    console.error('Erro marcarProgresso:', err)
    return false
  }
}

// --- Inicialização de Páginas ---

async function initIntegracao() {
  await carregarUsuario()

  // Botões
  document.querySelectorAll('.btn-marcar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const el = e.currentTarget as HTMLElement
      const idStr = el.getAttribute('data-faseid')
      if (!idStr) return

      // Navega para o exercício
      const page = `ex${idStr}` as keyof typeof routes
      navigate(page)
    })
  })

  const logoutBtn = document.getElementById('btn-logout')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token')
      alert('Você saiu da conta.')
      navigate('login')
    })
  }
}

async function initLoginPage() {
  const btn = document.getElementById('btn-login')
  const linkReg = document.getElementById('link-register')
  if (linkReg) linkReg.addEventListener('click', () => navigate('register'))
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

async function initRegisterPage() {
  const btn = document.getElementById('btn-register')
  const linkLogin = document.getElementById('link-login')
  if (linkLogin) linkLogin.addEventListener('click', () => navigate('login'))
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

// --- Configuração dos Níveis ---

function initLevel(levelId: number) {
    const container = document.getElementById('game-board');
    if (!container) return;

    const onWin = () => marcarProgresso(levelId);

    // Função auxiliar para redimensionar a caixa dinamicamente
    const setBoardWidth = (width: number) => {
        container.style.width = `${width}px`;
        container.style.maxWidth = '100%';
    };

    switch (levelId) {
        case 1: // FASE 1: Porta NOT
            setBoardWidth(600);
            
            new CircuitGame('game-board', {
                components: [
                    { id: 'in1', type: 'INPUT', x: 50, y: 225, inputs: [], state: true }, 
                    // Centralizado em 600px
                    { id: 'not1', type: 'NOT', x: 275, y: 225, inputs: ['in1'], state: false },
                    // Saída no final da caixa pequena
                    { id: 'out1', type: 'OUTPUT', x: 500, y: 225, inputs: ['not1'], state: false }
                ],
                wires: [
                    { from: 'in1', to: 'not1' },
                    { from: 'not1', to: 'out1' }
                ]
            }, onWin);
            break;

        case 2: // FASE 2: Porta AND
            
            setBoardWidth(700);
            
            new CircuitGame('game-board', {
                components: [
                    { id: 'in1', type: 'INPUT', x: 50, y: 150, inputs: [], state: false },
                    { id: 'in2', type: 'INPUT', x: 50, y: 300, inputs: [], state: false },
                    { id: 'and1', type: 'AND', x: 350, y: 225, inputs: ['in1', 'in2'], state: false },
                    { id: 'out1', type: 'OUTPUT', x: 600, y: 225, inputs: ['and1'], state: false }
                ],
                wires: [
                    { from: 'in1', to: 'and1' },
                    { from: 'in2', to: 'and1' },
                    { from: 'and1', to: 'out1' }
                ]
            }, onWin);
            break;

        case 3: // FASE 3: Porta OR
            
            setBoardWidth(700);

            new CircuitGame('game-board', {
                components: [
                    { id: 'in1', type: 'INPUT', x: 50, y: 150, inputs: [], state: false },
                    { id: 'in2', type: 'INPUT', x: 50, y: 300, inputs: [], state: false },
                    { id: 'or1', type: 'OR', x: 350, y: 225, inputs: ['in1', 'in2'], state: false },
                    { id: 'out1', type: 'OUTPUT', x: 600, y: 225, inputs: ['or1'], state: false }
                ],
                wires: [
                    { from: 'in1', to: 'or1' },
                    { from: 'in2', to: 'or1' },
                    { from: 'or1', to: 'out1' }
                ]
            }, onWin);
            break;

        case 4: // FASE 4: Combinado
            
            setBoardWidth(850);

            new CircuitGame('game-board', {
                components: [
                    { id: 'in1', type: 'INPUT', x: 50, y: 150, inputs: [], state: true },
                    { id: 'in2', type: 'INPUT', x: 50, y: 300, inputs: [], state: true },
                    { id: 'and1', type: 'AND', x: 300, y: 225, inputs: ['in1', 'in2'], state: false },
                    { id: 'not1', type: 'NOT', x: 550, y: 225, inputs: ['and1'], state: false },
                    { id: 'out1', type: 'OUTPUT', x: 750, y: 225, inputs: ['not1'], state: false }
                ],
                wires: [
                    { from: 'in1', to: 'and1' },
                    { from: 'in2', to: 'and1' },
                    { from: 'and1', to: 'not1' },
                    { from: 'not1', to: 'out1' }
                ]
            }, onWin);
            break;

        case 5: // FASE 5: Desafio
            
            setBoardWidth(950);

            // Definição de colunas fixas para facilitar o layout
            const C1 = 60;  // Entradas
            const C2 = 320; // Primeira Porta (OR)
            const C3 = 600; // Segunda Porta (AND)
            const C4 = 850; // Saída

            new CircuitGame('game-board', {
                components: [
                    // Coluna 1: Entradas A, B, C
                    { id: 'inA', type: 'INPUT', x: C1, y: 80, inputs: [], state: false },
                    { id: 'inB', type: 'INPUT', x: C1, y: 200, inputs: [], state: false },
                    { id: 'inC', type: 'INPUT', x: C1, y: 400, inputs: [], state: false },
                    // Coluna 2: OR (Recebe A e B)
                    { id: 'or1', type: 'OR', x: C2, y: 140, inputs: ['inA', 'inB'], state: false },
                    // Coluna 3: AND (Recebe OR e C)
                    { id: 'and1', type: 'AND', x: C3, y: 270, inputs: ['or1', 'inC'], state: false },
                    // Coluna 4: Saída
                    { id: 'out1', type: 'OUTPUT', x: C4, y: 270, inputs: ['and1'], state: false }
                ],
                wires: [
                    { from: 'inA', to: 'or1' },
                    { from: 'inB', to: 'or1' },
                    { from: 'inC', to: 'and1' },
                    { from: 'or1', to: 'and1' },
                    { from: 'and1', to: 'out1' }
                ]
            }, onWin);
            break;
    }

}

// --- Navegação ---

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
    // 1. Configura botão voltar
    const backBtn = document.getElementById('back-home')
    if (backBtn) backBtn.addEventListener('click', () => navigate('home'))
    
    // 2. Identifica qual exercício é (ex1 -> 1, ex2 -> 2)
    const levelId = parseInt(route.replace('ex', ''));
    
    // 3. Inicializa o jogo correspondente
    initLevel(levelId);
  }
}

// Navegação inicial
navigate('home')