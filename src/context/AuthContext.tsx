import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';

interface UserProfile {
  name: string;
  email: string;
  role: 'citizen' | 'municipal' | 'department';
  avatar: string;
  points?: number;
  department?: string;
  uid: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener if any
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Initial fast fetch from cache if possible
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              name: data.name || 'User',
              email: firebaseUser.email || '',
              role: data.role || 'citizen',
              avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
              points: data.points,
              department: data.department
            });
            setLoading(false);
          }
        } catch (e) {
          // Ignore cache errors, onSnapshot will handle it
        }

        // Set up real-time listener
        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              name: data.name || 'User',
              email: firebaseUser.email || '',
              role: data.role || 'citizen',
              avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
              points: data.points,
              department: data.department
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile fetch error:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Don't show full-screen spinner on home or login pages to improve perceived speed
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';
  const shouldShowSpinner = loading && !isPublicPage;

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAuthenticated: !!user }}>
      {shouldShowSpinner ? (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin dark:border-blue-400 dark:border-t-transparent"></div>
            <p className="text-slate-500 font-bold animate-pulse dark:text-slate-400">Loading your profile...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
