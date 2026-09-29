FROM oven/bun:1-alpine AS build
WORKDIR /workspace

COPY package.json bun.lock ./
COPY nx.json tsconfig.base.json ./
RUN bun install --frozen-lockfile

COPY apps/api ./apps/api
COPY apps/api-e2e ./apps/api-e2e
RUN bunx nx build api --skip-nx-cache

FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY --from=build /workspace/dist/apps/api/package.json ./package.json
# el driver de la DB no queda en el package.json generado por el build
RUN bun install --production && bun add --production mysql2@3

FROM oven/bun:1-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /workspace/dist/apps/api ./
EXPOSE 3000
CMD ["bun", "run", "main.js"]
