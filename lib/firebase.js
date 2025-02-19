import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAEEGhOE9UnpRrm5hNhn7EKmdkeykTrXTA",
  authDomain: "central-4afa2.firebaseapp.com",
  databaseURL: "https://central-4afa2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "central-4afa2",
  storageBucket: "central-4afa2.appspot.com",
  messagingSenderId: "459259253785",
  appId: "1:459259253785:web:ec348ed49471f134d1c688",
  measurementId: "G-HQ0BPPTMLV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const rtdb = getDatabase(app);

// Initialize Authentication
const auth = getAuth(app);

export { auth, rtdb };



