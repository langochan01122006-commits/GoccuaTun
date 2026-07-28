const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, setDoc } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");

const app = initializeApp(config);

async function forceMigrate() {
  const dbOld = getFirestore(app, "ai-studio-897c2c74-0fe0-4370-985c-54e0fb03ccf6");
  const dbNew = getFirestore(app, "ai-studio-gccatun-897c2c74-0fe0-4370-985c-54e0fb03ccf6");

  try {
    const snapOld = await getDocs(collection(dbOld, "votes"));
    console.log("Old DB votes found:", snapOld.size);
    for (const d of snapOld.docs) {
      console.log("Copying vote:", d.id, d.data());
      await setDoc(doc(dbNew, "votes", d.id), d.data());
    }
  } catch (e) {
    console.error("Error reading old DB:", e.message);
  }

  try {
    const snapOldArt = await getDocs(collection(dbOld, "art_likes"));
    console.log("Old DB art_likes found:", snapOldArt.size);
    for (const d of snapOldArt.docs) {
      console.log("Copying art_like:", d.id, d.data());
      await setDoc(doc(dbNew, "art_likes", d.id), d.data());
    }
  } catch (e) {
    console.error("Error reading old DB art_likes:", e.message);
  }

  const snapNew = await getDocs(collection(dbNew, "votes"));
  console.log("New DB votes total after sync:", snapNew.size);
  snapNew.forEach(d => console.log(d.id, d.data()));
}

forceMigrate();
