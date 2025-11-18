// Definição dos tipos de portas
type GateType = 'AND' | 'OR' | 'NOT' | 'INPUT' | 'OUTPUT';

interface Component {
  id: string;
  type: GateType;
  x: number;
  y: number;
  inputs: string[]; 
  state: boolean;   
}

interface LevelConfig {
  components: Component[];
  wires: { from: string, to: string }[];
}

export class CircuitGame {
  private container: HTMLElement;
  private components: Map<string, Component> = new Map();
  private svgContainer: SVGSVGElement;
  private onWin: () => void;

  constructor(containerId: string, levelConfig: LevelConfig, onWin: () => void) {
    this.onWin = onWin;
    const el = document.getElementById(containerId);
    if (!el) throw new Error("Container não encontrado");
    this.container = el;
    
    // Limpa o container
    this.container.innerHTML = '';

    // Cria camada SVG para os fios (ficará por baixo das portas)
    this.svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgContainer.style.width = "100%";
    this.svgContainer.style.height = "100%";
    this.svgContainer.style.position = "absolute";
    this.svgContainer.style.top = "0";
    this.svgContainer.style.left = "0";
    this.container.appendChild(this.svgContainer);

    // Carrega configuração
    levelConfig.components.forEach(c => this.components.set(c.id, { ...c }));
    
    this.render(levelConfig);
    this.updateLogic(); 
  }

  private render(config: LevelConfig) {
    // 1. Renderizar Fios
    config.wires.forEach(wire => {
      const fromComp = this.components.get(wire.from)!;
      const toComp = this.components.get(wire.to)!;
      
      // Cria linha SVG
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const pathD = `M ${fromComp.x + 50} ${fromComp.y + 25} L ${toComp.x} ${toComp.y + 25}`;
      
      line.setAttribute("d", pathD);
      line.classList.add("wire");
      line.id = `wire-${wire.from}-${wire.to}`;
      this.svgContainer.appendChild(line);
    });

    // 2. Renderizar Componentes
    this.components.forEach(comp => {
      const div = document.createElement("div");
      div.className = `component ${comp.type.toLowerCase()}`;
      div.style.position = "absolute";
      div.style.left = `${comp.x}px`;
      div.style.top = `${comp.y}px`;
      div.style.width = "50px"; 
      div.style.height = "50px";
      
      // Desenha o ícone baseado no tipo
      div.innerHTML = this.getGateIcon(comp.type);

      // Adiciona evento de clique se for INPUT
      if (comp.type === 'INPUT') {
        div.addEventListener('click', () => {
          comp.state = !comp.state;
          this.updateLogic();
        });
        div.classList.add('input-node');
      }

      div.id = `comp-${comp.id}`;
      this.container.appendChild(div);
    });
  }

  private getGateIcon(type: GateType): string {
    // Retorna o SVG Inline do ícone.
    if (type === 'AND') return `<svg viewBox="0 0 50 50"><path d="M0,0 V50 H25 A25,25 0 0,0 25,0 Z" fill="#444" stroke="white"/></svg>`;
    if (type === 'OR') return `<svg viewBox="0 0 50 50"><path d="M0,0 V50 Q25,25 50,25 Q25,25 0,0 Z" fill="#444" stroke="white"/></svg>`; // Exemplo tosco, pegue um SVG real
    if (type === 'INPUT') return `<svg viewBox="0 0 50 50"><rect width="50" height="50" fill="inherit" stroke="inherit"/></svg>`;
    if (type === 'OUTPUT') return `<div class="output-node"></div>`;
    
    return `<span>${type}</span>`;
  }

  // Lógica Recursiva para calcular o estado
  private updateLogic() {
    // 1. Recalcula estados
    this.components.forEach(comp => {
      if (comp.type !== 'INPUT') {
        const inputStates = comp.inputs.map(id => this.components.get(id)?.state ?? false);
        
        if (comp.type === 'AND') comp.state = inputStates.every(s => s);
        else if (comp.type === 'OR') comp.state = inputStates.some(s => s);
        else if (comp.type === 'NOT') comp.state = !inputStates[0];
        else if (comp.type === 'OUTPUT') comp.state = inputStates[0];
      }
    });

    // 2. Atualiza Visual (DOM)
    this.updateVisuals();
  }

  private updateVisuals() {
    this.components.forEach(comp => {
      // Atualiza cor do componente (ex: input ligado)
      const el = document.getElementById(`comp-${comp.id}`);
      if (comp.state) el?.classList.add('on');
      else el?.classList.remove('on');

      const wires = this.svgContainer.querySelectorAll(`[id^="wire-${comp.id}-"]`);
      wires.forEach(wire => {
        if (comp.state) wire.classList.add('on');
        else wire.classList.remove('on');
      });
      
      // Verifica vitória (se OUTPUT estiver ligado)
      if (comp.type === 'OUTPUT' && comp.state === true) {
        // Pequeno delay para usuário ver a luz acender
        setTimeout(() => this.checkWin(), 100);
      }
    });
  }

  private checkWin() {
     //  OUTPUT está true (ligado)
     console.log("Fase concluída!");
     
     // Chama a função que o main.ts passou
     if (this.onWin) {
        this.onWin(); 
    }
  }
}