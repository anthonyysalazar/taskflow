
const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

// Configuración del servidor.
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ======================================
// 1. CONSULTAR TODAS LAS TAREAS
// ======================================

app.get("/api/tasks", (req, res) => {
  try {
    const tasks = db.prepare(
      "SELECT * FROM tasks ORDER BY id DESC"
    ).all();

    res.json(tasks);

  } catch (error) {
    console.error("Error al consultar tareas:", error);
    res.status(500).json({
      error: "Error al consultar las tareas"
    });
  }
});

// ======================================
// 2. CREAR UNA TAREA
// ======================================

app.post("/api/tasks", (req, res) => {
  try {
    const {
      title,
      priority = "media",
      due_date = null
    } = req.body;

    const validPriorities = ["baja", "media", "alta"];

    // Validar título.
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "El título es obligatorio"
      });
    }

    // Validar prioridad.
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: "Prioridad no válida"
      });
    }

    // Validar fecha.
    let validDate = true;

    if (due_date !== null && due_date !== "") {
      if (
        typeof due_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(due_date)
      ) {
        validDate = false;
      } else {
        const parsedDate = new Date(due_date + "T00:00:00");

        validDate =
          !Number.isNaN(parsedDate.getTime()) &&
          parsedDate.getFullYear() === Number(due_date.slice(0, 4)) &&
          parsedDate.getMonth() + 1 === Number(due_date.slice(5, 7)) &&
          parsedDate.getDate() === Number(due_date.slice(8, 10));
      }
    }

    if (!validDate) {
      return res.status(400).json({
        error: "Fecha no válida"
      });
    }

    const finalDate = due_date || null;

    // Guardar tarea en SQLite.
    const result = db.prepare(`
      INSERT INTO tasks (title, priority, due_date)
      VALUES (?, ?, ?)
    `).run(title.trim(), priority, finalDate);

    // Recuperar tarea creada.
    const task = db.prepare(
      "SELECT * FROM tasks WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json(task);

  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({
      error: "Error al crear la tarea"
    });
  }
});

// ======================================
// 3. MODIFICAR ESTADO DE UNA TAREA
// ======================================

app.patch("/api/tasks/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const { completed } = req.body;

    if (!Number.isInteger(id) || id <= 0 ||
        typeof completed !== "boolean") {
      return res.status(400).json({
        error: "Datos no válidos"
      });
    }

    const result = db.prepare(
      "UPDATE tasks SET completed = ? WHERE id = ?"
    ).run(completed ? 1 : 0, id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    const task = db.prepare(
      "SELECT * FROM tasks WHERE id = ?"
    ).get(id);

    res.json(task);

  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    res.status(500).json({
      error: "Error al actualizar la tarea"
    });
  }
});

// ======================================
// 4. ELIMINAR UNA TAREA
// ======================================

app.delete("/api/tasks/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Identificador no válido"
      });
    }

    const result = db.prepare(
      "DELETE FROM tasks WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    res.json({
      mensaje: "Tarea eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    res.status(500).json({
      error: "Error al eliminar la tarea"
    });
  }
});

// ======================================
// 5. COMPROBAR ESTADO DEL SERVIDOR
// ======================================

app.get("/api/status", (req, res) => {
  res.json({
    mensaje: "TaskFlow funciona correctamente"
  });
});

// ======================================
// INICIAR SERVIDOR
// ======================================

app.listen(PORT, () => {
  console.log("Base de datos conectada.");
  console.log(`TaskFlow disponible en http://localhost:${PORT}`);
});
