# Todo App

A full-stack task manager built with a **React (Vite)** frontend, a **Flask** REST API, and a **PostgreSQL** database. The whole stack runs with a single `docker compose up`, but can also be run locally without Docker for development.

---

## Features

- Create, read, update, and delete tasks (full CRUD)
- Inline editing of task titles (double-click or the ✎ button)
- Filters: **All / Active / Done**
- Toggle completion with a checkbox
- PostgreSQL with a **connection pool** on the backend
- Secrets kept in a `.env` file (never committed)

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite, served by nginx    |
| Backend   | Flask + Gunicorn (Python 3.12)      |
| Database  | PostgreSQL 16                       |
| Driver    | psycopg2 (with `ThreadedConnectionPool`) |
| Runtime   | Docker Compose (3 containers)       |

The **nginx** container serves the built React app and reverse-proxies `/api` to the Flask backend, so only one port is exposed to the outside world.

---

## Project Structure

```
todo-app/
├── .env                  # secrets (git-ignored)
├── .env.example          # template without real passwords
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py            # Flask API
└── frontend/
    ├── Dockerfile        # multi-stage: Node build → nginx serve
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── style.css
```

---

## Prerequisites

- [Docker](https://www.docker.com/) with Docker Compose (bundled with Docker Desktop)

---

## Getting Started (Docker)

1. **Clone the repository and enter it:**

   ```bash
   git clone <your-repo-url>
   cd todo-app
   ```

2. **Create your environment file** from the template and set a password:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and fill in `POSTGRES_PASSWORD` and `ADMIN_PASSWORD`.

3. **Build and start all containers:**

   ```bash
   docker compose up --build
   ```

4. **Open the app:**

   - Application: <http://localhost:3000>

The `tasks` table is created automatically on first startup.

---

## Environment Variables

| Variable            | Description                          | Example              |
|---------------------|--------------------------------------|----------------------|
| `POSTGRES_DB`       | Database name                        | `tododb`             |
| `POSTGRES_USER`     | Database user                        | `todouser`           |
| `POSTGRES_PASSWORD` | Database password                    | `change_me_please`   |
| `DB_HOST`           | Database host (service name)         | `db`                 |
| `DB_PORT`           | Database port                        | `5432`               |

Only `.env.example` is committed to git; the real `.env` is ignored.

---

## API Reference

Base path: `/api`

| Method   | Endpoint           | Description              | Body                       |
|----------|--------------------|--------------------------|----------------------------|
| `GET`    | `/api/tasks`       | List all tasks           | —                          |
| `POST`   | `/api/tasks`       | Create a task            | `{ "title": "..." }`       |
| `PATCH`  | `/api/tasks/:id`   | Update title and/or done | `{ "title": "...", "done": true }` |
| `DELETE` | `/api/tasks/:id`   | Delete a task            | —                          |

A task object looks like:

```json
{
  "id": 1,
  "title": "Buy milk",
  "done": false,
  "created_at": "2026-01-15T10:30:00+00:00"
}
```

---

## Useful Docker Commands

```bash
docker compose up -d            # start in the background
docker compose logs -f backend  # follow backend logs
docker compose down             # stop and remove containers (data is kept)
docker compose down -v          # also remove the database volume (wipes data)
```

Database data lives in the named volume `pgdata` and survives rebuilds and `down` (unless you pass `-v`).

---

## How It Works

1. The browser loads the React app served by **nginx**.
2. React calls `fetch("/api/...")`.
3. nginx reverse-proxies `/api` to the **Flask** backend.
4. Flask talks to **PostgreSQL** through a connection pool.

Because nginx fronts everything, only port `3000` is exposed; the backend and database stay on the private Compose network.

---

## License

MIT — use it however you like.
