
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database initialized");
}

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Todo API is running!",
  });
});

// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM todos
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET todos error:", error);

    res.status(500).json({
      message: "Failed to fetch todos",
    });
  }
});

// Get single todo
app.get("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM todos WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET todo error:", error);

    res.status(500).json({
      message: "Failed to fetch todo",
    });
  }
});

// Create todo
app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO todos (title)
      VALUES ($1)
      RETURNING *
      `,
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE todo error:", error);

    res.status(500).json({
      message: "Failed to create todo",
    });
  }
});

// Update todo
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const result = await pool.query(
      `
      UPDATE todos
      SET
        title = COALESCE($1, title),
        completed = COALESCE($2, completed)
      WHERE id = $3
      RETURNING *
      `,
      [
        title !== undefined ? title.trim() : null,
        completed !== undefined ? completed : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE todo error:", error);

    res.status(500).json({
      message: "Failed to update todo",
    });
  }
});

// Toggle todo
app.patch("/api/todos/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE todos
      SET completed = NOT completed
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("TOGGLE todo error:", error);

    res.status(500).json({
      message: "Failed to toggle todo",
    });
  }
});

// Delete todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM todos
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.json({
      message: "Todo deleted",
      todo: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE todo error:", error);

    res.status(500).json({
      message: "Failed to delete todo",
    });
  }
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
