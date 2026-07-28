import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const snapshot = await getDocs(collection(db, "votes"));
    const votesMap = {};
    snapshot.forEach(docSnap => {
      votesMap[docSnap.id] = docSnap.data();
    });
    console.log("Current votes in Firestore:", votesMap);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
