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

# 4) Backend + MariaDB + MinIO
# (minio no tiene profile, siempre se levanta; se lista explícito por claridad)
```bash
docker compose -f docker/compose.yaml --env-file .env \
  --profile api up --build mariadb api minio
```

# 5) Solo MariaDB
```bash
docker compose -f docker/compose.yaml --env-file .env --profile db up -d
```

## Bajar el contenedor, conserva el volumen de datos
```bash
docker compose -f docker/compose.yaml --env-file .env --profile db down
```

## Bajar el contenedor y borra los datos (fresh la próxima vez)
```bash
docker compose -f docker/compose.yaml --env-file .env --profile db down -v

