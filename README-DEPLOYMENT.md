# DarkChannelAgent - Gerenciamento Separado

## 📋 Pré-requisitos

1. **Docker e Docker Compose** instalados
2. **PowerShell** (Windows) ou **Bash** (Linux/Mac)
3. **Rede Docker "Servers"** existente com subnet 172.16.0.0/24

### 🔧 Verificar/Criar Rede Docker

Antes de iniciar, verifique se a rede "Servers" existe:

```powershell
docker network ls | findstr Servers
```

Se não existir, crie a rede:

```powershell
docker network create --driver bridge --subnet=172.16.0.0/24 Servers
```

## 🏗️ Arquitetura

O projeto agora está dividido em duas partes:

### 1. **Supabase** (Pasta `/supabase/`)
- PostgreSQL Database
- GoTrue (Auth)
- PostgREST (API)
- Nginx Gateway
- **Supabase Studio** (Interface Web)

### 2. **Aplicação** (Pasta raiz)
- Backend (Node.js/Express)
- Frontend (React/Vite)

## 🚀 Como Usar

### Opção 1: Scripts de Gerenciamento

**Windows (PowerShell):**
```powershell
# Iniciar tudo
.\manage.ps1 start-all

# Apenas Supabase
.\manage.ps1 start-supabase

# Apenas aplicação
.\manage.ps1 start-app

# Ver status
.\manage.ps1 status

# Parar tudo
.\manage.ps1 stop-all
```

**Linux/Mac (Bash):**
```bash
# Dar permissão
chmod +x manage.sh

# Iniciar tudo
./manage.sh start-all

# Apenas Supabase
./manage.sh start-supabase

# Apenas aplicação
./manage.sh start-app
```

### Opção 2: Docker Compose Manual

**1. Iniciar Supabase:**
```bash
cd supabase
docker-compose up -d
```

**2. Iniciar Aplicação:**
```bash
# Voltar para pasta raiz
cd ..
docker-compose up -d
```

## 🌐 URLs dos Serviços

Após iniciar todos os serviços:

| Serviço | URL | Descrição | IP na Rede |
|---------|-----|-----------|------------|
| **Frontend** | http://localhost:3000 | Interface principal | - |
| **Backend** | http://localhost:8080 | API REST | - |
| **Supabase Studio** | http://localhost:3001 | **Interface Web do Banco** | 172.16.0.34 |
| **Supabase API** | http://localhost:54321 | API do Supabase | 172.16.0.33 |
| **PostgreSQL** | localhost:5432 | Banco de dados direto | 172.16.0.30 |

### 🔗 **Rede Docker "Servers"**

Os serviços do Supabase estão configurados na rede Docker externa "Servers" com IPs fixos:

- **172.16.0.30** - PostgreSQL Database
- **172.16.0.31** - GoTrue (Auth Service)
- **172.16.0.32** - PostgREST (API)
- **172.16.0.33** - Nginx Gateway
- **172.16.0.34** - Supabase Studio

## 📊 Supabase Studio - Interface Web

O **Supabase Studio** em http://localhost:3001 permite:

- ✅ **Visualizar e editar dados** das tabelas
- 👥 **Gerenciar usuários** e autenticação
- 💳 **Editar créditos** dos usuários facilmente
- 🔧 **Configurar schema** do banco
- 📈 **Ver métricas** e logs
- 🔐 **Configurar políticas** de segurança

### Como Editar Créditos:

1. Acesse http://localhost:3001
2. Vá em **Table Editor** → **users**
3. Encontre o usuário `thiago88caires@gmail.com`
4. Clique em **Edit** na linha
5. Altere o campo **credits**
6. Salve as mudanças

## 🔧 Comandos Úteis

```bash
# Ver logs do Supabase
cd supabase && docker-compose logs -f

# Ver logs da aplicação  
docker-compose logs -f

# Resetar banco de dados
cd supabase && docker-compose down -v && docker-compose up -d

# Ver status de todos os containers
docker ps
```

## 🗄️ Estrutura de Pastas

```
DarkChannelAgent/
├── supabase/
│   ├── docker-compose.yml    # Supabase services
│   ├── .env                  # Configurações do Supabase
│   ├── .gitignore           # Ignora dados do banco
│   ├── data/
│   │   └── postgres/        # Dados do PostgreSQL (pasta local)
│   ├── init/                # Scripts de inicialização do DB
│   ├── nginx-simple.conf    # Configuração do gateway
│   ├── start-supabase.sh    # Script Linux/Mac
│   └── start-supabase.bat   # Script Windows
├── docker-compose.yml       # Aplicação principal
├── .env                     # Configurações da aplicação
├── manage.ps1              # Script Windows
├── manage.sh               # Script Linux/Mac
└── README-DEPLOYMENT.md    # Este arquivo
```

## 🔄 Fluxo de Desenvolvimento

### 🚀 **Primeira vez (Deploy Completo):**

```powershell
# 1. Verificar rede Docker
docker network ls | findstr Servers

# 2. Criar rede se necessário
docker network create --driver bridge --subnet=172.16.0.0/24 Servers

# 3. Iniciar tudo
.\manage.ps1 start-all
```

### 💻 **Desenvolvimento do backend/frontend:**
```bash
# Supabase continua rodando na rede "Servers"
.\manage.ps1 stop-app
.\manage.ps1 start-app
```

### 🗄️ **Mudanças no banco:**
```bash
# Use o Supabase Studio: http://localhost:3001
# Ou acesse direto o PostgreSQL: localhost:5432
```

### 🔗 **Conectividade de Rede:**

Os serviços se comunicam através da rede "Servers":
- Backend conecta em: `http://172.16.0.33` (Nginx Gateway)
- Frontend conecta em: `http://localhost:54321` (porta mapeada se necessário)
- Studio interface: `http://172.16.0.34:3000` (acesso direto pelo IP)

## 🛠️ Vantagens da Separação

- ✅ **Supabase independente** - pode rodar sozinho
- ✅ **Interface web** para gerenciar dados
- ✅ **Desenvolvimento isolado** - restart apenas o que precisa
- ✅ **Dados persistentes locais** - armazenados em `./supabase/data/postgres`
- ✅ **Fácil backup** - copiar pasta de dados
- ✅ **Fácil debugging** - logs separados
- ✅ **Produção simples** - deploy independente