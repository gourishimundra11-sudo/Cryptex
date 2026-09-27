import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  collectionGroup,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/firebase';
import { HistoryItem, AdminUserRecord, ADMIN_EMAIL } from '../types/crypto';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  cloudTransformations: HistoryItem[];
  saveTransformationToCloud: (item: HistoryItem) => Promise<void>;
  clearCloudTransformations: () => Promise<void>;
  fetchAllUsers: () => Promise<AdminUserRecord[]>;
  fetchAllTransformations: () => Promise<HistoryItem[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cloudTransformations, setCloudTransformations] = useState<HistoryItem[]>([]);

  const isAdmin = Boolean(user && user.email === ADMIN_EMAIL);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        setError(null);

        if (currentUser) {
          // Sync or create user profile document in Firestore
          const userDocPath = `users/${currentUser.uid}`;
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            const now = new Date().toISOString();
            const safeDisplayName = (currentUser.displayName || 'Cryptographer').slice(0, 100);
            const safeEmail = (currentUser.email || `${currentUser.uid}@cryptex.local`).slice(0, 256);
            const safePhotoURL = (currentUser.photoURL || '').slice(0, 2048);

            if (!userSnap.exists()) {
              await setDoc(userRef, {
                userId: currentUser.uid,
                email: safeEmail,
                displayName: safeDisplayName,
                photoURL: safePhotoURL,
                createdAt: now,
                lastLoginAt: now,
              });
            } else {
              await setDoc(
                userRef,
                {
                  displayName: safeDisplayName,
                  photoURL: safePhotoURL,
                  lastLoginAt: now,
                },
                { merge: true }
              );
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, userDocPath);
          }
        } else {
          setCloudTransformations([]);
        }

        setLoading(false);
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to user's transformations in Firestore when logged in
  useEffect(() => {
    if (!user) {
      setCloudTransformations([]);
      return;
    }

    const transformationsPath = `users/${user.uid}/transformations`;
    const colRef = collection(db, 'users', user.uid, 'transformations');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: HistoryItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: data.id || docSnap.id,
            timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
            algorithmId: data.algorithmId,
            algorithmName: data.algorithmName,
            parametersSummary: data.parametersSummary || '',
            plaintextSnippet: data.plaintextSnippet || (data.plaintext ? data.plaintext.slice(0, 45) : ''),
            plaintext: data.plaintext || data.plaintextSnippet || '',
            ciphertext: data.ciphertext,
            inputLength: data.inputLength || 0,
            outputLength: data.outputLength || 0,
            documentName: data.documentName,
            isAiConverted: data.isAiConverted,
            userId: data.userId,
            userEmail: data.userEmail,
            userDisplayName: data.userDisplayName,
          });
        });

        // Sort descending by timestamp
        items.sort((a, b) => b.timestamp - a.timestamp);
        setCloudTransformations(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, transformationsPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Sign in with Google Popup
  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      setError((err as Error).message);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out failed:', err);
      setError((err as Error).message);
    }
  };

  // Save transformation to user's Firestore subcollection and central audit_logs collection
  const saveTransformationToCloud = async (item: HistoryItem) => {
    if (!user) return;

    // Path validation: sanitize document ID
    const sanitizedId = (item.id || `tx_${Date.now()}`)
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 128);
    const docPath = `users/${user.uid}/transformations/${sanitizedId}`;
    const auditPath = `audit_logs/${sanitizedId}`;

    const safePlaintext = (item.plaintext || item.plaintextSnippet || '').slice(0, 100000);
    const safeSnippet = (item.plaintextSnippet || safePlaintext.slice(0, 45)).slice(0, 500);

    const basePayload: Record<string, any> = {
      id: sanitizedId,
      userId: user.uid,
      userEmail: (user.email || `${user.uid}@cryptex.local`).slice(0, 256),
      userDisplayName: (user.displayName || 'Cryptographer').slice(0, 100),
      algorithmId: (item.algorithmId || 'custom').slice(0, 50),
      algorithmName: (item.algorithmName || 'Cipher').slice(0, 100),
      ciphertext: (item.ciphertext || '').slice(0, 100000),
      inputLength: typeof item.inputLength === 'number' ? item.inputLength : safePlaintext.length,
      outputLength: typeof item.outputLength === 'number' ? item.outputLength : (item.ciphertext?.length || 0),
      isAiConverted: Boolean(item.isAiConverted),
      createdAt: new Date(item.timestamp || Date.now()).toISOString(),
    };

    if (safePlaintext) {
      basePayload.plaintext = safePlaintext;
    }
    if (safeSnippet) {
      basePayload.plaintextSnippet = safeSnippet;
    }
    if (item.parametersSummary) {
      basePayload.parametersSummary = item.parametersSummary.slice(0, 256);
    }
    if (item.documentName) {
      basePayload.documentName = item.documentName.slice(0, 256);
    }

    // 1. Write to user's private transformation subcollection
    try {
      const docRef = doc(db, 'users', user.uid, 'transformations', sanitizedId);
      await setDoc(docRef, basePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }

    // 2. Write to central /audit_logs Firestore collection for supervisor audit
    try {
      const auditDocRef = doc(db, 'audit_logs', sanitizedId);
      const auditPayload = {
        ...basePayload,
        eventType: item.isAiConverted ? 'ai_conversion' : item.documentName ? 'document_upload' : 'conversion',
      };
      await setDoc(auditDocRef, auditPayload);
    } catch (err) {
      // Non-blocking for user if error occurs, but logged
      console.warn('Central audit_logs write notice:', err);
    }
  };

  // Clear cloud transformations for current user
  const clearCloudTransformations = async () => {
    if (!user) return;

    const colPath = `users/${user.uid}/transformations`;
    try {
      const colRef = collection(db, 'users', user.uid, 'transformations');
      const snap = await getDocs(colRef);
      const deletePromises = snap.docs.map((d: QueryDocumentSnapshot) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setCloudTransformations([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, colPath);
    }
  };

  // Admin: Fetch all registered users
  const fetchAllUsers = async (): Promise<AdminUserRecord[]> => {
    if (!user || user.email !== ADMIN_EMAIL) return [];

    const usersPath = 'users';
    try {
      const snap = await getDocs(collection(db, usersPath));
      const users: AdminUserRecord[] = [];

      for (const d of snap.docs) {
        const uData = d.data();
        users.push({
          userId: d.id,
          email: uData.email || 'unknown@cryptex.local',
          displayName: uData.displayName || 'Anonymous User',
          photoURL: uData.photoURL || '',
          createdAt: uData.createdAt,
          lastLoginAt: uData.lastLoginAt,
        });
      }

      users.sort((a, b) => {
        const timeA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const timeB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return timeB - timeA;
      });

      return users;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, usersPath);
    }
  };

  // Admin: Fetch all transformations across all users directly from audit_logs collection
  const fetchAllTransformations = async (): Promise<HistoryItem[]> => {
    if (!user || user.email !== ADMIN_EMAIL) return [];

    const itemsMap = new Map<string, HistoryItem>();

    // 1. Primary source: Central /audit_logs collection
    try {
      const auditSnap = await getDocs(collection(db, 'audit_logs'));
      auditSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = data.id || docSnap.id;
        itemsMap.set(id, {
          id,
          timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
          algorithmId: data.algorithmId,
          algorithmName: data.algorithmName,
          parametersSummary: data.parametersSummary || '',
          plaintextSnippet: data.plaintextSnippet || (data.plaintext ? data.plaintext.slice(0, 45) : ''),
          plaintext: data.plaintext || data.plaintextSnippet || '',
          ciphertext: data.ciphertext,
          inputLength: data.inputLength || 0,
          outputLength: data.outputLength || 0,
          documentName: data.documentName,
          isAiConverted: data.isAiConverted,
          userId: data.userId,
          userEmail: data.userEmail,
          userDisplayName: data.userDisplayName,
        });
      });
    } catch (auditErr) {
      console.warn('Direct audit_logs collection query notice:', auditErr);
    }

    // 2. Secondary source: scan user transformations to ensure historical entries are included
    try {
      const cgRef = collectionGroup(db, 'transformations');
      const snap = await getDocs(cgRef);
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = data.id || docSnap.id;
        if (!itemsMap.has(id)) {
          itemsMap.set(id, {
            id,
            timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
            algorithmId: data.algorithmId,
            algorithmName: data.algorithmName,
            parametersSummary: data.parametersSummary || '',
            plaintextSnippet: data.plaintextSnippet || (data.plaintext ? data.plaintext.slice(0, 45) : ''),
            plaintext: data.plaintext || data.plaintextSnippet || '',
            ciphertext: data.ciphertext,
            inputLength: data.inputLength || 0,
            outputLength: data.outputLength || 0,
            documentName: data.documentName,
            isAiConverted: data.isAiConverted,
            userId: data.userId,
            userEmail: data.userEmail,
            userDisplayName: data.userDisplayName,
          });
        }
      });
    } catch (cgErr) {
      // Fallback: per-user scan if collectionGroup needs index
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const uDoc of usersSnap.docs) {
          const uData = uDoc.data();
          try {
            const txSnap = await getDocs(collection(db, 'users', uDoc.id, 'transformations'));
            txSnap.forEach((docSnap) => {
              const data = docSnap.data();
              const id = data.id || docSnap.id;
              if (!itemsMap.has(id)) {
                itemsMap.set(id, {
                  id,
                  timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
                  algorithmId: data.algorithmId,
                  algorithmName: data.algorithmName,
                  parametersSummary: data.parametersSummary || '',
                  plaintextSnippet: data.plaintextSnippet || (data.plaintext ? data.plaintext.slice(0, 45) : ''),
                  plaintext: data.plaintext || data.plaintextSnippet || '',
                  ciphertext: data.ciphertext,
                  inputLength: data.inputLength || 0,
                  outputLength: data.outputLength || 0,
                  documentName: data.documentName,
                  isAiConverted: data.isAiConverted,
                  userId: data.userId || uDoc.id,
                  userEmail: data.userEmail || uData.email,
                  userDisplayName: data.userDisplayName || uData.displayName,
                });
              }
            });
          } catch {
            // ignore individual user read error
          }
        }
      } catch (userScanErr) {
        console.warn('Fallback scan error:', userScanErr);
      }
    }

    const result = Array.from(itemsMap.values());
    result.sort((a, b) => b.timestamp - a.timestamp);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        signInWithGoogle,
        logout,
        cloudTransformations,
        saveTransformationToCloud,
        clearCloudTransformations,
        fetchAllUsers,
        fetchAllTransformations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
