# DarkChannelAgent

## Frontend

### Estrutura do site principal
- Nome do website
- Objetivo
- Funcionalidades
  - geração de vídeos automática
  - publicação automática
  - possibilidade de customização
  - agendamento de postagens
- Vídeos de exemplo
- Planos
- Link para cadastro (não é necessário pagamento para cadastrar)
- Botão de login no cabeçalho
- Contato de Suporte

### Subpáginas do site
- Página de autenticação (utilizar autenticação do Supabase)
- Página de cadastro
  - Nome
  - Telefone
  - E-mail
  - Senha (autenticação Supabase)
  - Como nos encontrou
  - Idioma preferido
- Página de pagamento de assinatura (usar Stripe ou AbacatePay)
  - Planos de créditos de vídeos (cada crédito custa 30 reais)
    - Planos de 5, 30 e 90 créditos
- Página de perfil do usuário
  - Deve permitir alterar os dados do cadastro
  - Página de configuração do YouTube
    - Deve receber o nome do canal e a API OAuth do YouTube e gravar no banco de dados (permitir cadastro de mais de um canal)
- Página com os últimos vídeos gerados pelo usuário
- Página de administradores
  - Pesquisar usuários existentes por nome ou e-mail
  - Gerenciar usuários e créditos de cada conta
  - Criar novos administradores ou tornar usuário existente em admin
  - Verificar fila de geração de vídeos
- Página de criação de vídeos (principal)

### Detalhes da página de criação de vídeos (principal)
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
   - Menu suspenso de quantidade de imagens
     - 10
   - Menu suspenso com o nome do canal onde o vídeo será publicado (buscar na tabela de usuários)
     - Exibir nome do canal e a API do YouTube
   - Campos de texto por idioma pré-preenchidos, buscar de acordo com o gênero no banco de dados:
     - Roteiro
       - Botão para gerar roteiro com IA
     - Estilo
     - Elementos
     - Regras de composição
     - Técnicas
     - Luzes e atmosfera
2. A cada vídeo gerado deve ser debitado 1 crédito. Controlar no banco de dados por usuário.
3. No final da página deve exibir quantos créditos serão debitados nesta geração (cada idioma representa 1 vídeo; criar 10 vídeos em 3 idiomas debita 30 créditos).
4. Ao clicar no botão de gerar Roteiro com IA, Chamar o webhook de geração de roteiro e aguardar a resposta para preencher automaticamente o campo de texto de roteiro.
   - Um webhook para cada vídeo a ser gerado.
5. Preencher os campos de texto com o roteiro retornado pelo webhook.
6. Botão de concordar e gerar vídeos.
7. Inserir todos os campos na tabela de fila de geração de vídeos.

## Backend
- Banco de dados Supabase.
- N8N que recebe os webhooks e devolve a saída esperada (já está pronto).
  - URLs dos webhooks e campos esperados: _a definir_.

## Estrutura adicional de banco de dados
- Três tabelas de gênero (English, Spanish, BR Portuguese)
    - Colunas:
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
    - Colunas:
        - `VIDEO ID` (único)
        - `USER EMAIL`
        - `LANGUAGE`
        - `STATUS` (Draft, Executing, Done)
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
