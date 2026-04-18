import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "crowdsync-5e3e1",
  appId: "1:247708709546:web:60de651dc2f5efe173d6d3",
  storageBucket: "crowdsync-5e3e1.firebasestorage.app",
  apiKey: "AIzaSyBCwgjZJMvfayZUKQeqja5yBGNO3Zypd7k",
  authDomain: "crowdsync-5e3e1.firebaseapp.com",
  messagingSenderId: "247708709546",
  projectNumber: "247708709546"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const gates = [
  { id: 'gate_a', name: 'Gate A', crowd: 180, capacity: 200 },
  { id: 'gate_b', name: 'Gate B', crowd: 45, capacity: 200 },
  { id: 'gate_c', name: 'Gate C', crowd: 120, capacity: 200 }
];

async function seedGates() {
  for (const gate of gates) {
    await setDoc(doc(db, "gates", gate.id), {
      name: gate.name,
      crowd: gate.crowd,
      capacity: gate.capacity
    });
  }
  console.log("Seeded 3 gates successfully");
}

seedGates();
