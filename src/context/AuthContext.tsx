import React, { createContext, useContext, useEffect, useState } from 'react';
import { isMockEnabled, auth, db } from '../services/firebase';
import { mockDb, type UserProfile } from '../services/mockDb';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password?: string) => Promise<void>;
  registerUser: (
    email: string, 
    password?: string, 
    name?: string, 
    phone?: string, 
    bloodGroup?: string, 
    contacts?: UserProfile['contacts']
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize Auth State
  useEffect(() => {
    if (isMockEnabled) {
      // Mock mode auth state listener
      const unsubscribe = mockDb.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Firebase auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch profile details from Firestore
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setCurrentUser({
                uid: firebaseUser.uid,
                ...docSnap.data()
              } as UserProfile);
            } else {
              // Document might not be created yet (in registration process)
              setCurrentUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                phone: '',
                bloodGroup: '',
                contacts: []
              });
            }
          } catch (error) {
            console.error('Error fetching Firestore user profile:', error);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  // Login handler
  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await mockDb.login(email, password || '');
      } else {
        if (!password) throw new Error('Password is required for Firebase Login');
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Registration handler
  const registerUser = async (
    email: string, 
    password?: string, 
    name = '', 
    phone = '', 
    bloodGroup = '', 
    contacts: UserProfile['contacts'] = []
  ) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        if (!password) throw new Error('Password is required for registration.');
        await mockDb.register(email, password, name, phone, bloodGroup, contacts);
      } else {
        if (!password) throw new Error('Password is required for Firebase Registration');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const profilePhoto = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
        const userProfile = {
          name,
          email,
          phone,
          bloodGroup,
          contacts,
          profilePhoto
        };

        // Save complete profile in Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
        
        setCurrentUser({
          uid: firebaseUser.uid,
          ...userProfile
        });
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        mockDb.logout();
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setLoading(false);
    }
  };

  // Profile update handler
  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user is logged in');
    
    try {
      if (isMockEnabled) {
        const updated = mockDb.updateProfile(currentUser.uid, updatedData);
        setCurrentUser(updated);
      } else {
        const docRef = doc(db, 'users', currentUser.uid);
        await updateDoc(docRef, updatedData);
        setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    isMock: isMockEnabled,
    login,
    registerUser,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
