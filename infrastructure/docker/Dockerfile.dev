# Build stage for frontend
FROM node:24-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm ci

COPY apps/frontend ./apps/frontend
COPY libs ./libs

RUN npx nx build frontend --configuration=production

# Final stage
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm ci

COPY apps/backend ./apps/backend
COPY libs ./libs
COPY --from=frontend-build /app/dist/apps/frontend ./dist/apps/frontend

EXPOSE 3000

CMD ["npx", "nx", "serve", "backend"]
