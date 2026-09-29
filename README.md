# Nasked

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

## Docker

```sh
# 1) Frontend + backend + MariaDB
docker compose -f docker/compose.yaml --env-file .env \
  --profile db --profile api --profile web up --build

# 2) Sólo frontend (sin proxy a /api)
NGINX_CONF=docker/nginx.web-only.conf \
docker compose -f docker/compose.yaml --env-file .env \
  --profile web up --build web

# 3) Sólo backend + MariaDB
docker compose -f docker/compose.yaml --env-file .env \
  --profile api up --build
```

- Web: <http://localhost:5173> — API: <http://localhost:3000/api> — MariaDB: `localhost:3308`

---

## Run tasks

To run tasks with Nx use:

```sh
npx nx <target> <project-name>
```

For example:

```sh
npx nx build myproject
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the [project.json](https://nx.dev/recipes/nx-release/creating-nx-workspaces?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects) or [package.json](https://nx.dev/concepts/nx-project-configuration/package-json?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects) files.

[More about running tasks in the docs »](https://nx.dev/features/run-tasks?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/concepts/nx-plugins#code-generation?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects) feature.

The fastest way to add a project is to use [Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects), an editor extension that offers a visual interface for adding plugins and generating projects. Check out the [Nx Console docs](https://nx.dev/getting-started/editor-setup?utm_source=nasked_project&utm_medium=readme&utm_campaign=nx_projects) to learn more.
