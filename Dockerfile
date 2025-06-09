FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/home_library?schema=public"
RUN npm run build
RUN npx prisma generate


FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/home_library?schema=public"
RUN npx prisma generate
EXPOSE 4000

CMD ["node", "dist/main"] 
