const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, setDoc } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");

const app = initializeApp(config);

async function migrate() {
  const db1 = getFirestore(app, "ai-studio-897c2c74-0fe0-4370-985c-54e0fb03ccf6");
  const db2 = getFirestore(app, "ai-studio-gccatun-897c2c74-0fe0-4370-985c-54e0fb03ccf6");

  console.log("Reading from db1 (ai-studio-897c2c74...)...");
  let snap1;
  try {
    snap1 = await getDocs(collection(db1, "votes"));
    console.log("db1 votes size:", snap1.size);
    snap1.forEach(d => console.log("db1 vote:", d.id, d.data()));
  } catch (e) {
    console.log("db1 error:", e.message);
  }

  console.log("Reading from db2 (ai-studio-gccatun-...)...");
  let snap2;
  try {
    snap2 = await getDocs(collection(db2, "votes"));
    console.log("db2 votes size:", snap2.size);
    snap2.forEach(d => console.log("db2 vote:", d.id, d.data()));
  } catch (e) {
    console.log("db2 error:", e.message);
  }

  // If db1 has votes and db2 doesn't, copy db1 to db2 and set config to db1!
  if (snap1 && snap1.size > 0 && (!snap2 || snap2.size === 0)) {
    console.log("Migrating votes from db1 to db2...");
    for (const d of snap1.docs) {
      await setDoc(doc(db2, "votes", d.id), d.data());
    }
    console.log("Migration complete!");
  }
}

migrate();
