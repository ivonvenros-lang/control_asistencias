/* db.js
   Provee window.dbReady Promise que se resuelve cuando IndexedDB está listo
   y funciones helper para CRUD simples.
*/
(function(){
  const DB_NAME = 'asistenciasDB_v1';
  const DB_VERSION = 1;
  let db = null;

  function abrirDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (ev) => {
        db = ev.target.result;
        if(!db.objectStoreNames.contains('alumnos')){
          const os = db.createObjectStore('alumnos', { keyPath: 'id', autoIncrement: true });
          os.createIndex('grupo', 'grupo', { unique: false });
        }
        if(!db.objectStoreNames.contains('asistencias')){
          const os2 = db.createObjectStore('asistencias', { keyPath: 'id', autoIncrement: true });
          // cada registro de asistencias tendrá: fecha (YYYY-MM-DD), alumnoId (number), estado ('PRESENT'|'ABSENT'|'JUSTIFIED'), materia, grupo
          os2.createIndex('fecha', 'fecha', { unique: false });
          os2.createIndex('alumnoId', 'alumnoId', { unique: false });
        }
      };
      req.onsuccess = (ev) => {
        db = ev.target.result;
        resolve(db);
      };
      req.onerror = (ev) => {
        console.error('IndexedDB error', ev);
        reject(ev);
      };
    });
  }

  // Exponer promesa global para que otros scripts esperen DB lista
  window.dbReady = abrirDB();

  // helpers CRUD simples
  window.dbAdd = function(storeName, obj){
    return window.dbReady.then(db => new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.add(obj);
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e);
    }));
  };

  window.dbPut = function(storeName, obj){
    return window.dbReady.then(db => new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(obj);
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e);
    }));
  };

  window.dbGetAll = function(storeName){
    return window.dbReady.then(db => new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e);
    }));
  };

  window.dbDelete = function(storeName, key){
    return window.dbReady.then(db => new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => res(true);
      req.onerror = (e) => rej(e);
    }));
  };

  window.dbQueryIndex = function(storeName, indexName, value){
    return window.dbReady.then(db => new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(value);
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e);
    }));
  };

})();
