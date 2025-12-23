# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM deps AS build
COPY . .
# Avoid Nx daemon to keep builds deterministic in CI
ENV NX_DAEMON=false
RUN npx nx build frontend --configuration=production && \
    npx nx build backend --configuration=production

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_TYPE=sqlite
ENV DATABASE_PATH=/var/lib/data/data.db
ENV DATABASE_SYNCHRONIZE=true
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json ./

# Ensure the SQLite data directory exists (Koyeb volume mounted at /var/lib/data)
RUN mkdir -p /var/lib/data && chown -R node:node /app /var/lib/data
USER node

EXPOSE 8080
CMD ["node", "dist/apps/backend/main.js"]
