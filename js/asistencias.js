// asistencias.js
function q(id){ return document.getElementById(id); }
const msgAs = ()=> q('msgAs');

function mostrarMsgAs(t){
  msgAs().textContent = t;
  setTimeout(()=> { if(msgAs().textContent === t) msgAs().textContent = ''; }, 2500);
}

function cargarSelects(){
  dbGetAll('alumnos').then(list => {
    const grupos = [...new Set(list.map(a=>a.grupo))].sort();
    const selG = q('selGrupo'); selG.innerHTML = '<option value="">-- Seleccionar --</option>';
    grupos.forEach(g => {
      const o = document.createElement('option'); o.value = g; o.textContent = g; selG.appendChild(o);
    });
  });
}

function cargarMateriasParaGrupo(grupo){
  dbGetAll('alumnos').then(list=>{
    const materias = [...new Set(list.filter(a=>a.grupo===grupo).map(a=>a.materia))].sort();
    const selM = q('selMateria'); selM.innerHTML = '<option value="">-- Seleccionar --</option>';
    materias.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; selM.appendChild(o); });
  });
}

function renderLista(){
  const grupo = q('selGrupo').value;
  const materia = q('selMateria').value;
  const fecha = q('fecha').value;
  const div = q('lista');
  div.innerHTML = '';
  if(!grupo || !materia) { div.innerHTML = '<div class="muted">Selecciona grupo y materia.</div>'; return; }
  dbGetAll('alumnos').then(list => {
    const alumnos = list.filter(a=>a.grupo === grupo && a.materia === materia);
    if(alumnos.length === 0) { div.innerHTML = '<div class="muted">No hay alumnos.</div>'; return; }

    // construir formulario
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Alumno</th><th>Estado</th></tr></thead>';
    const tbody = document.createElement('tbody');

    // obtener asistencias existentes para esa fecha, grupo y materia
    dbGetAll('asistencias').then(records => {
      const existing = records.filter(r => r.fecha === fecha && r.grupo === grupo && r.materia === materia);
      const map = {};
      existing.forEach(r => map[r.alumnoId] = r);

      alumnos.forEach(a=>{
        const tr = document.createElement('tr');
        const tdName = document.createElement('td'); tdName.textContent = a.nombre;
        const tdCtrl = document.createElement('td');

        const estados = ['PRESENT','ABSENT','JUSTIFIED'];
        estados.forEach(est => {
          const id = `r_${a.id}_${est}`;
          const label = document.createElement('label'); label.style.marginRight='8px';
          const input = document.createElement('input'); input.type='radio'; input.name = `rad_${a.id}`; input.value = est;
          if(map[a.id] && map[a.id].estado === est) input.checked = true;
          label.appendChild(input);
          label.appendChild(document.createTextNode(' ' + (est==='PRESENT'?'Presente':est==='ABSENT'?'Falta':'Justificada')));
          tdCtrl.appendChild(label);
        });

        tr.appendChild(tdName); tr.appendChild(tdCtrl);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      div.appendChild(table);
    });
  });
}

function guardarAsistencias(){
  const grupo = q('selGrupo').value;
  const materia = q('selMateria').value;
  const fecha = q('fecha').value;
  if(!grupo || !materia || !fecha){ mostrarMsgAs('Selecciona grupo, materia y fecha.'); return; }

  dbGetAll('alumnos').then(list => {
    const alumnos = list.filter(a=>a.grupo===grupo && a.materia===materia);
    if(alumnos.length === 0){ mostrarMsgAs('No hay alumnos para guardar.'); return; }

    // para cada alumno, ver radio seleccionado y guardar/actualizar registro en 'asistencias'
    const promesas = [];
    alumnos.forEach(a => {
      const radios = document.getElementsByName(`rad_${a.id}`);
      let sel = null;
      for(const r of radios){ if(r.checked){ sel = r.value; break; } }
      if(sel){
        // comprobar si existe registro para fecha+alumno
        dbGetAll('asistencias').then(records => {
          const existe = records.find(r => r.fecha===fecha && r.alumnoId===a.id && r.materia===materia && r.grupo===grupo);
          if(existe){
            existe.estado = sel;
            dbPut('asistencias', existe);
          } else {
            dbAdd('asistencias', { fecha, alumnoId: a.id, estado: sel, materia, grupo });
          }
        });
      }
    });

    // esperar un momento y notificar (simplificado)
    setTimeout(()=> { mostrarMsgAs('Asistencias guardadas.'); }, 600);
  });
}

window.addEventListener('DOMContentLoaded', ()=>{
  dbReady.then(()=> {
    // inicializar fecha a hoy
    q('fecha').value = new Date().toISOString().slice(0,10);
    cargarSelects();
    renderLista();
  });

  q('selGrupo').addEventListener('change', (e)=> { cargarMateriasParaGrupo(e.target.value); setTimeout(renderLista,200); });
  q('selMateria').addEventListener('change', renderLista);
  q('fecha').addEventListener('change', renderLista);
  q('btnGuardarAsis').addEventListener('click', guardarAsistencias);
  q('btnLimpiarSel').addEventListener('click', ()=> { const radios = document.querySelectorAll('#lista input[type=radio]'); radios.forEach(r=> r.checked=false); });
});

