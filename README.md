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

## Execução (Docker)

- Pré‑requisitos: Docker Desktop e variáveis do Supabase (URL e chaves) se desejar autenticação real.
- Suba os serviços:

  - Crie um arquivo `.env` na raiz com as variáveis (veja `.env.example`).
  - Rode: `docker compose up --build`

- Serviços:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/health
- Supabase (gateway): http://localhost:54321

Rotas da UI:
- Login e Cadastro: `/login`, `/register`
- Dashboard: `/app`
- Criação de Vídeos: `/create`
- Meus Vídeos: `/videos`
- YouTube (CRUD de canais): `/youtube`
- Admin: `/admin`

## Variáveis de ambiente

Arquivo `.env` na raiz (exemplo mínimo):

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

SUPABASE_URL_PUBLIC=http://localhost:54321

# Se usar Supabase self-hosted (incluso neste compose)
JWT_SECRET=super-secret-jwt

PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

N8N_BASE_URL=
N8N_WEBHOOK_SCREENPLAY_URL=
N8N_WEBHOOK_VIDEO_URL=
N8N_CALLBACK_SECRET=

# Desenvolvimento (sem Supabase):
ALLOW_ANON=true
ALLOW_ANON_ADMIN=true
```

No frontend, `VITE_API_BASE_URL` é apontado para `http://localhost:8080` via `docker-compose.yml`.

## Endpoints do Backend (amostra)

- `GET /health` → { status, version }
- `GET /me` (privado) → perfil + créditos + canais
- `GET /credits` (privado) → { credits }
- `GET /genres?lang=pt-BR|en|es`
- `GET/POST/DELETE /youtube/channels`
- `POST /ai/screenplay` (privado)
- `POST /videos`, `GET /videos`, `GET /videos/:id` (privado)
- Admin: `GET /admin/users`, `PATCH /admin/users/:id`, `GET /admin/queue`
- Pagamentos: `POST /payments/checkout`, `POST /payments/webhook`
- N8N callbacks: `POST /n8n/screenplay/callback`, `POST /n8n/video/callback`

Observações:
- Se o Supabase não estiver configurado, o backend entra em modo degradado: autenticação é opcional (se `ALLOW_ANON=true`) e algumas rotas retornam dados simulados.
- Este repositório inclui um Supabase local (DB + Auth + REST) atrás de um gateway Nginx em `http://localhost:54321`. O frontend deve usar essa URL no `VITE_SUPABASE_URL`. O backend resolve o gateway via DNS interno `http://supabase`.
- Preencha `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` com JWTs válidos para os papéis `anon` e `service_role` assinados com `JWT_SECRET`. Em desenvolvimento, você pode gerar chaves com expiracão longa usando o mesmo segredo.
