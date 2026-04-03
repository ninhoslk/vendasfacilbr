import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isMock: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUser = {
  uid: "mock-user",
  email: "demo@vendas.app",
  displayName: "Vendedor Demo",
} as unknown as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMock = !isFirebaseConfigured;

  useEffect(() => {
    if (isMock) {
      setUser(mockUser);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth!, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [isMock]);

  const signIn = async (email: string, password: string) => {
    if (isMock) { setUser(mockUser); return; }
    await signInWithEmailAndPassword(auth!, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (isMock) { setUser(mockUser); return; }
    await createUserWithEmailAndPassword(auth!, email, password);
  };

  const signInWithGoogle = async () => {
    if (isMock) { setUser(mockUser); return; }
    await signInWithPopup(auth!, new GoogleAuthProvider());
  };

  const signOut = async () => {
    if (isMock) { setUser(null); return; }
    await firebaseSignOut(auth!);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isMock, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
