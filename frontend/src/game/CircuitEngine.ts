// Tipos
type GateType = 'AND' | 'OR' | 'NOT' | 'INPUT' | 'OUTPUT';

interface Component {
  id: string;
  type: GateType;
  x: number;
  y: number;
  inputs: string[];
  state: boolean;
}

// Outputs é um array de número
export interface TruthTableRow {
  inputs: number[]; 
  outputs: number[];   
}

interface LevelConfig {
  components: Component[];
  wires: { from: string, to: string }[];
  inputLabels: string[];  
  outputLabels: string[];
  truthTable: TruthTableRow[];
}

export class CircuitGame {
  private container: HTMLElement;
  private components: Map<string, Component> = new Map();
  private svgContainer: SVGSVGElement;
  private onWin: () => void;
  private tableConfig: TruthTableRow[];
  private inputLabels: string[];
  private outputLabels: string[];

  constructor(containerId: string, levelConfig: LevelConfig, onWin: () => void) {
    const rootEl = document.getElementById(containerId);
    if (!rootEl) throw new Error("Container não encontrado");
    
    rootEl.innerHTML = '';
    
    const gameWrapper = document.createElement('div');
    gameWrapper.className = 'game-container';
    rootEl.appendChild(gameWrapper);

    // Área do Circuito
    const circuitArea = document.createElement('div');
    circuitArea.className = 'circuit-area';
    this.container = circuitArea;
    
    this.svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgContainer.style.width = "100%";
    this.svgContainer.style.height = "100%";
    this.svgContainer.style.position = "absolute";
    this.svgContainer.style.top = "0";
    this.svgContainer.style.left = "0";
    this.svgContainer.style.zIndex = "1";
    this.container.appendChild(this.svgContainer);
    
    gameWrapper.appendChild(this.container);

    // Configuração da Tabela
    this.tableConfig = levelConfig.truthTable;
    this.inputLabels = levelConfig.inputLabels;
    this.outputLabels = levelConfig.outputLabels;
    
    this.renderTruthTable(gameWrapper);

    this.onWin = onWin;
    levelConfig.components.forEach(c => this.components.set(c.id, { ...c }));
    this.renderCircuit(levelConfig);
    this.updateLogic();
  }

  private renderCircuit(config: LevelConfig) {
    config.wires.forEach(wire => {
      const fromComp = this.components.get(wire.from)!;
      const toComp = this.components.get(wire.to)!;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const pathD = `M ${fromComp.x + 50} ${fromComp.y + 25} L ${toComp.x} ${toComp.y + 25}`;
      line.setAttribute("d", pathD);
      line.classList.add("wire");
      line.id = `wire-${wire.from}-${wire.to}`;
      this.svgContainer.appendChild(line);
    });

    this.components.forEach(comp => {
      const div = document.createElement("div");
      div.className = `component ${comp.type.toLowerCase()}`;
      div.style.left = `${comp.x}px`;
      div.style.top = `${comp.y}px`;
      div.style.width = "50px"; 
      div.style.height = "50px";
      div.innerHTML = this.getGateIcon(comp.type);

      if (comp.type === 'INPUT') {
        const index = Array.from(this.components.values())
            .filter(c => c.type === 'INPUT')
            .indexOf(comp);
        
        const label = document.createElement('div');
        label.innerText = this.inputLabels[index] || '';
        label.style.position = 'absolute';
        label.style.top = '-25px';
        label.style.color = '#fff';
        label.style.fontWeight = 'bold';
        div.appendChild(label);

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

  private renderTruthTable(parent: HTMLElement) {
    const container = document.createElement('div');
    container.className = 'truth-table-container';

    const table = document.createElement('table');
    table.className = 'truth-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Cabeçalhos de Entrada (Fixos)
    this.inputLabels.forEach(label => {
      const th = document.createElement('th');
      th.innerText = label;
      headerRow.appendChild(th);
    });

    //  Cabeçalhos de Saída (Múltiplos)
    this.outputLabels.forEach(label => {
      const th = document.createElement('th');
      th.innerText = label;
      th.style.borderLeft = "2px solid #555"; 
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    
    this.tableConfig.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      
      // Colunas de Input 
      row.inputs.forEach(val => {
        const td = document.createElement('td');
        td.innerText = String(val);
        tr.appendChild(td);
      });

      
      // O loop baseado no tamanho de outputLabels
      this.outputLabels.forEach((_, colIndex) => {
        const tdOut = document.createElement('td');
        tdOut.style.borderLeft = "2px solid #555";
        
        const select = document.createElement('select');
        select.className = 'truth-select';
      
        select.dataset.row = String(rowIndex);
        select.dataset.col = String(colIndex);
        
        const optDefault = document.createElement('option');
        optDefault.value = ''; optDefault.innerText = '?';
        const opt0 = document.createElement('option');
        opt0.value = '0'; opt0.innerText = '0';
        const opt1 = document.createElement('option');
        opt1.value = '1'; opt1.innerText = '1';
        
        select.appendChild(optDefault);
        select.appendChild(opt0);
        select.appendChild(opt1);
        
        tdOut.appendChild(select);
        tr.appendChild(tdOut);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    const btn = document.createElement('button');
    btn.id = 'btn-check';
    btn.innerText = 'Validar Tabela Verdade';
    btn.onclick = () => this.checkTable();
    container.appendChild(btn);

    parent.appendChild(container);
  }

  private checkTable() {
    const selects = document.querySelectorAll('.truth-select') as NodeListOf<HTMLSelectElement>;
    let allCorrect = true;

    selects.forEach((select) => {
      const row = parseInt(select.dataset.row!);
      const col = parseInt(select.dataset.col!);
      
      const userValue = select.value;
      
      const correctValue = String(this.tableConfig[row].outputs[col]);

      if (userValue === correctValue) {
        select.classList.add('correct');
        select.classList.remove('error');
      } else {
        select.classList.add('error');
        select.classList.remove('correct');
        allCorrect = false;
      }
    });

    if (allCorrect) {
      this.onWin();
    } else {
      alert("Existem erros na tabela. Verifique as portas intermediárias.");
    }
  }

  private getGateIcon(type: GateType): string {
    if (type === 'AND') return `<svg viewBox="0 0 50 50" width="50" height="50"><path d="M0,0 V50 H25 A25,25 0 0,0 25,0 Z" fill="#333" stroke="white" stroke-width="2"/></svg>`;
    if (type === 'OR') return `<svg viewBox="0 0 50 50" width="50" height="50"><path d="M0,0 V50 Q25,25 50,25 Q25,25 0,0 Z" fill="#333" stroke="white" stroke-width="2"/></svg>`;
    if (type === 'NOT') return `<svg viewBox="0 0 50 50" width="50" height="50"><path d="M0,0 L0,50 L40,25 Z" fill="#333" stroke="white" stroke-width="2"/><circle cx="45" cy="25" r="4" fill="white" stroke="white"/></svg>`;
    if (type === 'INPUT') return `<div class="input-box"><div class="inner-box"></div></div>`;
    if (type === 'OUTPUT') return `<div class="output-node"></div>`;
    return `<span>${type}</span>`;
  }

  private updateLogic() {
    this.components.forEach(comp => {
      if (comp.type !== 'INPUT') {
        const inputStates = comp.inputs.map(id => this.components.get(id)?.state ?? false);
        if (comp.type === 'AND') comp.state = inputStates.every(s => s);
        else if (comp.type === 'OR') comp.state = inputStates.some(s => s);
        else if (comp.type === 'NOT') comp.state = !inputStates[0];
        else if (comp.type === 'OUTPUT') comp.state = inputStates[0];
      }
    });
    this.updateVisuals();
  }

  private updateVisuals() {
    this.components.forEach(comp => {
      const el = document.getElementById(`comp-${comp.id}`);
      if (comp.state) el?.classList.add('on');
      else el?.classList.remove('on');

      const wires = this.svgContainer.querySelectorAll(`[id^="wire-${comp.id}-"]`);
      wires.forEach(wire => {
        if (comp.state) wire.classList.add('on');
        else wire.classList.remove('on');
      });
    });
  }
}