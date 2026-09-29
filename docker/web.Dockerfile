FROM oven/bun:1-alpine AS build
WORKDIR /workspace

COPY package.json bun.lock ./
COPY nx.json tsconfig.base.json ./
RUN bun install --frozen-lockfile

COPY apps/web ./apps/web
WORKDIR /workspace/apps/web
RUN bun install --frozen-lockfile
RUN bunx vite build

FROM nginx:1.27-alpine AS runtime
ARG NGINX_CONF=docker/nginx.conf
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 80
