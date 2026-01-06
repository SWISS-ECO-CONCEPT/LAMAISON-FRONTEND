// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type UserShape = {
  id?: number | string;
  clerkId?: string;
  firstname?: string;
  email?: string;
  role?: string;
  phone?: string;
  // ajoute d'autres champs que tu utilises...
} | null;

type AuthContextProps = {
  user: UserShape;
  updateUser: (data: UserShape) => void;
  clearUser: () => void;
};

const defaultValue: AuthContextProps = {
  user: null,
  updateUser: () => {},
  clearUser: () => {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextProps>(defaultValue);

type Props = { children: ReactNode };

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserShape>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as UserShape) : null;
    } catch (err) {
      console.error("AuthProvider: erreur parse localStorage user", err);
      return null;
    }
  });

  const updateUser = (data: UserShape) => {
    // Défensive: si null, on clear ; sinon set
    setUser(data);
  };

  const clearUser = () => {
    setUser(null);
  };

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("AuthProvider: erreur écriture localStorage", err);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pratique
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);

export default AuthProvider;
