import { useState, useEffect } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const loadTasks = async () => {
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
  };
  useEffect(() => { loadTasks(); }, []);

  const addTask = async () => {
    const title = input.trim();
    if (!title) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setInput("");
    loadTasks();
  };

  const toggleTask = async (task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    loadTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  };

  const startEdit = (task) => { setEditingId(task.id); setEditText(task.title); };

  const saveEdit = async (id) => {
    const title = editText.trim();
    if (!title) return;
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setEditingId(null);
    setEditText("");
    loadTasks();
  };

  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const labels = { all: "Все", active: "Активные", done: "Выполненные" };

  return (
    <main className="container">
      <h1>📋 Мои задачи</h1>

      <div className="add-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Что нужно сделать?"
        />
        <button onClick={addTask}>Добавить</button>
      </div>

      <div className="filters">
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {labels[f]}
          </button>
        ))}
      </div>

      <ul>
        {visible.map((task) => (
          <li key={task.id} className={task.done ? "done" : ""}>
            {editingId === task.id ? (
              <>
                <input
                  className="edit-input"
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                />
                <button onClick={() => saveEdit(task.id)}>💾</button>
                <button onClick={() => setEditingId(null)}>✕</button>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={!!task.done}
                  onChange={() => toggleTask(task)}
                />
                <span className="title" onDoubleClick={() => startEdit(task)}>
                  {task.title}
                </span>
                <button className="edit" onClick={() => startEdit(task)}>✎</button>
                <button className="delete" onClick={() => deleteTask(task.id)}>✕</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {visible.length === 0 && <p className="empty">Задач нет</p>}
    </main>
  );
}