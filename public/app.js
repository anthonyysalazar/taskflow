
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const priorityInput = document.getElementById("task-priority");
const dueDateInput = document.getElementById("task-due-date");
const searchInput = document.getElementById("task-search");
const list = document.getElementById("task-list");

const totalTasks = document.getElementById("total-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const completedTasks = document.getElementById("completed-tasks");

const progressBar = document.getElementById("progress-bar");
const progressPercentage = document.getElementById("progress-percentage");

const filterButtons = document.querySelectorAll(".filter-btn");

let allTasks = [];
let currentFilter = "all";
let searchText = "";

async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error("Error al cargar las tareas");
    }

    allTasks = await response.json();

    updateStats();
    renderTasks();

  } catch (error) {
    console.error(error);
    list.textContent = "No se pudieron cargar las tareas.";
  }
}

// Actualizar estadísticas y progreso.
function updateStats() {
  const total = allTasks.length;

  const completed = allTasks.filter(
    task => Boolean(task.completed)
  ).length;

  const pending = total - completed;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  totalTasks.textContent = total;
  pendingTasks.textContent = pending;
  completedTasks.textContent = completed;

  progressBar.style.width = percentage + "%";
  progressPercentage.textContent = percentage + "%";
}

// Formatear fechas.
function formatDate(date) {
  if (!date) return "Sin fecha límite";

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

// Renderizar tareas.
function renderTasks() {
  list.innerHTML = "";

  const filteredTasks = allTasks.filter(task => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "pending" && !task.completed) ||
      (currentFilter === "completed" && Boolean(task.completed));

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (filteredTasks.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No se encontraron tareas.";
    list.appendChild(empty);
    return;
  }

  filteredTasks.forEach(renderTask);
}

// Crear tarjeta.
function renderTask(task) {
  const item = document.createElement("li");
  const description = document.createElement("span");
  const priorityBadge = document.createElement("span");
  const dateBadge = document.createElement("span");
  const details = document.createElement("div");
  const actions = document.createElement("div");

  description.textContent = task.title;

  if (task.completed) {
    description.classList.add("completed");
  }

  priorityBadge.textContent =
    "Prioridad: " + (task.priority || "media");

  priorityBadge.className =
    "priority-badge priority-" + (task.priority || "media");

  dateBadge.textContent =
    task.due_date
      ? "Vence: " + formatDate(task.due_date)
      : "Sin fecha límite";

  dateBadge.className = "date-badge";

  if (task.due_date && !task.completed) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.due_date + "T00:00:00");

    if (deadline < today) {
      dateBadge.classList.add("date-overdue");
      dateBadge.textContent = "Vencida: " + formatDate(task.due_date);
    } else if (deadline.getTime() === today.getTime()) {
      dateBadge.classList.add("date-today");
    }
  }

  details.append(priorityBadge, dateBadge);

  const completeButton = document.createElement("button");

  completeButton.textContent = task.completed
    ? "Reabrir"
    : "Completar";

  completeButton.className = "complete-btn";

  completeButton.addEventListener("click", async () => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        completed: !Boolean(task.completed)
      })
    });

    if (response.ok) await loadTasks();
  });

  const deleteButton = document.createElement("button");

  deleteButton.textContent = "Eliminar";
  deleteButton.className = "delete-btn";

  deleteButton.addEventListener("click", async () => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "DELETE"
    });

    if (response.ok) await loadTasks();
  });

  actions.append(completeButton, deleteButton);

  item.append(description, details, actions);
  list.appendChild(item);
}

// Crear tarea.
form.addEventListener("submit", async event => {
  event.preventDefault();

  const title = input.value.trim();

  if (!title) return;

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        priority: priorityInput.value,
        due_date: dueDateInput.value || null
      })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "No se pudo crear la tarea");
    }

    input.value = "";
    priorityInput.value = "media";
    dueDateInput.value = "";

    await loadTasks();
    input.focus();

  } catch (error) {
    alert(error.message);
  }
});

// Buscador.
searchInput.addEventListener("input", () => {
  searchText = searchInput.value.trim();
  renderTasks();
});

// Filtros.
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderTasks();
  });
});

loadTasks();
