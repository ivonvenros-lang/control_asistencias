// main.js
window.addEventListener('DOMContentLoaded', () => {
  // ejemplo: nada por ahora, pero sirve para mostrar mensaje cuando DB lista
  window.dbReady.then(()=> {
    console.log('DB lista');
  }).catch(e=> console.error(e));
});
