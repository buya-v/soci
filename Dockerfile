# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build frontend (Vite)
RUN npm run build

# Build server (TypeScript)
RUN npx tsc -p server/tsconfig.json

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built frontend
COPY --from=build /app/dist ./dist

# Copy compiled server
COPY --from=build /app/server/dist ./server/dist

EXPOSE 3001

CMD ["node", "server/dist/server/index.js"]
