# ── Build stage: export Expo web app to static files ─────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx expo export -p web

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-p", "3000"]
