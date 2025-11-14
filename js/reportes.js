// reportes.js
function q(id){ return document.getElementById(id); }

function poblarGrupos(){
  dbGetAll('alumnos').then(list=>{
    const grupos = [...new Set(list.map(a=>a.grupo))].sort();
    const sel = q('filGrupo'); sel.innerHTML = '<option value="">--Todos--</option>';
    grupos.forEach(g=>{
      const o = document.createElement('option'); o.value = g; o.textContent = g; sel.appendChild(o);
    });
  });
}

function poblarAnios(){
  // poblar años basados en asistencias si existen, o rango 2020-2030
  dbGetAll('asistencias').then(records=>{
    const años = new Set(records.map(r => (r.fecha||'').slice(0,4)).filter(x=>x));
    const sel = q('selAnio');
    sel.innerHTML = '';
    const current = new Date().getFullYear();
    // si hay años en registros, usarlos; si no, crear rango actual-5 .. actual+1
    if(años.size){
      const arr = [...años].sort();
      arr.forEach(y => { const o = document.createElement('option'); o.value = y; o.textContent = y; sel.appendChild(o); });
    } else {
      for(let y = current-5; y <= current+1; y++){
        const o = document.createElement('option'); o.value = y; o.textContent = y; sel.appendChild(o);
      }
    }
    // agregar opcion vacia para "todos"
    const first = document.createElement('option'); first.value = ''; first.textContent = '--Todos--';
    sel.insertBefore(first, sel.firstChild);
  });
}

function generarReporte(){
  const grupoFiltro = q('filGrupo').value;
  const mesFiltro = q('selMes').value;   // '01'..'12' or ''
  const anioFiltro = q('selAnio').value; // '2025' or ''
  Promise.all([dbGetAll('alumnos'), dbGetAll('asistencias')]).then(([alumnos, asistencias])=>{
    const tbody = q('tablaReportes').querySelector('tbody');
    tbody.innerHTML = '';
    const list = alumnos.filter(a => !grupoFiltro || a.grupo === grupoFiltro);

    list.forEach(a=>{
      let regs = asistencias.filter(r => r.alumnoId === a.id);
      // aplicar filtro por mes/año si existe
      if(anioFiltro) regs = regs.filter(r => (r.fecha||'').slice(0,4) === anioFiltro);
      if(mesFiltro) regs = regs.filter(r => (r.fecha||'').slice(5,7) === mesFiltro);

      const asist = regs.filter(r=> r.estado === 'PRESENT').length;
      const falt = regs.filter(r=> r.estado === 'ABSENT').length;
      const just = regs.filter(r=> r.estado === 'JUSTIFIED').length;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.nombre}</td><td>${a.grupo}</td><td>${a.materia}</td><td>${asist}</td><td>${falt}</td><td>${just}</td>`;
      tbody.appendChild(tr);
    });
  });
}

function exportarJSON(){
  Promise.all([dbGetAll('alumnos'), dbGetAll('asistencias')]).then(([a, as])=>{
    const data = { alumnos: a, asistencias: as };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement('a'); aEl.href = url; aEl.download = 'reporte_asistencias.json'; aEl.click();
    URL.revokeObjectURL(url);
  });
}

// ---------- Exportar CSV por mes ----------
function exportarCSVporMes(){
  const mes = q('selMes').value;   // '01'..'12' or ''
  const anio = q('selAnio').value; // '' or year
  if(!mes || !anio){
    if(!mes && !anio) {
      if(!confirm('No seleccionaste mes ni año. ¿Deseas exportar todo el histórico?')) return;
    } else {
      alert('Selecciona mes y año para exportar CSV.'); return;
    }
  }

  Promise.all([dbGetAll('alumnos'), dbGetAll('asistencias')]).then(([alumnos, asistencias])=>{
    // filtrar asistencias por mes y año
    const regs = asistencias.filter(r => {
      if(!r.fecha) return false;
      const fmes = r.fecha.slice(5,7);
      const fanio = r.fecha.slice(0,4);
      return fmes === mes && fanio === anio;
    });

    // crear mapa por alumno
    const mapa = {};
    regs.forEach(r => {
      if(!mapa[r.alumnoId]) mapa[r.alumnoId] = { present:0, absent:0, justified:0, nombre:'', grupo:'', materia:'' };
      if(r.estado==='PRESENT') mapa[r.alumnoId].present++;
      if(r.estado==='ABSENT') mapa[r.alumnoId].absent++;
      if(r.estado==='JUSTIFIED') mapa[r.alumnoId].justified++;
    });

    // completar datos de nombre/grupo/materia
    alumnos.forEach(a => {
      if(mapa[a.id]) {
        mapa[a.id].nombre = a.nombre;
        mapa[a.id].grupo = a.grupo;
        mapa[a.id].materia = a.materia;
      }
    });

    // construir CSV
    const headers = ['Alumno','Grupo','Materia','Asistencias','Faltas','Justificadas'];
    const rows = [headers.join(',')];
    Object.values(mapa).forEach(r => {
      rows.push([`"${r.nombre}"`, r.grupo, `"${r.materia}"`, r.present, r.absent, r.justified].join(','));
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencias_${anio}_${mes}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ---------- Exportar PDF (captura de la tabla) ----------
async function exportarPDF(){
  // capturar la tabla (solo el área principal)
  const tabla = document.getElementById('tablaReportes');
  if(!tabla) { alert('Tabla no encontrada'); return; }

  // usar html2canvas para capturar, luego jsPDF para crear PDF (landscape si ancho grande)
  try{
    const canvas = await html2canvas(tabla, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'pt', 'a4'); // landscape
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // escalar la imagen para caber en la página manteniendo ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const w = imgWidth * ratio;
    const h = imgHeight * ratio;
    const x = (pageWidth - w) / 2;
    const y = 20;

    pdf.addImage(imgData, 'PNG', x, y, w,
