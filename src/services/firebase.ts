import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, setDoc, updateDoc, increment, getDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user profile exists, if not create it
    const userRef = doc(db, 'users', user.uid);
    let userSnap;
    try {
      userSnap = await getDoc(userRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }
    
    if (!userSnap?.exists()) {
      try {
        await setDoc(userRef, {
          displayName: user.displayName,
          photoURL: user.photoURL,
          totalEarnings: 0,
          totalTransactions: 0,
          createdAt: new Date().toISOString(),
          role: 'user'
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const updateUserProfile = async (user: any, displayName: string, photoURL: string) => {
  try {
    // 1. Update Auth Profile
    const isDataUri = photoURL.startsWith('data:');
    if (!isDataUri || photoURL.length < 2000) {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });
    } else {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    // 2. Update Firestore User Document
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        displayName: displayName,
        photoURL: photoURL
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }

    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Helper to add transaction
export const addTransaction = async (userId: string, data: any) => {
  try {
    // Add transaction record
    try {
      await addDoc(collection(db, 'transactions'), {
        userId,
        ...data,
        date: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }

    // Update user stats
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, {
        totalEarnings: increment(Number(data.amount)),
        totalTransactions: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

// Helper to get leaderboard
export const getLeaderboard = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('totalEarnings', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
};

// Helper to get user transactions
export const getUserTransactions = async (userId: string) => {
  try {
    const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'transactions');
    return [];
  }
};

// Helper to get posts
export const getPosts = async () => {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'posts');
    return [];
  }
};

// Helper to add post
export const addPost = async (userId: string, authorName: string, authorPhoto: string, content: string, imageUrl?: string) => {
  try {
    await addDoc(collection(db, 'posts'), {
      userId,
      authorName,
      authorPhoto,
      content,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      likes: 0,
      commentCount: 0
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'posts');
  }
};

// Helper to delete post
export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }
};

// Helper to add comment
export const addComment = async (postId: string, userId: string, authorName: string, authorPhoto: string, content: string, parentId?: string) => {
  const postRef = doc(db, 'posts', postId);
  try {
    await addDoc(collection(postRef, 'comments'), {
      userId,
      authorName,
      authorPhoto,
      content,
      parentId: parentId || null,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
  }

  try {
    await updateDoc(postRef, {
      commentCount: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
  }
};

// Helper to get comments
export const getComments = async (postId: string) => {
  const postRef = doc(db, 'posts', postId);
  try {
    const q = query(collection(postRef, 'comments'), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`);
    return [];
  }
};

// Helper to toggle like
export const toggleLike = async (postId: string, userId: string) => {
  const postRef = doc(db, 'posts', postId);
  const likeRef = doc(collection(postRef, 'likes'), userId);

  try {
    let likeDoc;
    try {
      likeDoc = await getDoc(likeRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `posts/${postId}/likes/${userId}`);
    }

    if (likeDoc?.exists()) {
      // Unlike
      try {
        await deleteDoc(likeRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${postId}/likes/${userId}`);
      }
      
      try {
        await updateDoc(postRef, {
          likes: increment(-1)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
      }
      return false;
    } else {
      // Like
      try {
        await setDoc(likeRef, {
          userId,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/likes/${userId}`);
      }
      
      try {
        await updateDoc(postRef, {
          likes: increment(1)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
      }
      return true;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

// Helper to check if user liked a post
export const checkIfLiked = async (postId: string, userId: string) => {
  try {
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `posts/${postId}/likes/${userId}`);
    return false;
  }
};

// Helper to reset user earnings
export const resetUserEarnings = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalEarnings: 0,
      totalTransactions: 0
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    return false;
  }
};

// Helper to reset user history
export const resetUserHistory = async (userId: string) => {
  try {
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'transactions');
    return false;
  }
};

// Helper to delete a single transaction
export const deleteTransaction = async (transactionId: string, userId: string, amount: number) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    await deleteDoc(transactionRef);
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalEarnings: increment(-amount),
      totalTransactions: increment(-1)
    });
    
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `transactions/${transactionId}`);
    return false;
  }
};

// Helper to update post
export const updatePost = async (postId: string, content: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      content: content
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
  }
};

// Helper to reset all data (Admin only)
export const resetAllData = async () => {
  try {
    const collections = ['users', 'transactions', 'posts'];
    
    for (const colName of collections) {
      const q = query(collection(db, colName));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
    
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'multiple');
    return false;
  }
};

