import { useState, useEffect } from "react";

const MAX_TITLE_LENGTH = 25;

// Returns an error message
function validateTitle(title) {
  if (!title.trim()) return "Title can't be empty";
  if (title.length > MAX_TITLE_LENGTH) {
    return `Too long: ${title.length}/${MAX_TITLE_LENGTH} characters`;
  }
  return null;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");

  const loadTasks = async () => {
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
  };
  useEffect(() => { loadTasks(); }, []);

  const addTask = async () => {
    const title = input.trim();
    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const { error: message } = await res.json().catch(() => ({}));
      setError(message || "Failed to add task");
      return;
    }
    setError("");
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
    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const { error: message } = await res.json().catch(() => ({}));
      setError(message || "Failed to save task");
      return;
    }
    setError("");
    setEditingId(null);
    setEditText("");
    loadTasks();
  };

  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const labels = { all: "All", active: "Active", done: "Done" };

  return (
    <main className="container">
      <h1>📋 My ToDo List</h1>

      <div className="add-row">
        <input
          value={input}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="What you need to do?"
        />
        <button onClick={addTask}>Add</button>
      </div>

      {error && <p className="error">{error}</p>}

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
                  maxLength={MAX_TITLE_LENGTH}
                  autoFocus
                  onChange={(e) => {
                    setEditText(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                />
                <button onClick={() => saveEdit(task.id)}>💾</button>
                <button onClick={() => setEditingId(null)}>X</button>
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

      {visible.length === 0 && <p className="empty">Empty</p>}
    </main>
  );
}