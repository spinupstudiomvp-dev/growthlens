"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
  email: string;
  name: string;
  picture?: string;
  userId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loginWithLinkedIn: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginWithLinkedIn: () => {},
  logout: () => {},
  isLoading: true,
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = getCookie("gl_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.email) {
          setUser(parsed);
        }
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const loginWithLinkedIn = () => {
    window.location.href = "/api/auth/linkedin";
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    document.cookie = "gl_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithLinkedIn, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
