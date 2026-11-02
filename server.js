
const express = require("express");
const path = require("path");

const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ======================================
// 1. CONSULTAR TODAS LAS TAREAS
// ======================================

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await db.getTasks();
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

app.post("/api/tasks", async (req, res) => {
  try {
    const {
      title,
      priority = "media",
      due_date = null
    } = req.body;

    const validPriorities = ["baja", "media", "alta"];

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "El título es obligatorio"
      });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: "Prioridad no válida"
      });
    }

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

    const task = await db.createTask(
      title.trim(),
      priority,
      due_date || null
    );

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

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { completed } = req.body;

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        error: "Datos no válidos"
      });
    }

    const task = await db.updateTask(id, completed);

    if (!task) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

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

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Identificador no válido"
      });
    }

    const deleted = await db.deleteTask(id);

    if (!deleted) {
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

async function startServer() {
  try {
    await db.init();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Base de datos conectada correctamente.");
      console.log(`TaskFlow disponible en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error("No se pudo iniciar TaskFlow:", error);
    process.exit(1);
  }
}

startServer();
