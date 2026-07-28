import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, setDoc, updateDoc, getDoc, getDocs, collection, onSnapshot } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Get all votes
export async function getAllVotes(): Promise<Record<string, number>> {
  const collectionName = "votes";
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const votesMap: Record<string, number> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && typeof data.votes === "number") {
        votesMap[docSnap.id] = data.votes;
      }
    });
    return votesMap;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return {};
  }
}

// Increment vote count for a character
export async function voteForCharacter(characterId: string): Promise<number> {
  const collectionName = "votes";
  const docRef = doc(db, collectionName, characterId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentVotes = docSnap.data().votes || 0;
      const newVotes = currentVotes + 1;
      await updateDoc(docRef, { votes: newVotes });
      return newVotes;
    } else {
      const initialVotes = 1;
      await setDoc(docRef, {
        characterId,
        votes: initialVotes
      });
      return initialVotes;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${characterId}`);
    return 0;
  }
}

// Decrement vote count for a character
export async function unvoteForCharacter(characterId: string): Promise<number> {
  const collectionName = "votes";
  const docRef = doc(db, collectionName, characterId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentVotes = docSnap.data().votes || 0;
      const newVotes = Math.max(0, currentVotes - 1);
      await updateDoc(docRef, { votes: newVotes });
      return newVotes;
    }
    return 0;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${characterId}`);
    return 0;
  }
}

// Get all art likes
export async function getAllArtLikes(): Promise<Record<string, number>> {
  const collectionName = "art_likes";
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const likesMap: Record<string, number> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && typeof data.likes === "number") {
        likesMap[docSnap.id] = data.likes;
      }
    });
    return likesMap;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return {};
  }
}

// Increment like count for an artwork
export async function likeArtwork(artworkId: string): Promise<number> {
  const collectionName = "art_likes";
  const docRef = doc(db, collectionName, artworkId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || 0;
      const newLikes = currentLikes + 1;
      await updateDoc(docRef, { likes: newLikes });
      return newLikes;
    } else {
      const initialLikes = 1;
      await setDoc(docRef, {
        artworkId,
        likes: initialLikes
      });
      return initialLikes;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${artworkId}`);
    return 0;
  }
}

// Decrement like count for an artwork
export async function unlikeArtwork(artworkId: string): Promise<number> {
  const collectionName = "art_likes";
  const docRef = doc(db, collectionName, artworkId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || 0;
      const newLikes = Math.max(0, currentLikes - 1);
      await updateDoc(docRef, { likes: newLikes });
      return newLikes;
    }
    return 0;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${artworkId}`);
    return 0;
  }
}

// Real-time listener for votes
export function subscribeToVotes(callback: (votesMap: Record<string, number>) => void) {
  const collectionName = "votes";
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const votesMap: Record<string, number> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && typeof data.votes === "number") {
          votesMap[docSnap.id] = data.votes;
        }
      });
      callback(votesMap);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

// Real-time listener for art likes
export function subscribeToArtLikes(callback: (likesMap: Record<string, number>) => void) {
  const collectionName = "art_likes";
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const likesMap: Record<string, number> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && typeof data.likes === "number") {
          likesMap[docSnap.id] = data.likes;
        }
      });
      callback(likesMap);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

