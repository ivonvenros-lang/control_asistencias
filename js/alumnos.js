// alumnos.js
function q(id){ return document.getElementById(id); }
const msgEl = () => q('msg');

function mostrarMsg(t){
  msgEl().textContent = t;
  setTimeout(()=> { if(msgEl().textContent === t) msgEl().textContent = ''; }, 2500);
}

function limpiarCampos(){
  q('nombre').value = '';
  q('grupo').value = '';
  q('materia').value = '';
}

function renderAlumnos(filtro=''){
  dbGetAll('alumnos').then(list => {
    const tbody = document.querySelector('#tablaAlumnos tbody');
    tbody.innerHTML = '';
    list.filter(a => a.nombre.toLowerCase().includes(filtro.toLowerCase())).forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.nombre}</td>
                      <td>${a.grupo}</td>
                      <td>${a.materia}</td>
                      <td>
                        <button class="small" onclick="eliminarAlumno(${a.id})">Eliminar</button>
                      </td>`;
      tbody.appendChild(tr);
    });
  });
}

function guardarAlumno(){
  const nombre = q('nombre').value.trim();
  const grupo = q('grupo').value.trim().toUpperCase();
  const materia = q('materia').value.trim();
  if(!nombre || !grupo || !materia){ mostrarMsg('Rellena todos los campos'); return; }
  dbAdd('alumnos', { nombre, grupo, materia }).then(id=>{
    mostrarMsg('Alumno guardado');
    limpiarCampos();
    renderAlumnos();
  }).catch(e => { console.error(e); mostrarMsg('Error al guardar'); });
}

function eliminarAlumno(id){
  if(!confirm('¿Eliminar alumno y sus registros de asistencia?')) return;
  // eliminar alumno
  dbDelete('alumnos', id).then(()=>{
    // eliminar asistencias relacionadas
    dbGetAll('asistencias').then(list => {
      const promesas = list.filter(r => r.alumnoId === id).map(r => dbDelete('asistencias', r.id));
      Promise.all(promesas).then(()=> {
        renderAlumnos();
        mostrarMsg('Alumno y registros eliminados');
      });
    });
  });
}

window.addEventListener('DOMContentLoaded', ()=>{
  // esperar DB lista
  window.dbReady.then(()=> renderAlumnos());
  q('btnGuardar').addEventListener('click', guardarAlumno);
  q('btnLimpiar').addEventListener('click', limpiarCampos);
  q('btnRefrescar').addEventListener('click', ()=> renderAlumnos(q('filtro').value.trim()));
  q('filtro').addEventListener('input', e=> renderAlumnos(e.target.value.trim()));
});
