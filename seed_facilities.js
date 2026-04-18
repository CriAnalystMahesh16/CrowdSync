import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function seedFacilities() {
  const facilitiesCol = collection(db, "facilities");
  
  // Clear existing
  const snapshot = await getDocs(facilitiesCol);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, "facilities", docSnap.id));
  }
  
  const initialFacilities = [
    { type: 'toilet', name: 'Restroom North', current: 15, capacity: 20 },
    { type: 'food', name: 'Hotdogs & Burgers', queue: 8, avg_time: 2 },
    { type: 'parking', name: 'Parking Lot B', total: 500, occupied: 420 },
    { type: 'toilet', name: 'Restroom South', current: 5, capacity: 15 }
  ];

  for (const fac of initialFacilities) {
    await addDoc(facilitiesCol, fac);
    console.log(`Added facility: ${fac.name}`);
  }
}

seedFacilities();
