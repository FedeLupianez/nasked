# 1) Frontend + backend + MariaDB
```bash
docker compose -f docker/compose.yaml --env-file .env \
--profile db --profile api --profile web up --build
```

# 2) Sólo frontend

```bash
NGINX_CONF=docker/nginx.web-only.conf \
docker compose -f docker/compose.yaml --env-file .env \
  --profile web up --build web

```

# 3) Sólo backend + MariaDB
```bash
docker compose -f docker/compose.yaml --env-file .env \
  --profile api up --build
```
