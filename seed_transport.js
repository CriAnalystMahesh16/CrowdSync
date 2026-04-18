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

async function seedTransport() {
  await setDoc(doc(db, "transport", "main"), {
    buses_available: 12,
    metro_timing: "Next train in 4 mins",
    cab_availability: "Low Wait Time"
  });
  console.log("Seeded transport/main data");
}

seedTransport();
