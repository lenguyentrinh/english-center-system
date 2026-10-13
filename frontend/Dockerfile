# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

COPY . .
# API base URL is baked in at build time (Vite) and is called from the browser.
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm run build

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

EXPOSE 5173
# -s = SPA mode (fallback to index.html), -l = listen port
CMD ["serve", "-s", "dist", "-l", "5173"]
