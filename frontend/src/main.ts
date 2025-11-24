import './style.css'
import { loadPage } from './pages.ts'
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

// --- Inicialização de Páginas e UI Dinâmica ---

// Esta função encapsula a criação da UI, resolvendo o Code Smell de duplicação no HTML
function renderizarBotoesFases() {
  const listContainer = document.getElementById('exercise-list');
  
  // Guard Clause: Se não estiver na home (não achou a lista), aborta.
  if (!listContainer) return; 

  // Limpa lista anterior (Idempotência)
  listContainer.innerHTML = ''; 

  // DEFINIÇÃO DINÂMICA: Aqui você controla o tamanho da lista num único lugar
  const totalFases = 5; 

  for (let i = 1; i <= totalFases; i++) {
    // Criação do elemento no DOM (Melhor que string concat)
    const btn = document.createElement('button');
    btn.className = 'btn-marcar';
    btn.textContent = `Nível ${i}`; // Texto dinâmico
    
    // Injeção de Dependência (O botão já nasce sabendo o que fazer)
    btn.addEventListener('click', () => {
       // Verifica se a rota existe antes de navegar
       const routeKey = `ex${i}`;
       if (routeKey in routes) {
           navigate(routeKey as keyof typeof routes);
       } else {
           alert('Nível em desenvolvimento');
       }
    });

    listContainer.appendChild(btn);
  }
}

async function initIntegracao() {
  // 1. Carrega dados do usuário (Nome ou "Visitante")
  await carregarUsuario(); 
  
  // 2. Renderiza a lista de exercícios
  renderizarBotoesFases(); 

  // 3. Lógica Inteligente do Botão do Topo
  const btnHeader = document.getElementById('btn-logout');
  
  if (btnHeader) {
    // Verificamos se o usuário está logado
    const token = localStorage.getItem('token');

    if (token) {
      // --- CENÁRIO: LOGADO ---
      btnHeader.textContent = 'Sair';
      btnHeader.onclick = () => {
        localStorage.removeItem('token');
        navigate('login');
      };
    } else {
      // --- CENÁRIO: VISITANTE ---
      btnHeader.textContent = 'Fazer Login';
      btnHeader.onclick = () => {
        navigate('login');
      };
    }
  }
}

/* Logica para o login */
async function initLoginPage() {
  const btn = document.getElementById('btn-login')
  const btnGuest = document.getElementById('btn-guest') // Pegar o novo botão
  const linkReg = document.getElementById('link-register')

  // Navegação para registro
  if (linkReg) linkReg.addEventListener('click', () => navigate('register'))
  
  // Lógica do Visitante (Simplesmente vai para a Home sem token)
  if (btnGuest) {
    btnGuest.addEventListener('click', () => {
      // Remove qualquer token antigo para garantir estado de visitante limpo
      localStorage.removeItem('token'); 
      navigate('home');
    })
  }

  if (!btn) return

  // Lógica de Login (Autenticado)
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
        alert('Login falhou: Verifique usuário e senha')
        return
      }

      const data = await res.json()
      localStorage.setItem('token', data.token)
      // alert('Login bem-sucedido!') // Opcional: remover para ficar mais fluido
      navigate('home')
    } catch (err) {
      console.error('Erro no login:', err)
      alert('Erro de conexão com o servidor')
    }
  })
}

async function initRegisterPage() {
  const btn = document.getElementById('btn-register')
  const btnBack = document.getElementById('link-login') // Botão de voltar

  // Configura o botão "Voltar"
  if (btnBack) {
    btnBack.addEventListener('click', () => navigate('login'))
  }

  if (!btn) return

  // Lógica do Cadastro
  btn.addEventListener('click', async () => {
    const username = (document.getElementById('reg-username') as HTMLInputElement).value
    const password = (document.getElementById('reg-password') as HTMLInputElement).value

    if (!username || !password) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        alert('Erro: Usuário já existe ou dados inválidos.')
        return
      }

      alert('Conta criada com sucesso! Faça login.')
      navigate('login')
    } catch (err) {
      console.error('Erro no registro:', err)
      alert('Erro de conexão.')
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
                    { id: 'not1', type: 'NOT', x: 275, y: 225, inputs: ['in1'], state: false },
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
  
  // 1. Carrega o HTML (View)
  await loadPage(path)

  // 2. Executa a Lógica (Controller)
  if (route === 'home') {
    // O await aqui garante que o HTML já existe antes de tentarmos criar os botões
    await initIntegracao() 
  } else if (route === 'login') {
    await initLoginPage()
  } else if (route === 'register') {
    await initRegisterPage()
  } else if (route.startsWith('ex')) {
    // 1. Configura botão voltar
    const backBtn = document.getElementById('back-home')
    if (backBtn) backBtn.addEventListener('click', () => navigate('home'))
    
    // 2. Identifica qual exercício é e inicializa
    const levelId = parseInt(route.replace('ex', ''));
    initLevel(levelId);
  }
}

// Navegação inicial
function startApp() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Se já tem token salvo, vai direto pra Home (experiência de app nativo)
    navigate('home');
  } else {
    // Se não tem, manda para o Login
    navigate('login');
  }
}

startApp();