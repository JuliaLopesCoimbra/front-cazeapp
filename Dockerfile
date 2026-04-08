# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (isso acelera builds futuros)
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Agora o comando vai funcionar porque o Node é v20
RUN npm run build

# Estágio 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Copia apenas o necessário do estágio de build para a imagem final ficar leve
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]