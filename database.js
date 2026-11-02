
require("dotenv").config();

const path = require("path");
const Database = require("better-sqlite3");
const { Pool } = require("pg");

const usePostgres = Boolean(process.env.DATABASE_URL);

let db;
let pool;

// ======================================
// CONEXIÓN A LA BASE DE DATOS
// ======================================

async function init() {
  if (usePostgres) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        priority TEXT NOT NULL DEFAULT 'media',
        due_date DATE DEFAULT NULL
      )
    `);

    console.log("Conectado a PostgreSQL (Neon).");

  } else {
    db = new Database(path.join(__dirname, "taskflow.db"));

    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        priority TEXT NOT NULL DEFAULT 'media',
        due_date TEXT DEFAULT NULL
      )
    `);

    const columns = db.prepare(
      "PRAGMA table_info(tasks)"
    ).all();

    if (!columns.some(column => column.name === "priority")) {
      db.exec(`
        ALTER TABLE tasks
        ADD COLUMN priority TEXT NOT NULL DEFAULT 'media'
      `);
    }

    if (!columns.some(column => column.name === "due_date")) {
      db.exec(`
        ALTER TABLE tasks
        ADD COLUMN due_date TEXT DEFAULT NULL
      `);
    }

    console.log("Conectado a SQLite.");
  }
}

// ======================================
// CONSULTAR TAREAS
// ======================================

async function getTasks() {
  if (usePostgres) {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );
    return result.rows;
  }

  return db.prepare(
    "SELECT * FROM tasks ORDER BY id DESC"
  ).all();
}

// ======================================
// CREAR TAREA
// ======================================

async function createTask(title, priority, dueDate) {
  if (usePostgres) {
    const result = await pool.query(
      `INSERT INTO tasks (title, priority, due_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, priority, dueDate]
    );

    return result.rows[0];
  }

  const result = db.prepare(`
    INSERT INTO tasks (title, priority, due_date)
    VALUES (?, ?, ?)
  `).run(title, priority, dueDate);

  return db.prepare(
    "SELECT * FROM tasks WHERE id = ?"
  ).get(result.lastInsertRowid);
}

// ======================================
// ACTUALIZAR TAREA
// ======================================

async function updateTask(id, completed) {
  if (usePostgres) {
    const result = await pool.query(
      `UPDATE tasks SET completed = $1
       WHERE id = $2 RETURNING *`,
      [completed ? 1 : 0, id]
    );

    return result.rows[0] || null;
  }

  const result = db.prepare(
    "UPDATE tasks SET completed = ? WHERE id = ?"
  ).run(completed ? 1 : 0, id);

  if (result.changes === 0) return null;

  return db.prepare(
    "SELECT * FROM tasks WHERE id = ?"
  ).get(id);
}

// ======================================
// ELIMINAR TAREA
// ======================================

async function deleteTask(id) {
  if (usePostgres) {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    );

    return result.rowCount > 0;
  }

  const result = db.prepare(
    "DELETE FROM tasks WHERE id = ?"
  ).run(id);

  return result.changes > 0;
}

module.exports = {
  init,
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
