# Dark Channel - AI Agent

## Frontend (Docker)

Aplicação web executada em Docker, desenvolvida em React Native e JavaScript.

### Estrutura do site principal
- Nome do website
- Objetivo
- Funcionalidades
  - Geração automática de vídeos
  - Possibilidade de customização de roteiros, estilos etc.
  - Publicação automática
  - Agendamento de postagens (roadmap)
- Vídeos de exemplo
- Planos
- Link para cadastro (não é necessário pagamento para cadastrar)
- Botão de login no cabeçalho
- Contato de suporte

### Subpáginas do site
- Página de autenticação (utilizar autenticação do Supabase)
- Página de cadastro
  - Nome
  - Telefone
  - E-mail
  - Senha (autenticação Supabase)
  - Como nos encontrou
  - Idioma preferido
- Página de pagamento de assinatura (usar um gateway como Stripe ou AbacatePay)
  - Planos de créditos de vídeos (cada crédito custa 30 reais)
    - Planos de 5, 30 e 90 créditos
- Página de perfil do usuário
  - Permitir alteração dos dados do cadastro
  - Página de configuração do YouTube
    - Receber o nome do canal e a API OAuth do YouTube e gravar no banco de dados (permitir cadastro de mais de um canal)
- Página com os últimos vídeos gerados pelo usuário
- Página de administradores
  - Pesquisar usuários existentes por nome ou e-mail
  - Gerenciar usuários e créditos de cada conta
  - Criar novos administradores ou promover usuários existentes
  - Acompanhar a fila de geração de vídeos
- Página de criação de vídeos (principal)
- Página de visualização de vídeos gerados

### Detalhes da página de criação de vídeos
- Exibir a quantidade de créditos restantes no cabeçalho

#### Fluxo de criação de vídeos
1. Exibir uma única página com todos os parâmetros de geração de vídeo:
   - Quantidade de vídeos a serem gerados (máx. 10)
   - Caixa de seleção de idioma
     - Português (Brasil)
     - Inglês
     - Espanhol
   - Menu suspenso de gênero (buscar na tabela de gêneros de acordo com o idioma)
     - Terror Alienígena
   - Menu suspenso de quantidade de caracteres
     - 2.500
     - 3.500
   - Menu suspenso de quantidade de imagens
     - 10
   - Menu suspenso com o nome do canal onde o vídeo será publicado (buscar na tabela de usuários)
     - Exibir nome do canal e a API do YouTube
   - Campos de texto por idioma pré-preenchidos a partir do gênero no banco de dados:
     - Roteiro
       - Botão para gerar roteiro com IA
     - Estilo
     - Elementos
     - Regras de composição
     - Técnicas
     - Luzes e atmosfera
2. Debitar 1 crédito para cada vídeo gerado (controle por usuário no banco de dados).
3. Exibir, no final da página, quantos créditos serão utilizados na geração (cada idioma representa 1 vídeo; 10 vídeos em 3 idiomas debitam 30 créditos).
4. Ao clicar em "Gerar roteiro com IA", chamar o webhook de geração de roteiro e aguardar a resposta para preencher automaticamente o campo de roteiro (um webhook por vídeo a ser gerado).
5. Preencher os campos de texto com o roteiro retornado pelo webhook.
6. Disponibilizar botão de concordar e gerar vídeos quando estiver com todos os campos preenchidos.
7. Ao confirmar a geração, inserir todos os dados na tabela de fila de geração de vídeos com o status de video em waiting.

## Backend (Docker)

Serviços executados em Docker e desenvolvidos em JavaScript para controlar a geração de vídeos e manter o banco de dados atualizado.

### Funcionalidades
- Controle de geração de vídeos e atualização do banco de dados
- Gestão de pagamentos e créditos de usuários
- Banco de dados Supabase
- N8N responsável por receber os webhooks e devolver a saída esperada (workflows já prontos)
  - Workflows
    - Geração de roteiros e informações dos vídeos
    - Geração do vídeo final após aprovação do roteiro e dos dados pelo usuário
  - URLs dos webhooks e campos esperados: _a definir_

## Estrutura adicional de banco de dados
- Três tabelas de gênero (English, Spanish, BR Portuguese)
  - Colunas
    - `GENRE`
    - `DESCRIPTION`
    - `STRUCTURE`
    - `TONE`
    - `VIDEO TITLE`
    - `VIDEO DESCRIPTION`
    - `VIDEO TAGS`
    - `ELEMENTS`
    - `COMPOSITION RULES`
    - `TECHNIQUES`
    - `LIGHTING AND ATMOSPHERE`
- Tabela de geração de vídeos
  - Colunas
    - `VIDEO ID` (único)
    - `VIDEO FILE`
    - `USER EMAIL`
    - `LANGUAGE`
    - `VIDEO YT URL`
    - `STATUS` (Draft, Waiting, Executing, Done)
    - `GENRE`
    - `SCREENPLAY`
    - `DESCRIPTION`
    - `STRUCTURE`
    - `TONE`
    - `VIDEO TITLE`
    - `VIDEO DESCRIPTION`
    - `VIDEO TAGS`
    - `ELEMENTS`
    - `COMPOSITION RULES`
    - `TECHNIQUES`
    - `LIGHTING AND ATMOSPHERE`
- Tabela de usuários
  - Colunas
    - `NOME`
    - `EMAIL`
    - `CREDITOS`
    - `YT CHANNEL` e `API KEYS`
    - `GENERATED VIDEO IDS`