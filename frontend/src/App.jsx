
import { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Get todos
  async function fetchTodos() {
    try {
      const response = await fetch("http://localhost:4000/api/todos");

      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }

      const data = await response.json();

      setTodos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  // Create todo
  async function addTodo(event) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      const newTodo = await response.json();

      setTodos((currentTodos) => [newTodo, ...currentTodos]);

      setTitle("");
    } catch (error) {
      console.error(error);
    }
  }

  // Toggle todo
  async function toggleTodo(id) {
    try {
      const response = await fetch(`/api/todos/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle todo");
      }

      const updatedTodo = await response.json();

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  // Delete todo
  async function deleteTodo(id) {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="app">
      <div className="todo-container">
        <header>
          <h1>Todo App</h1>

          <p>
            {completedCount} of {todos.length} completed
          </p>
        </header>

        <form className="todo-form" onSubmit={addTodo}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <button type="submit">
            Add Todo
          </button>
        </form>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : todos.length === 0 ? (
          <div className="empty">
            <p>No todos yet.</p>
            <span>Add your first task above.</span>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map((todo) => (
              <div
                className={`todo-item ${
                  todo.completed ? "completed" : ""
                }`}
                key={todo.id}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />

                  <span>{todo.title}</span>
                </label>

                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

