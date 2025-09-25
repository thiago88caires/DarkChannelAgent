FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl wget
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 8080
CMD ["node", "src/server.js"]

