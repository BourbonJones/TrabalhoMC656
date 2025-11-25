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

function showVictoryModal(faseId: number) {
  // cria o overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // se tem próxima fase
  const hasNextLevel = faseId < 5;

  // HTML do Modal
  overlay.innerHTML = `
    <div class="modal-box">
      <span class="modal-icon">🎉</span>
      <h2 class="modal-title">Fase ${faseId} Concluída!</h2>
      <p class="modal-text">Parabéns! Você dominou a lógica deste circuito.</p>
      
      <div class="modal-buttons">
        <button id="modal-btn-menu" class="btn-modal btn-menu">Menu</button>
        ${hasNextLevel ? `<button id="modal-btn-next" class="btn-modal btn-next">Próxima Fase ➔</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  // Botão Menu
  document.getElementById('modal-btn-menu')?.addEventListener('click', () => {
    document.body.removeChild(overlay);
    navigate('home');
  });

  // Botão Próxima Fase
  if (hasNextLevel) {
    document.getElementById('modal-btn-next')?.addEventListener('click', () => {
      document.body.removeChild(overlay); 
      const nextLevel = `ex${faseId + 1}` as keyof typeof routes;
      navigate(nextLevel);
    });
  }
}

async function marcarProgresso(faseId: number): Promise<boolean> {
  const headers = getAuthTokenHeader()
  
  // Se for visitante, mostra o modal mas avisa no console
  if (!headers) {
    console.log('Visitante: Progresso não salvo no banco.');
    showVictoryModal(faseId); // CHAMA O MODAL
    return false
  }

  try {
    const res = await fetch(`/fases/progresso/${faseId}`, {
      method: 'POST',
      headers,
    })
    
    // Mesmo se der erro no save (ex: internet), mostramos a vitória para não frustrar
    if (!res.ok) {
        console.warn('Erro ao salvar progresso no servidor');
    } else {
        const data = await res.json();
        console.log('Progresso atualizado:', data);
    }
    
    // Mostra a vitória bonita
    showVictoryModal(faseId); // CHAMA O MODAL
    
    return true
  } catch (err) {
    console.error('Erro marcarProgresso:', err)
    showVictoryModal(faseId); 
    return false
  }
}

// --- Inicialização de Páginas e UI Dinâmica ---

// Esta função encapsula a criação da UI, resolvendo o Code Smell de duplicação no HTML
function renderizarBotoesFases() {
  const listContainer = document.getElementById('exercise-list');
  
  
  if (!listContainer) return; 

  // Limpa lista anterior
  listContainer.innerHTML = ''; 

  
  const totalFases = 5; 

  for (let i = 1; i <= totalFases; i++) {
    
    const btn = document.createElement('button');
    btn.className = 'btn-marcar';
    btn.textContent = `Nível ${i}`; 
    
    
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
  await carregarUsuario(); 
  renderizarBotoesFases(); 

  // --- Lógica do Header ---
  const btnLogout = document.getElementById('btn-logout');
  const btnProfile = document.getElementById('btn-profile'); 
  const token = localStorage.getItem('token');

  // Configura Botão Sair/Login
  if (btnLogout) {
    if (token) {
      btnLogout.textContent = 'Sair';
      btnLogout.onclick = () => {
        localStorage.removeItem('token');
        navigate('login');
      };
    } else {
      btnLogout.textContent = 'Fazer Login';
      btnLogout.onclick = () => navigate('login');
    }
  }

  // Configura Botão Perfil
  if (btnProfile) {
    if (token) {
      btnProfile.style.display = 'inline-block'; 
      btnProfile.onclick = () => abrirModalPerfil();
    } else {
      btnProfile.style.display = 'none'; // Esconde troféu se for visitante
    }
  }
}

//  Modal de Perfi
async function abrirModalPerfil() {
  const headers = getAuthTokenHeader();
  if (!headers) return;

  try {
    // Busca dados do usuário e progresso
    const userRes = await fetch('/user', { headers });
    const userData = await userRes.json();
    
    const progRes = await fetch('/fases/progresso', { headers });
    const progData = await progRes.json(); 
    
    // Lista de IDs concluídos
    const niveisFeitos: number[] = progData.completedLevels || [];
    
    // Configuração de Pontos por Fase
    const tabelaDePontos: Record<number, number> = {
        1: 100,
        2: 100,
        3: 100,
        4: 200, 
        5: 300  // Desafio vale muito mais
    };

    // CALCULA OS PONTOS (Soma baseada na tabela)
    
    const pontos = niveisFeitos.reduce((total, faseId) => {
        const valorDaFase = tabelaDePontos[faseId] || 0;
        return total + valorDaFase;
    }, 0);

    const totalNiveis = 5;

    let badgesHtml = '';
    for (let i = 1; i <= totalNiveis; i++) {
        const conquistado = niveisFeitos.includes(i);
        const valor = tabelaDePontos[i];
        badgesHtml += `
            <div class="badge ${conquistado ? 'earned' : ''}" title="Nível ${i} (${valor} XP)">
                ${i}
            </div>
        `;
    }

    // 4. Cria o Modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    overlay.innerHTML = `
      <div class="modal-box" style="border-color: #646cff; box-shadow: 0 0 20px rgba(100, 108, 255, 0.3);">
        <span class="modal-icon">👤</span>
        <h2 class="modal-title">${userData.nome}</h2>
        <p class="modal-text">Resumo do seu desempenho</p>
        
        <div class="profile-grid">
            <div class="stat-box">
                <span class="stat-value" style="color: #646cff">${pontos}</span>
                <span class="stat-label">Pontos XP</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${niveisFeitos.length}/${totalNiveis}</span>
                <span class="stat-label">Fases</span>
            </div>
        </div>

        <div class="badges-container">
            ${badgesHtml}
        </div>
        
        <p style="font-size: 0.8rem; color: #666; margin-top: 10px;">
           Níveis 1-3: 100xp | Nível 4: 200xp | Nível 5: 300xp
        </p>

        <div style="margin-top: 25px;">
          <button id="btn-close-profile" class="btn-modal btn-menu">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-close-profile')?.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

  } catch (err) {
    console.error('Erro ao abrir perfil', err);
    alert('Erro ao carregar perfil.');
  }
}

/* Logica para o login */
async function initLoginPage() {
  const btn = document.getElementById('btn-login')
  const btnGuest = document.getElementById('btn-guest') 
  const linkReg = document.getElementById('link-register')

  // Navegação para registro
  if (linkReg) linkReg.addEventListener('click', () => navigate('register'))
  
  // Visitante ( vai para a Home sem token)
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

    const setBoardWidth = (width: number) => {
        container.style.width = `${width}px`;
        container.style.maxWidth = '100%';
    };

    switch (levelId) {
        case 1: // FASE 1: Porta NOT
            setBoardWidth(600);
            new CircuitGame('game-board', {
                inputLabels: ['A'],
                outputLabels: ['S'], 
                truthTable: [
                    { inputs: [0], outputs: [1] }, 
                    { inputs: [1], outputs: [0] }
                ],
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
                inputLabels: ['A', 'B'],
                outputLabels: ['S'],
                truthTable: [
                    { inputs: [0, 0], outputs: [0] },
                    { inputs: [0, 1], outputs: [0] },
                    { inputs: [1, 0], outputs: [0] },
                    { inputs: [1, 1], outputs: [1] }
                ],
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
                inputLabels: ['A', 'B'],
                outputLabels: ['S'],
                truthTable: [
                    { inputs: [0, 0], outputs: [0] },
                    { inputs: [0, 1], outputs: [1] },
                    { inputs: [1, 0], outputs: [1] },
                    { inputs: [1, 1], outputs: [1] }
                ],
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

        case 4: // FASE 4: Combinado (NAND)
            
            setBoardWidth(850);
            new CircuitGame('game-board', {
                inputLabels: ['A', 'B'],
                // A AND B (Intermediária) e NOT (Final)
                outputLabels: ['A AND B', 'Final (S)'], 
                truthTable: [
                    // Inputs | Intermediaria (AND) | Final (NOT da Intermediaria)
                    { inputs: [0, 0], outputs: [0, 1] },
                    { inputs: [0, 1], outputs: [0, 1] },
                    { inputs: [1, 0], outputs: [0, 1] },
                    { inputs: [1, 1], outputs: [1, 0] } 
                ],
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

        case 5: // FASE 5: Desafio (A OR B) AND C
            setBoardWidth(950);
            const C1 = 60; const C2 = 320; const C3 = 600; const C4 = 850;
            
            
            // Coluna 1 (Intermediária): A OR B
            // Coluna 2 (Final): (A OR B) AND C
            new CircuitGame('game-board', {
                inputLabels: ['A', 'B', 'C'],
                outputLabels: ['A OR B', 'Final (S)'],
                truthTable: [
                    // A, B, C | (A OR B) | Final
                    { inputs: [0, 0, 0], outputs: [0, 0] },
                    { inputs: [0, 0, 1], outputs: [0, 0] }, 
                    { inputs: [0, 1, 0], outputs: [1, 0] }, 
                    { inputs: [0, 1, 1], outputs: [1, 1] }, 
                    { inputs: [1, 0, 0], outputs: [1, 0] },
                    { inputs: [1, 0, 1], outputs: [1, 1] },
                    { inputs: [1, 1, 0], outputs: [1, 0] },
                    { inputs: [1, 1, 1], outputs: [1, 1] },
                ],
                components: [
                    { id: 'inA', type: 'INPUT', x: C1, y: 80, inputs: [], state: false },
                    { id: 'inB', type: 'INPUT', x: C1, y: 200, inputs: [], state: false },
                    { id: 'inC', type: 'INPUT', x: C1, y: 400, inputs: [], state: false },
                    { id: 'or1', type: 'OR', x: C2, y: 140, inputs: ['inA', 'inB'], state: false },
                    { id: 'and1', type: 'AND', x: C3, y: 270, inputs: ['or1', 'inC'], state: false },
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
  
  // Carrega o HTML
  await loadPage(path)

  // Executa a Lógica 
  if (route === 'home') {
    // O await aqui garante que o HTML já existe antes de tentarmos criar os botões
    await initIntegracao() 
  } else if (route === 'login') {
    await initLoginPage()
  } else if (route === 'register') {
    await initRegisterPage()
  } else if (route.startsWith('ex')) {
    // botão voltar
    const backBtn = document.getElementById('back-home')
    if (backBtn) backBtn.addEventListener('click', () => navigate('home'))
    
    // Identifica qual exercício é e inicializa
    const levelId = parseInt(route.replace('ex', ''));
    initLevel(levelId);
  }
}

// Navegação inicial
function startApp() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Se já tem token salvo, vai direto pra Home 
    navigate('home');
  } else {
    // Se não tem, manda para o Login
    navigate('login');
  }
}

startApp();