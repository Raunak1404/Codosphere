import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  claims: Record<string, unknown> | null;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAdmin: false,
  claims: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Force-refresh the token so we always have fresh custom claims
        const tokenResult = await user.getIdTokenResult(true);
        const tokenClaims = tokenResult.claims as Record<string, unknown>;
        setClaims(tokenClaims);
        setIsAdmin(tokenClaims['admin'] === true);
      } else {
        setClaims(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, isAdmin, claims }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
