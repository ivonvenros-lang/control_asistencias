import { getDatabase, ref, set, get, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const db = getDatabase();

// Registrar alumno
function guardarAlumno(grupo, materia, nombre) {
  set(ref(db, 'alumnos/' + grupo + '/' + materia + '/' + nombre), {
    asistencias: 0,
    faltas: 0,
    justificaciones: 0
  });
  alert('Alumno guardado en la base de datos');
}

// Consultar alumnos
function cargarAlumnos(grupo, materia) {
  get(ref(db, 'alumnos/' + grupo + '/' + materia)).then(snapshot => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      alert("No hay alumnos registrados");
    }
  });
}


  <main>
    <div class="card" onclick="location.href='alumnos.html'">
      <div class="icon-box blue">
        <i data-lucide="users"></i>
      </div>
      <h3>Gestión de Alumnos</h3>
      <p>Agrega, edita o consulta alumnos por grupo y materia.</p>
    </div>

    <div class="card" onclick="location.href='asistencias.html'">
      <div class="icon-box green">
        <i data-lucide="calendar-check"></i>
      </div>
      <h3>Registro de Asistencias</h3>
      <p>Marca las asistencias, faltas o justificaciones por día.</p>
    </div>

    <div class="card" onclick="location.href='reportes.html'">
      <div class="icon-box orange">
        <i data-lucide="file-chart-column"></i>
      </div>
      <h3>Reportes y Exportaciones</h3>
      <p>Consulta reportes por mes y exporta los datos en CSV o PDF.</p>
    </div>
  </main>

  <footer>
    <p>Hecho con ❤️ para la educación • Proyecto académico 2025</p>
    <p>
      <a href="https://github.com" target="_blank">Publicar en GitHub Pages</a> · 
      <a href="#" target="_blank">Manual de usuario</a>
    </p>
  </footer>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>

      color: #93c5fd;
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>

  <header class="hero">
    <h1>📘 Sistema de Control de Asistencias</h1>
    <p>Administra fácilmente tus alumnos, materias y asistencias diarias.</p>
  </header>

  <main>
    <section class="menu-grid">
      <div class="menu-card" onclick="location.href='alumnos.html'">
        <i data-lucide="user-graduate"></i>
        <h3>Gestión de Alumnos</h3>
        <p>Agrega, edita y visualiza los alumnos registrados por grupo y materia.</p>
      </div>

      <div class="menu-card" onclick="location.href='asistencias.html'">
        <i data-lucide="calendar-check-2"></i>
        <h3>Registro de Asistencias</h3>
        <p>Marca las asistencias, faltas y justificaciones de cada estudiante.</p>
      </div>

      <div class="menu-card" onclick="location.href='reportes.html'">
        <i data-lucide="bar-chart-3"></i>
        <h3>Reportes y Exportaciones</h3>
        <p>Consulta totales por grupo o mes y exporta datos en CSV o PDF.</p>
      </div>
    </section>
  </main>

  <footer>
    <p>Hecho con ❤️ para la educación • Proyecto académico</p>
    <p>
      <a href="https://github.com" target="_blank">Publicar en GitHub Pages</a> ·
      <a href="#" target="_blank">Guía de uso</a>
    </p>
  </footer>

  <script>
    lucide.createIcons();
  </script>

</body>
</html>
