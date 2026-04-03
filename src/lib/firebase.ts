import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLnCqPbPghS4o4a8XybcrwQ2A8UGnzkC4",
  authDomain: "vendasgestor-9f461.firebaseapp.com",
  projectId: "vendasgestor-9f461",
  storageBucket: "vendasgestor-9f461.firebasestorage.app",
  messagingSenderId: "946821411021",
  appId: "1:946821411021:web:a41740e38c39dacc663984",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
