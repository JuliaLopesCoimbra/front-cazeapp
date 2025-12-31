// /app/context/AuthContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
// import { refreshAuthToken } from "../services/auth/authService";
interface TokenPayload {
  sub: string;
  role: "admin" | "user";
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  role: "admin" | "user" | null;
  isAdmin: boolean;
  authReady: boolean;
   authVersion: number;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const getCookie = (name: string): string | null => {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) {
//     return parts.pop()!.split(";").shift() || null;
//   }
//   return null;
// };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function getInitialAuthState() {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, role: null };
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    return { isAuthenticated: false, role: null };
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return {
      isAuthenticated: true,
      role: decoded.role,
    };
  } catch {
    return { isAuthenticated: false, role: null };
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const initialState = getInitialAuthState();

  const [isAuthenticated, setIsAuthenticated] = useState(
    initialState.isAuthenticated
  );
  const [role, setRole] = useState<"admin" | "user" | null>(initialState.role);
  const [authReady, setAuthReady] = useState(false);
const [authVersion, setAuthVersion] = useState(0);

  /* Marca o contexto como pronto após o boot inicial */
  useEffect(() => {
    setAuthReady(true);
  }, []);

 const login = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("access_token", accessToken);
  document.cookie = `refresh_token=${refreshToken}; path=/; secure`;

  const decoded = jwtDecode<TokenPayload>(accessToken);

  setRole(decoded.role);
  setIsAuthenticated(true);

  // 🔥 ISSO AQUI É A CHAVE
  setAuthVersion((v) => v + 1);
};

const logout = () => {
  localStorage.removeItem("access_token");
  document.cookie =
    "refresh_token=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  setIsAuthenticated(false);
  setRole(null);

  // 🔥 ISSO AQUI TAMBÉM
  setAuthVersion((v) => v + 1);
};


  // const refreshSession = async () => {
  //   const refreshToken = getCookie("refresh_token");

  //   if (!refreshToken) {
  //     logout();
  //     return;
  //   }

  //   try {
  //     const data = await refreshAuthToken(refreshToken);

  //     // Atualiza tokens
  //     localStorage.setItem("access_token", data.access_token);
  //     document.cookie = `refresh_token=${data.refresh_token}; path=/; secure`;

  //     const decoded = jwtDecode<TokenPayload>(data.access_token);

  //     setRole(decoded.role);
  //     setIsAuthenticated(true);
  //   } catch {
  //     logout();
  //   }
  // };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsAuthenticated(false);
      setRole(null);
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setRole(decoded.role);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  console.log("[AuthContext] STATE:", {
    isAuthenticated,
    role,
    isAdmin: role === "admin",
    authReady,
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        isAdmin: role === "admin",
        authReady,
        authVersion,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
