// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, update, remove, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

export const firebaseConfig = {
  apiKey: "PÉGALA_AQUÍ",
  authDomain: "PÉGALA_AQUÍ",
  databaseURL: "PÉGALA_AQUÍ",
  projectId: "PÉGALA_AQUÍ",
  storageBucket: "PÉGALA_AQUÍ",
  messagingSenderId: "PÉGALA_AQUÍ",
  appId: "PÉGALA_AQUÍ"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, update, remove, child };
