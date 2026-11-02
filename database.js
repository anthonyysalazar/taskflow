
const Database = require("better-sqlite3");
const path = require("path");

// Crear o abrir la base de datos.
const db = new Database(path.join(__dirname, "taskflow.db"));

// Crear la tabla principal.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Consultar las columnas existentes.
const columns = db.prepare(
  "PRAGMA table_info(tasks)"
).all();

// Añadir prioridad si todavía no existe.
if (!columns.some(column => column.name === "priority")) {
  db.exec(`
    ALTER TABLE tasks
    ADD COLUMN priority TEXT NOT NULL DEFAULT 'media'
  `);
}

// Añadir fecha límite si todavía no existe.
if (!columns.some(column => column.name === "due_date")) {
  db.exec(`
    ALTER TABLE tasks
    ADD COLUMN due_date TEXT DEFAULT NULL
  `);
}

console.log("Base de datos SQLite conectada correctamente.");

// Exportar la conexión.
module.exports = db;
