import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, setDoc, updateDoc, getDoc, getDocs, collection, onSnapshot, deleteDoc, query, where } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User } from "firebase/auth";
import firebaseAppletConfig from "../firebase-applet-config.json";

const env = (import.meta as any).env || {};

function getValidApiKey(): string {
  const envKey = env.VITE_FIREBASE_API_KEY;
  if (typeof envKey === 'string' && envKey.trim().startsWith('AIza') && envKey.trim().length > 15) {
    return envKey.trim();
  }
  return firebaseAppletConfig?.apiKey || "AIzaSyC2HKQLcC_6sMDo49ufQWANt1LwpnKXMqg";
}

function getValidAuthDomain(): string {
  const envDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
  if (typeof envDomain === 'string' && envDomain.trim().includes('.') && envDomain.trim().length > 5) {
    return envDomain.trim();
  }
  return firebaseAppletConfig?.authDomain || "gocnhocuatunn.firebaseapp.com";
}

const firebaseConfig = {
  apiKey: getValidApiKey(),
  authDomain: getValidAuthDomain(),
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig?.projectId || "gocnhocuatunn",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig?.storageBucket || "gocnhocuatunn.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig?.messagingSenderId || "227094223631",
  appId: env.VITE_FIREBASE_APP_ID || firebaseAppletConfig?.appId || "1:227094223631:web:3cc735a2e36829f6ef3c7a",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig?.measurementId || "G-BQ0LP5JE0R",
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig?.firestoreDatabaseId || "(default)"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
  } catch (error: any) {
    console.error("Redirect result error:", error);
    throw error;
  }
  return null;
}

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.warn("Popup sign-in failed or blocked, attempting redirect...", error);
    const code = error?.code || "";
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      String(error?.message).toLowerCase().includes('popup')
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function registerWithEmailPassword(email: string, pass: string, displayName: string, photoURL?: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, {
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || "https://i.imgur.com/ALMc8Ct.jpeg"
      });
    }
    return cred.user;
  } catch (error: any) {
    console.error("Email register error:", error);
    throw error;
  }
}

export async function loginWithEmailPassword(email: string, pass: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    console.error("Email login error:", error);
    throw error;
  }
}

export async function updateUserCustomProfile(displayName: string, photoURL: string) {
  if (!auth.currentUser) throw new Error("No user logged in");
  try {
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL
    });
    return auth.currentUser;
  } catch (error: any) {
    console.error("Update profile error:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

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
  let errorMsg = "";
  try {
    const seen = new WeakSet();
    errorMsg = JSON.stringify(errInfo, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    });
  } catch {
    errorMsg = `Firestore Error in ${operationType} at ${path}: ${errInfo.error}`;
  }
  console.error("Firestore Error: ", errorMsg);
  throw new Error(errorMsg);
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

// Fetch all artwork IDs a user has liked
export async function getUserLikedArtworks(userId: string): Promise<Record<string, boolean>> {
  const collectionName = "user_art_likes";
  try {
    const q = query(collection(db, collectionName), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const likedMap: Record<string, boolean> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.artworkId) {
        likedMap[data.artworkId] = true;
      }
    });
    return likedMap;
  } catch (error) {
    console.error("Error fetching user liked artworks:", error);
    return {};
  }
}

// Increment like count for an artwork
export async function likeArtwork(userId: string, artworkId: string): Promise<number> {
  // 1. Record user's like in user_art_likes
  const userLikesColl = "user_art_likes";
  const userLikeDocId = `${userId}_${artworkId}`;
  const userLikeDocRef = doc(db, userLikesColl, userLikeDocId);
  try {
    await setDoc(userLikeDocRef, {
      userId,
      artworkId,
      likedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving user like record:", error);
  }

  // 2. Increment global art_likes count
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
export async function unlikeArtwork(userId: string, artworkId: string): Promise<number> {
  // 1. Delete user's like record
  const userLikesColl = "user_art_likes";
  const userLikeDocId = `${userId}_${artworkId}`;
  const userLikeDocRef = doc(db, userLikesColl, userLikeDocId);
  try {
    await deleteDoc(userLikeDocRef);
  } catch (error) {
    console.error("Error deleting user like record:", error);
  }

  // 2. Decrement global art_likes count
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

export interface SubmittedArtworkData {
  id: string;
  title: string;
  artist: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  likes?: number;
  tags?: string[];
}

// Submit a new artwork
export async function submitArtwork(artwork: {
  title: string;
  artist: string;
  description: string;
  imageUrl: string;
}): Promise<string> {
  const collectionName = "artworks";
  const artId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, collectionName, artId);
  try {
    const payload = {
      title: artwork.title,
      artist: artwork.artist,
      description: artwork.description,
      imageUrl: artwork.imageUrl,
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, payload);
    return artId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${artId}`);
    throw error;
  }
}

// Subscribe to artworks real-time updates
export function subscribeToArtworks(callback: (artworks: SubmittedArtworkData[]) => void) {
  const collectionName = "artworks";
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const artList: SubmittedArtworkData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.imageUrl && data.title) {
          artList.push({
            id: docSnap.id,
            title: data.title || "Tác phẩm",
            artist: data.artist || "Vô danh",
            description: data.description || "",
            imageUrl: data.imageUrl,
            createdAt: data.createdAt || new Date().toISOString(),
            likes: 0,
            tags: []
          });
        }
      });
      // Sort newest first
      artList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(artList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}


