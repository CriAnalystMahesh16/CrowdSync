import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "crowdsync-5e3e1",
  appId: "1:247708709546:web:60de651dc2f5efe173d6d3",
  storageBucket: "crowdsync-5e3e1.firebasestorage.app",
  apiKey: process.env.VITE_API_KEY,
  authDomain: "crowdsync-5e3e1.firebaseapp.com",
  messagingSenderId: "247708709546",
  projectNumber: "247708709546"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedUser() {
  await setDoc(doc(db, "users", "user_1"), {
    name: "Mahesh",
    zone: "Zone A",
    status: "AWAY"
  });
  console.log("Seeded user_1 with Zone A");
}

seedUser();
