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

const zones = [
  { id: 'zone_a', name: 'Zone A', crowd: 95, capacity: 100 },
  { id: 'zone_b', name: 'Zone B', crowd: 65, capacity: 100 },
  { id: 'zone_c', name: 'Zone C', crowd: 85, capacity: 100 },
  { id: 'zone_d', name: 'Zone D', crowd: 12, capacity: 100 }
];

async function seedStadium() {
  for (const zone of zones) {
    await setDoc(doc(db, "zones", zone.id), {
      name: zone.name,
      crowd: zone.crowd,
      capacity: zone.capacity
    });
  }
  console.log("Seeded 4 zones successfully");
}

seedStadium();
