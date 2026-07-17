import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, setDoc, updateDoc, getDoc, getDocs, collection, query, orderBy, where, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export interface BlogPost {
  id: string;
  author: string;
  content: string;
  createdAt: string; // ISO String
  userId: string;
  title: string;
  character: string;
  category: string;
  reactions: number;
  reactedUsers?: string[];
  image_url?: string;
  audio_url?: string;
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

// Create blog post in Firestore
export async function createBlogPost(post: Omit<BlogPost, "createdAt" | "reactions" | "reactedUsers">): Promise<BlogPost> {
  const collectionName = "blog_posts";
  const docRef = doc(db, collectionName, post.id);
  const fullPost: BlogPost = {
    ...post,
    createdAt: new Date().toISOString(),
    reactions: 0,
    reactedUsers: []
  };
  try {
    await setDoc(docRef, fullPost);
    return fullPost;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${post.id}`);
    throw error;
  }
}

// Fetch all blog posts ordered by createdAt descending
export async function getAllBlogPosts(category?: string): Promise<BlogPost[]> {
  const collectionName = "blog_posts";
  try {
    const q = category && category !== "GALLERY" ? 
      query(collection(db, collectionName), where("category", "==", category)) : 
      query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    const posts: BlogPost[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        posts.push({
          id: docSnap.id,
          author: data.author || "Người ẩn danh",
          content: data.content || "",
          createdAt: data.createdAt || new Date().toISOString(),
          userId: data.userId || "",
          title: data.title || "",
          character: data.character || "Tất cả",
          category: data.category || "BLOG",
          reactions: typeof data.reactions === "number" ? data.reactions : 0,
          reactedUsers: Array.isArray(data.reactedUsers) ? data.reactedUsers : [],
          image_url: data.image_url || "",
          audio_url: data.audio_url || ""
        });
      }
    });
    
    // Sort by createdAt descending since we removed orderBy from query to avoid missing index errors
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return posts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
}

// React or toggle like on a blog post
export async function toggleLikeBlogPost(postId: string, userId: string): Promise<{ reactions: number; reactedUsers: string[] }> {
  const collectionName = "blog_posts";
  const docRef = doc(db, collectionName, postId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as BlogPost;
      const currentReactedUsers = Array.isArray(data.reactedUsers) ? data.reactedUsers : [];
      let newReactedUsers = [...currentReactedUsers];
      let newReactions = data.reactions || 0;

      if (newReactedUsers.includes(userId)) {
        newReactedUsers = newReactedUsers.filter(uid => uid !== userId);
        newReactions = Math.max(0, newReactions - 1);
      } else {
        newReactedUsers.push(userId);
        newReactions = newReactions + 1;
      }

      await updateDoc(docRef, {
        reactions: newReactions,
        reactedUsers: newReactedUsers
      });
      return { reactions: newReactions, reactedUsers: newReactedUsers };
    }
    return { reactions: 0, reactedUsers: [] };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${postId}`);
    return { reactions: 0, reactedUsers: [] };
  }
}

export interface GalleryPost {
  id: string;
  image_url: string;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
  author: string;
}

export async function createGalleryPost(post: Omit<GalleryPost, "created_at">): Promise<GalleryPost> {
  const collectionName = "gallery_posts";
  const docRef = doc(db, collectionName, post.id);
  const fullPost: GalleryPost = {
    ...post,
    created_at: new Date().toISOString()
  };
  try {
    await setDoc(docRef, fullPost);
    return fullPost;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${post.id}`);
    throw error;
  }
}

export async function getAllGalleryPosts(): Promise<GalleryPost[]> {
  const collectionName = "gallery_posts";
  try {
    const q = query(collection(db, collectionName), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    const posts: GalleryPost[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        posts.push({
          id: docSnap.id,
          image_url: data.image_url || "",
          title: data.title || "",
          description: data.description || "",
          created_at: data.created_at || new Date().toISOString(),
          user_id: data.user_id || "",
          author: data.author || "Người ẩn danh"
        });
      }
    });
    return posts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
}

// Delete a blog post
export async function deleteBlogPost(postId: string): Promise<void> {
  const collectionName = "blog_posts";
  const docRef = doc(db, collectionName, postId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${postId}`);
    throw error;
  }
}

export interface BlogComment {
  id: string;
  author: string;
  content: string;
  createdAt: number; // timestamp
  userId: string;
}

// Create comment under blog post
export async function createBlogComment(postId: string, comment: Omit<BlogComment, "createdAt">): Promise<BlogComment> {
  const collectionName = `blog_posts/${postId}/comments`;
  const docRef = doc(db, collectionName, comment.id);
  const fullComment: BlogComment = {
    ...comment,
    createdAt: Date.now()
  };
  try {
    await setDoc(docRef, fullComment);
    return fullComment;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${comment.id}`);
    throw error;
  }
}

// Fetch comments for a blog post
export async function getBlogComments(postId: string): Promise<BlogComment[]> {
  const collectionName = `blog_posts/${postId}/comments`;
  try {
    const q = query(collection(db, collectionName), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const comments: BlogComment[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        comments.push({
          id: docSnap.id,
          author: data.author || "Người ẩn danh",
          content: data.content || "",
          createdAt: data.createdAt || Date.now(),
          userId: data.userId || ""
        });
      }
    });
    return comments;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
}

// Delete a blog comment
export async function deleteBlogComment(postId: string, commentId: string): Promise<void> {
  const collectionName = `blog_posts/${postId}/comments`;
  const docRef = doc(db, collectionName, commentId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${commentId}`);
    throw error;
  }
}

