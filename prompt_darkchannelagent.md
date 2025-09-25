# Prompt de geração do sistema DarkChannelAgent

## Instrução principal
Você atuará como um(a) engenheiro(a) full stack responsável por implementar a plataforma SaaS DarkChannelAgent. Entregue frontend e backend prontos para execução em Docker, integrados ao Supabase (autenticação e banco de dados), com automações via webhooks N8N e cobrança por créditos de vídeo.

## Diretrizes de arquitetura
- Frontend: React Native Web (ou abordagem web com React Native) e JavaScript.
- Backend: Node.js/JavaScript com API REST.
- Containerização: `docker-compose` com serviços separados para `frontend` e `backend` (e dependências necessárias).
- Autenticação e dados: Supabase (e-mail/senha) e armazenamento relacional.
- Pagamentos: integração com gateway (Stripe ou AbacatePay) para venda de créditos.
- Orquestração externa: N8N para geração de roteiros e do vídeo final (webhooks configuráveis por ambiente).
- Organização do código: camadas separadas (rotas, serviços, modelos, clientes externos) e clean code.

## Escopo do frontend (Docker)
- Landing page (site principal):
  - Nome do website e objetivo.
  - Funcionalidades: geração automática de vídeos; customização de roteiros/estilos; publicação automática; agendamento de postagens (roadmap, não implementar agora).
  - Vídeos de exemplo e planos de créditos.
  - Link para cadastro (sem necessidade de pagamento para cadastrar).
  - Botão de login no cabeçalho e contato de suporte.
- Subpáginas obrigatórias:
  - Autenticação (Supabase): login com e-mail/senha e recuperação.
  - Cadastro: nome, telefone, e-mail, senha (Supabase), como nos encontrou, idioma preferido.
  - Pagamento de assinatura/créditos: planos de 5, 30 e 90 créditos; cada crédito custa R$ 30,00 (BRL).
  - Perfil do usuário: editar dados do cadastro.
  - Configuração do YouTube: cadastrar nome do canal e OAuth do YouTube; armazenar no BD; permitir múltiplos canais por usuário.
  - Últimos vídeos gerados: listar vídeos do usuário com status e link do YouTube (se houver).
  - Administradores: pesquisar usuários por nome/e-mail; gerenciar usuários e créditos; criar/promover administradores; acompanhar a fila de geração.
  - Criação de vídeos (página principal) e visualização dos vídeos gerados.
- Página de criação de vídeos:
  - Exibir créditos restantes no cabeçalho.
  - Uma única tela com parâmetros:
    - Quantidade de vídeos (máx. 10).
    - Idiomas: Português (Brasil), Inglês, Espanhol.
    - Gênero: dropdown conforme idioma (buscar nas tabelas de gêneros por idioma).
    - Quantidade de caracteres: 2.500 ou 3.500.
    - Quantidade de imagens: 10.
    - Canal do YouTube: selecionar entre os canais do usuário (exibir nome e dados OAuth).
  - Campos de texto por idioma pré-preenchidos a partir do gênero no BD:
    - Roteiro (com botão “Gerar roteiro com IA”).
    - Estilo; Elementos; Regras de composição; Técnicas; Luzes e atmosfera.
  - Habilitar o botão “Concordo e gerar vídeos” somente quando todos os campos obrigatórios estiverem preenchidos.

## Fluxo de criação de vídeos
1) Calcular e exibir créditos necessários: cada idioma equivale a 1 vídeo; total de créditos = quantidade de vídeos × quantidade de idiomas selecionados.
2) Debitar 1 crédito por vídeo gerado (controle por usuário no banco de dados).
3) Botão “Gerar roteiro com IA”: chamar webhook do backend que aciona o N8N para geração de roteiro; aguardar resposta e preencher o campo “Roteiro”. Um webhook por vídeo a ser gerado.
4) Preencher campos de texto com o roteiro retornado (por idioma) e permitir edição antes da confirmação.
5) Exibir, no final da página, o total de créditos a utilizar antes da confirmação.
6) Ao confirmar a geração (“Concordo e gerar vídeos”), enviar os dados ao backend para inserir na fila de geração com status inicial `Waiting`.
7) Atualizar UI com sucesso/erro e saldo de créditos.

## Backend (Docker)
- Responsabilidades principais:
  - Controle da geração de vídeos e atualização do banco de dados.
  - Gestão de pagamentos e créditos por usuário (planos 5/30/90; R$ 30/crédito).
  - Integração com Supabase (SDK) para autenticação, perfis e dados relacionais.
  - Integração com N8N via webhooks para: (a) geração de roteiros e metadados; (b) geração do vídeo final após aprovação do roteiro/dados pelo usuário.
  - Gestão da fila de vídeos: criar entradas; atualizar status (`Draft`, `Waiting`, `Executing`, `Done`); registrar URL do YouTube quando disponível.
  - Configuração de canais YouTube: CRUD de canais, armazenamento de OAuth/API keys, suporte a múltiplos canais por usuário.

## N8N e webhooks
- Workflows esperados:
  - Geração de roteiros e informações dos vídeos.
  - Geração do vídeo final (após aprovação do usuário).
- URLs dos webhooks e campos esperados: a definir por ambiente; parametrizáveis via variáveis.
- Contratos de payload: documentar campos mínimos para solicitação e resposta (roteiro por idioma, metadados, status e IDs de rastreio da fila).

## Banco de dados (Supabase)
- Tabelas de gêneros (English, Spanish, BR Portuguese):
  - Colunas: `GENRE`, `DESCRIPTION`, `STRUCTURE`, `TONE`, `VIDEO TITLE`, `VIDEO DESCRIPTION`, `VIDEO TAGS`, `ELEMENTS`, `COMPOSITION RULES`, `TECHNIQUES`, `LIGHTING AND ATMOSPHERE`.
- Tabela de geração de vídeos:
  - Colunas: `VIDEO ID` (único), `VIDEO FILE`, `USER EMAIL`, `LANGUAGE`, `VIDEO YT URL`, `STATUS` (`Draft`, `Waiting`, `Executing`, `Done`), `GENRE`, `SCREENPLAY`, `DESCRIPTION`, `STRUCTURE`, `TONE`, `VIDEO TITLE`, `VIDEO DESCRIPTION`, `VIDEO TAGS`, `ELEMENTS`, `COMPOSITION RULES`, `TECHNIQUES`, `LIGHTING AND ATMOSPHERE`.
- Tabela de usuários:
  - Colunas: `NOME`, `EMAIL`, `CREDITOS`, `YT CHANNEL` e `API KEYS`, `GENERATED VIDEO IDS`.
- Seeds/migrações: prever scripts para gêneros iniciais e criação de administradores.

## Variáveis de ambiente (exemplos)
- Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Pagamentos: `PAYMENT_PROVIDER` (stripe|abacatepay), chaves do provedor, moeda BRL e preço por crédito (3000 centavos).
- N8N: `N8N_BASE_URL`, `N8N_WEBHOOK_SCREENPLAY_URL`, `N8N_WEBHOOK_VIDEO_URL`.
- YouTube: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REDIRECT_URI`.

## Entregáveis e execução
- `docker-compose.yml` que sobe frontend e backend com um comando: `docker compose up`.
- Documentação de setup (README): variáveis de ambiente, comandos Docker, endpoints e fluxos de crédito.
- Rotas do backend documentadas (OpenAPI/Swagger opcional).

## Critérios de aprovação
- Ambiente sobe com `docker compose up`, frontend acessível e backend com rotas funcionais/documentadas.
- Autenticação Supabase funcional (cadastro sem necessidade de pagamento inicial).
- UI de criação: opções de caracteres 2.500 e 3.500, imagens 10, e botão “Concordo e gerar vídeos” habilitado apenas com campos obrigatórios preenchidos.
- Compra de créditos atualiza saldo; débito de 1 crédito por vídeo/idioma na geração; cálculo e exibição do total antes da confirmação.
- Fila de vídeos: criação com status `Waiting` e evolução até `Done` (via integrações N8N).
- Página de administradores: pesquisa por nome/e-mail, gestão de créditos e monitoramento da fila.


## API do Backend (Endpoints)
- Autenticação e contexto
  - Autorização via JWT do Supabase em todas as rotas privadas (header `Authorization: Bearer <token>`).
  - Somente backend usa `SUPABASE_SERVICE_ROLE_KEY`. Frontend usa apenas `ANON_KEY`.
- Saúde e utilitários
  - `GET /health` → { status: "ok", version }
- Perfil e créditos
  - `GET /me` → retorna perfil do usuário, saldo de créditos, canais do YouTube.
  - `GET /credits` → { credits }
- Gêneros e metadados
  - `GET /genres?lang=pt-BR|en|es` → lista de gêneros com campos padrão (DESCRIPTION, STRUCTURE, etc.).
- Canais YouTube
  - `GET /youtube/channels` → lista canais do usuário.
  - `POST /youtube/channels` { name, oauth } → cria canal vinculado ao usuário.
  - `DELETE /youtube/channels/:id` → remove canal do usuário.
- Geração de roteiro (IA)
  - `POST /ai/screenplay` { language, genre, charCount, images, style?, elements?, rules?, techniques?, lighting? }
    - Headers: `Idempotency-Key` recomendado; timeout com fallback amigável.
    - Resposta: { screenplay, meta }
- Fila de vídeos
  - `POST /videos` { count (<=10), languages[], genre, charCount, images, channelId, fieldsByLanguage }
    - Debita créditos: total = count × languages.length.
    - Cria registros em `videos` com status inicial `Waiting`.
    - Resposta: { jobIds: string[] }.
  - `GET /videos?status=&limit=&offset=` → lista vídeos do usuário com paginação.
  - `GET /videos/:id` → detalhes de um vídeo, incluindo `VIDEO YT URL` quando concluído.
- Admin (somente `is_admin = true`)
  - `GET /admin/users?query=&limit=&offset=` → busca por nome/e-mail.
  - `PATCH /admin/users/:id` { creditsDelta?, makeAdmin? } → ajustar créditos e promover a admin.
  - `GET /admin/queue?status=&limit=&offset=` → acompanhar fila (todos os usuários).
- Webhooks de pagamentos
  - `POST /payments/checkout` { packId: 5|30|90 } → { checkoutUrl }
  - `POST /payments/webhook` (público para provedor) → valida assinatura, credita usuário e guarda idempotência.
- Webhooks N8N (privados via secret)
  - `POST /n8n/screenplay/callback` { jobId, language, screenplay, meta }
  - `POST /n8n/video/callback` { jobId, status: Executing|Done|Error, videoUrl? }

Padrão de resposta de erro: { code: string, message: string, details?: any }

## Contratos N8N (exemplos JSON)
- Requisição de roteiro → N8N
  - { userEmail, jobId, language, genre, charCount, images, style, elements, rules, techniques, lighting }
- Resposta de roteiro ← N8N (callback)
  - { jobId, language, screenplay, durationSec?, imageHints?: string[], seed?: string }
- Requisição de vídeo final → N8N
  - { userEmail, jobId, language, screenplay, assets?: any, youtube: { channelId, oauth } }
- Resposta de vídeo final ← N8N (callback)
  - { jobId, status: Executing|Done|Error, videoUrl?, error? }

Observações:
- URLs e tokens de N8N parametrizados via ambiente; validar assinatura/secret em callbacks.
- Idempotência por `jobId` em ambos os fluxos.

## Banco de dados — Esquema e Políticas (detalhado)
- Tabelas (conforme README) e recomendações adicionais:
  - `genres_pt_br`, `genres_en`, `genres_es` com colunas do README e `updated_at TIMESTAMP`.
  - `videos` com índices: `(USER EMAIL)`, `(STATUS)`, `(created_at DESC)`.
  - `users` com `EMAIL UNIQUE` e coluna `is_admin BOOLEAN DEFAULT false`.
  - `youtube_channels` (recomendado): `id`, `user_email`, `name`, `oauth_encrypted`, `created_at`.
  - Ledger opcional: `credit_ledger` { id, user_email, delta, type: purchase|debit|adjust, ref, created_at } para auditoria.
- RLS (Supabase):
  - `videos`: usuários só veem seus próprios; insert/update próprios; admin/service role liberado.
  - `youtube_channels`: proprietário; admin/service role liberado.
  - `users`: usuário lê/edita dados próprios limitados; admin pode gerenciar.
- Constraints e validações:
  - `videos.STATUS` ENUM: Draft|Waiting|Executing|Done.
  - `users.CREDITOS` não negativo; transações de pagamento idempotentes por `provider_event_id`.
  - FK `youtube_channels.user_email` → `users.EMAIL`.

## Frontend — UI, Estado e Validação (detalhado)
- Roteamento: React Router com rotas privadas (ProtectedRoute) e públicas.
- Estado: gerenciador leve (Zustand/Context+Reducer); persistência de sessão Supabase.
- i18n: chaves `pt-BR`, `en`, `es`; textos do gênero vindos da tabela conforme idioma.
- Componentes:
  - CreditBadge; GenreSelect; LanguageChips; CharCountSelect (2.500|3.500); ImageCountSelect (10 fixo);
    YouTubeChannelSelect; ScriptEditor por idioma; AdminUserTable; VideoCard.
- UX e acessibilidade:
  - Desabilitar ações enquanto carrega; skeletons; toasts de sucesso/erro.
  - Foco visível, labels, navegação por teclado, textos alternativos.
- Validação (criação de vídeos):
  - `count` 1..10; `languages` subset de [pt-BR,en,es]; `genre` obrigatório; `charCount` ∈ {2500,3500}; `images` = 10.
  - Canal YouTube obrigatório; campos por idioma obrigatórios após geração/edição.
  - Botão “Concordo e gerar vídeos” só habilita quando o formulário é válido e créditos suficientes.
- Integrações:
  - `Gerar roteiro com IA` chama `POST /ai/screenplay` por idioma; usa `Idempotency-Key`.
  - Confirmar geração chama `POST /videos`; atualiza saldo local após resposta.
  - Listagens com paginação infinita (limit/offset) e filtros por status.

## Pagamentos (fluxo)
- Pacotes: 5, 30, 90 créditos a R$ 30/unidade.
- `POST /payments/checkout` cria sessão no provedor e retorna `checkoutUrl`.
- Webhook do provedor credita o usuário; usar verificação de assinatura e idempotência.
- UI atualiza saldo após webhook (polling curto ou retorno da página de sucesso).

## Docker e Execução (detalhado)
- `docker-compose.yml`:
  - `frontend`: porta 3000; env: SUPABASE_URL, SUPABASE_ANON_KEY, API_BASE_URL.
  - `backend`: porta 8080; env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYMENT_*, N8N_*, YT_*.
  - Healthchecks simples e `depends_on` para ordem de subida.
- Dockerfiles multi-stage (node:alpine), cache de deps e variáveis segregadas por ambiente.

## Testes e Qualidade
- Backend: testes de unidade para débito de créditos e verificação de permissões; integração para `/videos`, `/ai/screenplay`, `/payments/webhook`.
- Frontend: testes de componentes principais (formulário de criação, cálculo de créditos, AdminUserTable).
- Opcional: contrato (OpenAPI) para validação de payloads.

## Observabilidade e Segurança
- Logs estruturados (pino/winston) com `requestId`/`userEmail`; mascarar secrets.
- CORS restrito ao domínio do frontend; Helmet para headers seguros.
- Rate limit por IP e por usuário para `/ai/screenplay` e `/videos`.
- Sanitização e validação de entrada (Zod/Joi) em todas as rotas.

## Checklist de Aceite (manual)
- Login/cadastro via Supabase funciona e mantém sessão.
- Compra de créditos aplica saldo após webhook e aparece no perfil.
- Criação de vídeos valida formulário, calcula e debita créditos corretamente.
- Roteiro por idioma é gerado e preenchido automaticamente.
- Fila mostra `Waiting → Executing → Done` e exibe `VIDEO YT URL` quando concluído.
- Admin lista usuários, ajusta créditos e monitora a fila.
