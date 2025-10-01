# Scripts de Build e Deploy - Dark Channel Agent

Este repositório contém scripts para build e deploy da aplicação Dark Channel Agent usando Docker e Docker Compose, especialmente desenvolvidos para integração com Jenkins CI/CD.

## 📁 Arquivos de Script

### 🐧 Linux/macOS
- `build.sh` - Script principal de build e deploy
- `maintenance.sh` - Scripts de manutenção e utilitários
- `Jenkinsfile` - Pipeline do Jenkins (requer SCM)
- `Jenkinsfile.simple` - Pipeline simples do Jenkins (não requer SCM)

### 🪟 Windows
- `build.ps1` - Script PowerShell para Windows
- `Jenkinsfile.simple` - Pipeline Jenkins (funciona em ambos os sistemas)

## 🚀 Como Usar

### Linux/macOS

#### Dar permissões de execução (primeira vez):
```bash
chmod +x build.sh maintenance.sh
```

#### Build e Deploy:
```bash
# Build completo e iniciar aplicação
./build.sh

# Ou usar o script de manutenção
./maintenance.sh start
```

### Windows PowerShell

#### Build e Deploy:
```powershell
# Build completo e iniciar aplicação
.\build.ps1

# Com parâmetros opcionais
.\build.ps1 -SkipCleanup -Verbose
```

## 🛠️ Scripts de Manutenção

O arquivo `maintenance.sh` (Linux/macOS) oferece vários comandos úteis:

```bash
# Comandos principais
./maintenance.sh start          # Iniciar aplicação
./maintenance.sh stop           # Parar aplicação
./maintenance.sh restart        # Reiniciar aplicação
./maintenance.sh status         # Status dos serviços

# Logs
./maintenance.sh logs           # Ver todos os logs
./maintenance.sh logs backend   # Ver logs do backend
./maintenance.sh logs-f         # Seguir logs em tempo real

# Manutenção
./maintenance.sh clean          # Limpeza completa
./maintenance.sh update         # Atualizar aplicação
./maintenance.sh health         # Verificar saúde dos serviços

# Shell
./maintenance.sh shell backend  # Abrir shell no container do backend

# Banco de dados
./maintenance.sh db-backup backup.sql    # Fazer backup
./maintenance.sh db-restore backup.sql   # Restaurar backup

# Ambientes
./maintenance.sh dev            # Ambiente de desenvolvimento
./maintenance.sh prod           # Ambiente de produção
```

## 🔧 Configuração Jenkins

### Pré-requisitos no Servidor Jenkins:
1. Docker instalado e funcionando
2. Docker Compose V2 instalado (`docker compose` command)
3. Usuário Jenkins com permissões Docker
4. Git configurado (opcional, para SCM)

### Pipeline Setup:

#### Opção 1: Pipeline Script Direto (Recomendado)
1. **Criar novo Pipeline Job no Jenkins**
2. **Pipeline Definition**: Selecionar "Pipeline script"
3. **Copiar o conteúdo** do arquivo `Jenkinsfile.simple` para o campo Script
4. **Salvar e executar**

#### Opção 2: Pipeline from SCM (Requer configuração Git)
1. **Criar novo Pipeline Job no Jenkins**
2. **Pipeline Definition**: Selecionar "Pipeline script from SCM"
3. **SCM**: Git
4. **Repository URL**: URL do seu repositório
5. **Script Path**: `Jenkinsfile`

### Solução de Problemas Comuns:

#### ❌ **Erro: `checkout scm` not available**
**Solução**: Use o arquivo `Jenkinsfile.simple` que não depende de SCM

#### ❌ **Erro: `docker-compose: command not found`**
**Solução**: Os scripts foram atualizados para detectar automaticamente:
- `docker compose` (Docker Compose V2) - preferido
- `docker-compose` (Docker Compose V1) - fallback

#### ⚠️ **Arquivo .env não encontrado**
**Solução**: O pipeline criará automaticamente um arquivo `.env` básico para o build

### Variáveis de Ambiente (Opcional):
Configure no Jenkins se necessário:
```
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
APP_ENV=production
```

## 🌐 URLs da Aplicação

Após o build bem-sucedido, a aplicação estará disponível em:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Supabase**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323

## 📋 Funcionalidades dos Scripts

### Build Script (`build.sh` / `build.ps1`)

✅ **Verificações**:
- Docker e Docker Compose instalados (V1 e V2)
- Arquivo `.env` presente (cria automaticamente se não existir)
- Dependências do projeto (package.json)

🔧 **Build Process**:
- Cleanup de containers/imagens antigas
- Build paralelo das imagens Docker
- Inicialização dos serviços
- Health checks automáticos

🏥 **Health Checks**:
- Backend API (`/health`)
- Frontend (HTTP 200)
- Supabase (`/health`)

### Pipeline Jenkins (`Jenkinsfile.simple`)

🔄 **Stages**:
1. **Preparation** - Verificar workspace
2. **Environment Check** - Verificar ambiente e criar .env se necessário
3. **Build Application** - Executar script de build
4. **Health Check** - Verificar saúde dos serviços com retry
5. **Deploy Status** - Mostrar status final

📊 **Features**:
- Não depende de SCM (checkout)
- Cria arquivo .env automaticamente
- Suporte para Docker Compose V1 e V2
- Health checks com retry automático
- Logs arquivados automaticamente
- Cleanup automático em caso de falha
- Timeout de 30 minutos

## 🐛 Troubleshooting

### Problemas Comuns:

#### Docker não está rodando:
```bash
# Linux/macOS
sudo systemctl start docker

# Windows
# Iniciar Docker Desktop
```

#### Portas em uso:
```bash
# Verificar processos usando as portas
netstat -tulpn | grep -E ':(3000|8080|54321|54323)'

# Parar containers existentes
docker compose down
# ou
docker-compose down
```

#### Erro de permissões (Linux):
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Fazer logout/login novamente
```

#### Arquivo .env problemas:
```bash
# O pipeline cria automaticamente, mas você pode personalizar
cp .env .env.backup
# Editar .env com suas configurações específicas
```

### Logs para Debug:

```bash
# Ver logs dos containers
docker compose logs
# ou
docker-compose logs

# Ver logs específicos
docker compose logs backend
docker compose logs frontend

# Seguir logs em tempo real
docker compose logs -f
```

## 📝 Customização

### Variáveis de Ambiente:
O pipeline cria automaticamente um arquivo `.env` básico, mas você pode customizar:

```env
# Exemplo de variáveis importantes
POSTGRES_PASSWORD=sua_senha_segura
JWT_SECRET=seu_jwt_secret_muito_seguro
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
# ... outras variáveis conforme necessário
```

### Build Customizado:
Para customizar o processo de build, edite os arquivos:
- `build.sh` (Linux/macOS) - Detecta automaticamente docker compose/docker-compose
- `build.ps1` (Windows)
- `Jenkinsfile.simple` (Pipeline Jenkins simples)
- `Jenkinsfile` (Pipeline Jenkins com SCM)

### Docker Compose Overrides:
Crie arquivos para diferentes ambientes:
- `docker-compose.dev.yml` - Desenvolvimento
- `docker-compose.prod.yml` - Produção

## 🚀 Melhorias Implementadas

### Versão 2.0 - Correções Críticas:

✅ **Compatibilidade Docker Compose**:
- Suporte automático para `docker compose` (V2)
- Fallback para `docker-compose` (V1)
- Detecção automática da versão disponível

✅ **Pipeline Jenkins Robusto**:
- `Jenkinsfile.simple` não requer SCM
- Criação automática de arquivo `.env`
- Health checks com retry automático
- Melhor tratamento de erros

✅ **Scripts Mais Inteligentes**:
- Detecção automática de comandos disponíveis
- Logs mais informativos
- Cleanup robusto em caso de falha

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas alterações (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs com `docker compose logs`
2. Execute health check com `./maintenance.sh health`
3. Use o `Jenkinsfile.simple` para pipeline sem SCM
4. Consulte a documentação do projeto
5. Abra uma issue no repositório

## 🎯 Quick Start Jenkins

Para usar rapidamente no Jenkins:

1. **Copie o conteúdo** do arquivo `Jenkinsfile.simple`
2. **Cole no Jenkins** em "Pipeline script"
3. **Execute o build** - o pipeline criará automaticamente o `.env` necessário
4. **Acesse a aplicação** nas URLs mostradas no final do build

Pronto! 🚀