import os
import time
import psycopg2
import psycopg2.extras
from psycopg2 import pool
from contextlib import contextmanager
from flask import Flask, request, jsonify

app = Flask(__name__)

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     os.getenv("DB_PORT", "5432"),
    "dbname":   os.getenv("DB_NAME", "tododb"),
    "user":     os.getenv("DB_USER", "todouser"),
    "password": os.getenv("DB_PASSWORD", "todopass"),
}

connection_pool = None


def init_pool():
    """Создаём пул. Ретраим, пока БД поднимается (гонка при старте контейнеров)."""
    global connection_pool
    for attempt in range(10):
        try:
            connection_pool = pool.ThreadedConnectionPool(
                minconn=1, maxconn=10, **DB_CONFIG
            )
            print("Пул соединений создан")
            return
        except psycopg2.OperationalError:
            print(f"БД ещё не готова, попытка {attempt + 1}/10...")
            time.sleep(2)
    raise RuntimeError("Не удалось подключиться к БД")


@contextmanager
def get_conn():
    """Берём соединение из пула и гарантированно возвращаем обратно."""
    conn = connection_pool.getconn()
    conn.cursor_factory = psycopg2.extras.RealDictCursor
    try:
        yield conn
    finally:
        conn.rollback()  # закрываем незакоммиченную транзакцию, если осталась
        connection_pool.putconn(conn)


def init_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id         SERIAL PRIMARY KEY,
                    title      TEXT        NOT NULL,
                    done       BOOLEAN     NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """)
        conn.commit()
    print("Таблица готова")


# --- API ---
@app.get("/api/tasks")
def get_tasks():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM tasks ORDER BY id DESC")
        return jsonify(cur.fetchall())


@app.post("/api/tasks")
def create_task():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Название не может быть пустым"}), 400
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO tasks (title) VALUES (%s) RETURNING *", (title,))
            row = cur.fetchone()
        conn.commit()
    return jsonify(row), 201


@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id):
    data = request.get_json() or {}
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
            row = cur.fetchone()
            if row is None:
                return jsonify({"error": "Задача не найдена"}), 404

            task = dict(row)
            if "title" in data:
                new_title = (data.get("title") or "").strip()
                if not new_title:
                    return jsonify({"error": "Название не может быть пустым"}), 400
                task["title"] = new_title
            if "done" in data:
                task["done"] = bool(data["done"])

            cur.execute(
                "UPDATE tasks SET title = %s, done = %s WHERE id = %s RETURNING *",
                (task["title"], task["done"], task_id),
            )
            updated = cur.fetchone()
        conn.commit()
    return jsonify(updated)


@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
            deleted = cur.rowcount
        conn.commit()
    if deleted == 0:
        return jsonify({"error": "Error 404"}), 404
    return "", 204


#  gunicorn
init_pool()
init_db()

if __name__ == "__main__":
    # Docker: python app.py
    app.run(host="0.0.0.0", port=5000, debug=True)