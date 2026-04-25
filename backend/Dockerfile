FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --workspace backend
COPY backend ./backend
RUN npm --workspace backend run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --workspace backend --omit=dev
COPY --from=builder /app/backend/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
