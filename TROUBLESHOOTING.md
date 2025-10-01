# 🚨 Troubleshooting - Problemas de Build

## ❌ Erro: `vite: Permission denied`

### Descrição do Problema:
```
sh: vite: Permission denied
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code 126
```

### 🔧 Soluções (Execute em ordem):

#### 1️⃣ **Solução Rápida - Rebuild Completo**
```bash
# Parar tudo e limpar
docker compose down
docker system prune -f
docker volume prune -f

# Rebuild sem cache
docker compose build --no-cache
docker compose up -d
```

#### 2️⃣ **Solução com Script de Troubleshooting**
```bash
# Executar diagnóstico completo
chmod +x troubleshoot.sh
./troubleshoot.sh

# Seguir as sugestões do script
# Depois executar build
./build.sh
```

#### 3️⃣ **Build Manual do Frontend**
```bash
# Testar build local
cd frontend
npm cache clean --force
npm install
npm run build
cd ..

# Se funcionou, tentar Docker
docker build -t test-frontend ./frontend
```

#### 4️⃣ **Verificar Arquivos e Permissões**
```bash
# Verificar estrutura
ls -la frontend/
ls -la frontend/node_modules/.bin/ 2>/dev/null || echo "node_modules não existe"

# Verificar package.json
cat frontend/package.json

# Verificar Dockerfile
cat frontend/Dockerfile
```

#### 5️⃣ **Solução para Jenkins**
```bash
# No Jenkins, usar Jenkinsfile.git que tem troubleshooting automático
# Ou executar manualmente:

# Limpar workspace
rm -rf *

# Clonar fresh
git clone https://github.com/thiago88caires/DarkChannelAgent_APP.git .

# Executar build
chmod +x build.sh troubleshoot.sh
./troubleshoot.sh
./build.sh
```

---

## 🐛 Outros Problemas Comuns

### 📦 **Problema: `npm install` falha**
```bash
# Limpar cache npm
npm cache clean --force

# Remover node_modules
rm -rf frontend/node_modules backend/node_modules

# Reinstalar
cd frontend && npm install
cd ../backend && npm install
```

### 💾 **Problema: Falta de espaço em disco**
```bash
# Verificar espaço
df -h

# Limpar Docker
docker system prune -af
docker volume prune -f

# Limpar npm cache
npm cache clean --force
```

### 🔒 **Problema: Permissões no Linux**
```bash
# Corrigir permissões
sudo chown -R $USER:$USER .
chmod +x *.sh

# Se for Jenkins
sudo chown -R jenkins:jenkins /var/jenkins/workspace/DarkChannelAgent
```

### 🌐 **Problema: Portas em uso**
```bash
# Verificar portas
netstat -tulpn | grep -E ':(3000|8080|54321|54323)'

# Parar processos
docker compose down
sudo lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sudo lsof -ti:8080 | xargs kill -9 2>/dev/null || true
```

---

## 📋 Checklist de Verificação

### ✅ **Antes do Build:**
- [ ] Docker e Docker Compose instalados
- [ ] Espaço em disco > 2GB disponível
- [ ] Arquivo `.env` presente (ou será criado automaticamente)
- [ ] Portas 3000, 8080, 54321, 54323 livres
- [ ] Permissões de escrita no diretório

### ✅ **Arquivos Obrigatórios:**
- [ ] `docker-compose.yml`
- [ ] `frontend/package.json`
- [ ] `backend/package.json`
- [ ] `build.sh`
- [ ] `frontend/Dockerfile`
- [ ] `backend/Dockerfile`

### ✅ **Teste Manual:**
```bash
# 1. Verificar estrutura
ls -la

# 2. Testar frontend local
cd frontend && npm install && npm run build && cd ..

# 3. Testar backend local  
cd backend && npm install && cd ..

# 4. Testar Docker
docker compose build

# 5. Executar aplicação
docker compose up -d
```

---

## 🆘 Comandos de Emergência

### 🧹 **Reset Completo:**
```bash
# ATENÇÃO: Isso remove TUDO do Docker
docker compose down
docker system prune -af
docker volume prune -f
docker network prune -f

# Rebuild do zero
docker compose build --no-cache
docker compose up -d
```

### 🔍 **Debug Avançado:**
```bash
# Logs detalhados durante build
docker compose build --no-cache --progress=plain

# Build step by step
docker compose build backend
docker compose build frontend

# Executar container para debug
docker run -it --rm node:20-alpine sh
```

### 🚀 **Build Alternativo (sem Docker Compose):**
```bash
# Backend
cd backend
docker build -t darkchannel-backend .

# Frontend  
cd ../frontend
docker build -t darkchannel-frontend .

# Rede
docker network create darkchannel-net

# Executar manualmente
docker run -d --name backend --network darkchannel-net -p 8080:8080 darkchannel-backend
docker run -d --name frontend --network darkchannel-net -p 3000:3000 darkchannel-frontend
```

---

## 📞 Suporte

Se nenhuma solução funcionou:

1. **Execute o troubleshooting completo:**
   ```bash
   ./troubleshoot.sh > debug.log 2>&1
   ```

2. **Colete informações do sistema:**
   ```bash
   docker version > system-info.log
   docker compose version >> system-info.log
   docker system df >> system-info.log
   df -h >> system-info.log
   ```

3. **Verifique logs específicos:**
   ```bash
   docker compose logs > docker-logs.log 2>&1
   ```

4. **Compartilhe os arquivos de log** para análise

---

## 🎯 TL;DR - Solução Rápida

```bash
# Para 90% dos problemas de build:
docker compose down
docker system prune -f
chmod +x build.sh troubleshoot.sh
./troubleshoot.sh
./build.sh
```

Se ainda não funcionar, há um problema específico do ambiente que precisa de análise individual dos logs.