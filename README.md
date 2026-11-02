# TaskFlow – Aplicación web de gestión de tareas

## 1. Descripción del proyecto

TaskFlow es una aplicación web diseñada para facilitar la organización y gestión de tareas personales. Permite crear tareas, clasificarlas según su prioridad, establecer fechas límite y controlar su estado de realización.

El proyecto ha sido desarrollado como parte del Proyecto Intermodular del ciclo formativo de Desarrollo de Aplicaciones Web (DAW).

## 2. Tecnologías utilizadas

- **HTML5:** estructura de la aplicación.
- **CSS3:** diseño visual y estilos.
- **JavaScript:** funcionalidades e interacción con el usuario.
- **Node.js:** entorno de ejecución del servidor.
- **Express:** gestión de rutas y API REST.
- **SQLite:** almacenamiento de datos.
- **Git y GitHub:** control de versiones y alojamiento del código.

## 3. Funcionalidades principales

- Crear nuevas tareas.
- Marcar tareas como completadas.
- Reabrir tareas pendientes.
- Eliminar tareas.
- Asignar prioridades: baja, media y alta.
- Establecer fechas límite.
- Buscar tareas por palabras.
- Filtrar tareas por estado.
- Consultar estadísticas de tareas.
- Visualizar el progreso de finalización.
- Guardar los datos mediante SQLite.

## 4. Instalación y ejecución

### Requisitos previos

- Node.js instalado.
- npm instalado.

### Pasos

1. Clonar el repositorio:

   `git clone https://github.com/anthonysalazar/taskflow.git`

2. Acceder a la carpeta:

   `cd taskflow`

3. Instalar las dependencias:

   `npm install`

4. Iniciar el servidor:

   `node server.js`

5. Abrir la aplicación en el navegador:

   `http://localhost:3000`

## 5. Estructura del proyecto

- `public/`: archivos del frontend.
- `capturas/`: imágenes de las pruebas y funcionalidades.
- `database.js`: configuración y gestión de SQLite.
- `server.js`: servidor y API REST.
- `package.json`: configuración y dependencias.
- `.gitignore`: archivos excluidos del control de versiones.

## 6. Base de datos

TaskFlow utiliza SQLite para almacenar las tareas, incluyendo su título, estado, prioridad y fecha límite.

## 7. Autor

Proyecto desarrollado por Anthony Salazar como parte del ciclo formativo de Desarrollo de Aplicaciones Web (DAW).