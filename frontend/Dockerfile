FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache libc6-compat

# Definir argumentos de build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY  
ARG VITE_API_BASE_URL

# Definir variáveis de ambiente
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NODE_ENV=development

# Copiar arquivos de dependências primeiro (para cache)
COPY package.json package-lock.json* ./

# Limpar cache npm e instalar TODAS as dependências
RUN npm cache clean --force && \
    npm install --no-audit --no-fund && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Verificar se vite está disponível e dar permissões
RUN ls -la node_modules/.bin/ && \
    chmod +x node_modules/.bin/* && \
    which npx && \
    npx vite --version

# Fazer build da aplicação
RUN npm run build

# Verificar se build foi criado
RUN ls -la dist/

FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Remover arquivos padrão do nginx
RUN rm -rf ./*

# Copiar arquivos buildados
COPY --from=build /app/dist .

# Copiar configuração personalizada do nginx (se necessário)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 3000

# Configurar nginx para rodar na porta 3000
RUN sed -i 's/listen       80;/listen       3000;/' /etc/nginx/conf.d/default.conf

# Adicionar configuração para SPA (Single Page Application)
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

