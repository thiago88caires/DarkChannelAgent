# Prompt de geracao do sistema DarkChannelAgent

## Instrucao principal
Voce atuara como um engenheiro full stack responsavel por gerar uma plataforma SaaS chamada DarkChannelAgent. Entregue frontend e backend prontos para execucao em Docker, integrados ao Supabase para autenticacao e banco de dados, com automacoes de webhooks via N8N e suporte a cobranca de creditos por video.

## Diretrizes de arquitetura
- Linguagens principais: React Native e JavaScript no frontend, JavaScript/Node.js no backend.
- Empacotar frontend e backend em servicos separados dentro de um mesmo docker-compose.
- Utilizar Supabase para autenticacao (email/senha) e armazenamento de dados relacionais.
- Integrar com gateway de pagamento (Stripe ou AbacatePay) para venda de creditos de video.
- Conectar backend com workflows N8N responsaveis por gerar roteiros e videos; prever configuracao das URLs e payloads esperados.
- Organizar codigo com padroes limpos, separando camadas (rotas, servicos, modelos, clientes externos) e adicionando comentarios apenas quando necessario.

## Plano de execucao detalhado
1. Preparar infraestrutura Docker
   - Criar docker-compose com servicos `frontend`, `backend`, `supabase` (se aplicavel via container local) e dependencias obrigatorias.
   - Configurar variaveis de ambiente para chaves do Supabase, APIs de pagamento, URLs de webhooks N8N e credenciais do YouTube.
   - Documentar comando unico para subir todo o ambiente.
2. Modelar banco de dados Supabase
   - Definir tabelas de genero (English, Spanish, BR Portuguese) com colunas: GENRE, DESCRIPTION, STRUCTURE, TONE, VIDEO TITLE, VIDEO DESCRIPTION, VIDEO TAGS, ELEMENTS, COMPOSITION RULES, TECHNIQUES, LIGHTING AND ATMOSPHERE.
   - Criar tabela de geracao de videos com colunas: VIDEO ID (chave unica), VIDEO FILE, USER EMAIL, LANGUAGE, VIDEO YT URL, STATUS (Draft, Executing, Done), GENRE, SCREENPLAY, DESCRIPTION, STRUCTURE, TONE, VIDEO TITLE, VIDEO DESCRIPTION, VIDEO TAGS, ELEMENTS, COMPOSITION RULES, TECHNIQUES, LIGHTING AND ATMOSPHERE.
   - Criar tabela de usuarios com colunas: NOME, EMAIL, CREDITOS, YT CHANNEL, API KEYS, GENERATED VIDEO IDS.
   - Preparar seeds ou scripts de migracao que popularao generos iniciais e administradores.
3. Implementar backend (Node.js)
   - Expor API REST para:
     - Gestao de usuarios (consulta, atualizacao de perfil, administracao, promocao a administrador).
     - Gestao de creditos (debito por video gerado, ajuste manual por administrador, leitura de saldo).
     - Integracao com gateway de pagamento (criacao de sessao de pagamento, confirmacao, atribuir creditos 5/30/90 conforme compra).
     - Integracao com N8N (endpoints que disparam webhooks de geracao de roteiro e geracao de video, tratamento de respostas e atualizacao da fila de videos).
     - Gestao da fila de videos (criar entradas, consultar status, atualizar progresso Draft/Executing/Done).
     - Configuracao de canais YouTube (CRUD de canais vinculados ao usuario, armazenamento de OAuth/API keys).
   - Implementar camada de servicos que orquestra chamadas ao Supabase (utilizando SDK) e ao N8N.
   - Garantir middleware de autenticacao baseado em tokens Supabase (verificar usuario atual, roles admin x usuario comum).
   - Criar testes automatizados minimos para fluxos criticos: debito de creditos, criacao de video, confirmacao de pagamento.
4. Implementar frontend (React Native Web ou abordagem web com React Native)
   - Estruturar layout responsivo executando em Docker.
   - Pagina principal (landing page) com secoes, nesta ordem: nome do website, objetivo, funcionalidades (itens: geracao automatica de videos, customizacao de roteiros/estilos, publicacao automatica, agendamento de postagens como roadmap), videos de exemplo, planos, link de cadastro (sem obrigacao de pagamento imediata), botao de login no cabecalho, contato de suporte.
   - Criar componentes reutilizaveis para cards de planos, lista de funcionalidades e galeria de videos.
   - Subpaginas obrigatorias:
     - Pagina de autenticacao usando Supabase (login com email/senha, recuperacao).
     - Pagina de cadastro com campos: nome, telefone, email, senha (ligar ao Supabase), como nos encontrou, idioma preferido.
     - Pagina de pagamento de assinatura exibindo planos de creditos (5, 30, 90 creditos, preco 30 reais cada credito) e integracao com gateway escolhido.
     - Pagina de perfil de usuario com edicao de dados do cadastro e configuracoes de YouTube (listar canais existentes, permitir cadastrar nome do canal e API OAuth, suportar multiplos canais).
     - Pagina com ultimos videos gerados (listar dados principais, link YouTube, status).
     - Pagina de administradores com recursos para pesquisar usuarios por nome/email, gerenciar creditos, criar/promover administradores e monitorar fila de geracao.
     - Pagina principal de criacao de videos, descrita abaixo.
     - Pagina de visualizacao dos videos gerados.
   - Pagina de criacao de videos: exibir creditos restantes, permitir configurar parametros em uma unica tela (quantidade de videos ate 10, idioma PT-BR/EN/ES, genero via dropdown filtrado por idioma, quantidade de caracteres 2.500, quantidade de imagens 10, selecao de canal do YouTube com nome e API). Para cada idioma, exibir campos editaveis: Roteiro, Estilo, Elementos, Regras de composicao, Tecnicas, Luzes e atmosfera.
   - Fluxo da pagina de criacao:
     1. Ao abrir, preencher campos com valores padrao vindos do genero selecionado na base.
     2. Calcular e exibir creditos necessarios (cada idioma equivale a 1 credito por video; ex.: 10 videos em 3 idiomas consomem 30 creditos).
     3. Botao "Gerar roteiro com IA" deve chamar webhook do backend que dispara N8N, aguardar resposta e preencher campo correspondente.
     4. Ao confirmar geracao, enviar todos os dados ao backend para inserir na fila e debitar creditos.
     5. Notificar usuario do resultado (sucesso/erro) e atualizar saldo.
5. Integracoes e automacoes
   - Definir contrato de payload entre backend e N8N (campos obrigatorios para solicitacao de roteiro e retorno com texto gerado).
   - Implementar manipuladores para atualizacao do status do video quando N8N concluir geracao final.
   - Garantir que webhooks sejam configuraveis via variaveis de ambiente.
6. Validacao e documentacao
   - Incluir README complementar com instrucoes de setup, variaveis de ambiente, comandos Docker, endpoints da API e credenciais de teste.
   - Registrar fluxo de creditos e exemplos de chamadas a partir do frontend.
   - Incluir testes de integracao essenciais no backend e testes de componentes-chave no frontend.
   - Revisar acessibilidade e argumentos de linha de comando para scripts de build/teste.

## Criterios de aprovacao
- Ambiente sobe com `docker compose up` e entrega frontend acessivel e backend com rotas documentadas.
- Autenticacao Supabase funcional em ambiente de desenvolvimento.
- Compra de creditos atualiza saldo no banco de dados e o fluxo de debito ocorre ao gerar videos.
- Pagina de administradores manipula usuarios, creditos e monitoramento da fila.
- Integracao com N8N permite gerar roteiros e atualizar status de videos ate o estado Done.