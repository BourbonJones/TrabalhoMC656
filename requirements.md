# REQUIREMENTS

## Elicitação de Requisitos via Benchmarking

Adotamos a técnica de Benchmarking para a elicitação de requisitos, uma análise competitiva crucial para entender os padrões de mercado e identificar oportunidades de inovação para nossa plataforma de circuitos lógicos.

O benchmarking consiste em um estudo sistemático de produtos, serviços e práticas de outras empresas, especialmente aquelas que são referência no setor. Para o nosso projeto de uma plataforma educacional de circuitos lógicos, essa técnica é crucial por estabelecer uma linha de base ao analisar outras plataformas nos permite identificar quais funcionalidades são consideradas padrão de mercado, evitando que nosso produto seja lançado sem recursos essenciais que os usuários já esperam encontrar.

Por identificar oportunidades de inovação ao observar os pontos fortes e, principalmente, os pontos fracos dos concorrentes, podemos identificar lacunas no mercado. Essas lacunas representam oportunidades claras para criarmos diferenciais que tornem nossa plataforma única e mais atraente.

E, por fim, por validar e refinar hipóteses antes de investir tempo e esforço no desenvolvimento, o benchmarking nos permite validar se as ideias que temos para o projeto fazem sentido e já foram testadas de alguma forma por outros. Isso reduz riscos e direciona o desenvolvimento para o que realmente agrega valor. Nosso processo foi dividido em três etapas:

* `Seleção e Definição`: Escolhemos analisar as plataformas NandGame, Plays.org, logic.ly e CircuitSnapGame, definindo critérios claros como usabilidade, conteúdo prático e engajamento. Os critérios utilizados para essa avaliação foram:
    * `Interface e Usabilidade`: Avaliando a facilidade de uso e o design geral.
    * `Exercícios Práticos Resolutivos`: Focado na qualidade e formato do conteúdo prático.
    * `Conteúdo Teórico Educativo`: Verificando o suporte pedagógico oferecido.
    * `Mecanismos de Salvamento de Progresso`: Analisando a personalização da experiência do usuário.
    * `Mecanismos de Engajamento`: Investigando funcionalidades que motivam o uso contínuo.
    * `Diferenciais`: Identificando características únicas de cada plataforma.
* `Análise e Coleta`: A equipe estudou cada ferramenta, consolidando as observações em uma tabela comparativa detalhada que será apresentada a seguir.
* `Consolidação e Decisão`: Discutimos os resultados e transformamos cada insight em uma decisão ou requisito acionável, garantindo que a análise direcione diretamente o desenvolvimento do nosso projeto.

Abaixo, temos o resultado da fase de analise e coleta em formato de tabela. Após essa fase, a equipe se reuniu para discutir os achados e consolidá-los. A etapa mais importante deste passo foi a criação da coluna de decisão e oportunidad já anexa na tabela abaixo, onde transformamos cada observação em uma decisão estratégica ou em um requisito funcional para o nosso sistema.

### Tabela de análise por benchmark ([Link](https://docs.google.com/document/d/1yZ72xylaX5zhHT7S6avI8DbszTXyqaEL3_SChMEnjU0/edit?usp=sharing) para a tabela para melhor leitura da tabela e texto)


| **Critérios / Plataformas** | **NandGame.com** | **Plays.org** | **Logic.ly (Demo)** | **CircuitSnapGame** | **Decisão / Oportunidades** |
|------------------------------|:----------------:|:--------------:|:-------------------:|:-------------------:|:-----------------------------|
| **Interface / Usabilidade** | Interface *clean*, bonita e amigável. À primeira vista, o site agrada o usuário e transmite uma sensação de aprendizado. | Interface bem gamificada, mas com aspecto infantilizado, semelhante a sites de jogos dos anos 2010 — pode ser um obstáculo dependendo da idade do público-alvo. | Design mais sério, lembrando uma placa de desenvolvimento. Pouco atraente para a proposta do projeto. | Design pouco atrativo e relativamente confuso, por tentar se aproximar de máquinas de baixo nível (protoboards). | **Decisão:** A simplicidade é um requisito-chave. Nossa interface deve ser minimalista e focada, inspirada no NandGame e no Plays, para reduzir a carga cognitiva do aluno e facilitar o primeiro uso. |
| **Exercícios práticos resolutivos** | Apresenta exercícios, porém muito diretos e já aprofundados — com foco em componentes elétricos em vez de lógica pura. | Os exercícios são *puzzles* interativos, semelhantes ao modelo que imaginamos. Funcionam de forma muito interessante e envolvente. | Nenhum. A plataforma é um simulador de circuitos lógicos, permitindo apenas montar e testar circuitos. Não é o foco do nosso projeto. | Apresenta exercícios interessantes, explicando cada porta e suas saídas na tabela-verdade, do básico ao avançado. | **Decisão:** A análise confirma que um módulo de exercícios estruturados com verificação automática de resposta é a funcionalidade de maior valor. Este será o foco principal do desenvolvimento, com exercícios interativos inspirados principalmente no Plays. |
| **Conteúdo teórico / educativo** | Apresenta breves explicações sobre conceitos centrais, mas de forma superficial. Inclui tabelas-verdade, o que é um ponto positivo. | Base teórica fraca — apenas *pop-ups* com explicações muito resumidas. | Nenhuma seção teórica. O foco é apenas a simulação prática. | Apesar do bom nível prático, não possui seções teóricas dedicadas. | **Oportunidade:** Podemos nos diferenciar incluindo uma breve seção teórica (com tabela-verdade) em cada exercício. **Ação:** Adicionar ao backlog a funcionalidade que permita ao usuário consultar a teoria antes da prática. |
| **Mecanismos de salvamento de progresso** | Não há tela de login nem salvamento. | A plataforma possui login, mas o jogo em si não parece salvar progresso. | Permite salvar o circuito montado. | Salva o progresso, mas não distingue usuários. | **Decisão:** Nosso sistema de login e progresso por usuário (já funcional no backend) é um diferencial competitivo. Devemos destacar visualmente o progresso na interface principal (*home.html*). |
| **Mecanismos de engajamento** | Nenhum além dos próprios exercícios. | Liberação de *levels* conforme o avanço. | Nenhum. | Liberação de níveis conforme o progresso. | **Decisão:** A liberação progressiva de níveis e exercícios é uma forma eficaz de engajamento. **Oportunidade:** Implementar pontuação e recompensas (distintivos ou fases bônus) para reforçar a motivação. |
| **Diferenciais** | Design agradável, embora não esteja em português. | Formato visual dos exercícios muito semelhante ao que imaginamos — interativo e intuitivo. | Simulação de alto nível (fora do escopo do projeto). | Boa progressão de dificuldade, mas design pouco atraente, próximo a protoboards reais. | **Conclusão estratégica:** Nossa visão de produto está validada e alinhada com o esperado. Vamos construir uma plataforma que combine a usabilidade de uma interface moderna e confortável com o foco pedagógico de um sistema de exercícios interativos, permitindo ao usuário visualizar as interações lógicas e compreender teoricamente o que acontece — tudo isso sustentado por uma base de autenticação e progresso individualizado. |


Dessa forma, entendemos que o caminho que esperavamos para o propjeto se mantem, com algumas breves adições. Nosso projeto deverá ter uma tela de login robusta como tela inicial, a fim de garantir um ambiente para cada usuário ter seus dados/progresso salvo, e ao acessar, ele deve ter os níveis dos jogos, visiveis além de uma opção de tela de aprendizado teórico mais profundo. Os níveis serão liberados conforme o usuário completa anteriores e ganha pontos, garantindo a gameficação do projeto para manter o interesse pelos usuários. Na tela de fases dos jogos, elas deverão ter explicações concisas que contribuam para que o usuário aprenda sobre o sistema que esta observando/interagindo, assim como o funcionamento de sua tabela verdade.

 
## Elicitação de Requisitos via Storyboard

Para o storyboard, assumimos a posição de usuário no benchmark mais semelhante a nossa ideia inicial do projeto.

1. **Tela de seleção de níveis**

![Tela de seleção de level](/select_level_screen.png "This is a sample image.")

* Tela amigável e clara demonstração de progressão e desbloqueio gradual de novos níveis
* Não há personalização para usuário, experiência genérica para todos igualmente (Pode conter o nome do usuário uma divisão de níveis em sessões como iniciante e intermediário).
* Níveis com nomes genéricos representando apenas a sequência. Para fins educacionais seria interessante adicionar o conceito teórico no nome para possível revisão. Exemplo: 1. Porta AND).

2. Tela do game

![Tela do jogo](/game_screen.png "This is a sample image.")

* Entradas e saídas claras.
* Fios acendem ou apagam se o nível lógico é 1 ou 0. Boa interatividade com usuário.
* Portas todas quadradas com nomes, bom para aspeto de jogo e público mais novo, mas perde o teor educacional. Imagens das portas lógicas seria mais educativo.
* Não há tutorial ou popup explicando o que certa porta lógica faz ou espera.
* Quantidade de movimento, mas sem clara lógica de pontuação. Aqui podemos dar 3 estrelas se completar no menor número de movimentos possíveis, 2 estrelas se 1 ou 2 movimentos a mais, 1 estrela só por completar.
* Aqui também falta personalização por usuário ao completar a fase.
* Navegação 100% intuitiva. É fácil voltar pra tela de início ou ir para próxima fase direto

![Tela de Level Completed](/level_complete_screen.png "This is a sample image.")


## Conclusão geral das elicitações a partir de ambas as técnicas

As análises de Benchmarking e Storyboarding, em conjunto, validaram nossa visão de produto e a refinaram com direcionamentos estratégicos claros. Entendemos que nossa plataforma se posicionará de forma única ao combinar uma interface limpa e amigável (inspirada no NandGame e Plays.org) com um sistema robusto de exercícios interativos em formato de puzzle. Um diferencial-chave, já em desenvolvimento em nosso projeto, é o sistema de autenticação com progresso individualizado , uma funcionalidade de alto valor ausente na maioria dos concorrentes analisados. A análise de Storyboard detalhou requisitos de usabilidade cruciais, como a necessidade de feedback visual instantâneo (fios que acendem), navegação intuitiva e a oportunidade de um sistema de pontuação mais granular (ex: estrelas por movimentos), que enriquece a gamificação além do simples desbloqueio de níveis. Portanto, nosso foco de desenvolvimento será em criar um ambiente de aprendizado gamificado, que prioriza a prática guiada (com explicações teóricas concisas) e o reforço positivo, tudo sustentado pela nossa base técnica de gerenciamento de usuário. Esses insights consolidados deram origem aos Épicos e Histórias de Usuário detalhados a seguir.


## Criação de issues baseado na Elicitação de Requisitos feita:
* Épico **Seleção de Level e Navegação Intuitiva**:
    * História `Visualização de Progresso Pessoal`
    * História `Agrupamento de Níveis por Tópico/Seções de fácil identificação` (inspirado no app duolingo)
* Épico: **Jogo e Usabilidade**:
    * História `Montagem do circuito com feedback interativo` (fios interativos e portas lógicas desenhadas)
    * História `Tela de Level Completed (Feedback de Conclusão de Nível)`
* Épico **Backend e Integração**:
    * História `Pontuações por eficiencia da resolução e Progressões do Usuário`
    * História `Exibição de Conteúdo Teórico de Apoio`

