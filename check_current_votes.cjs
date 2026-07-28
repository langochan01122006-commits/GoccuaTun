const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const snap = await getDocs(collection(db, "votes"));
  console.log("Current DB votes:", config.firestoreDatabaseId);
  snap.forEach(d => console.log(d.id, d.data()));
}
check();
