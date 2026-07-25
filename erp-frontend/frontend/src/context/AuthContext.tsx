import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { logout as apiLogout, getStoredUser, clearAuthData, getStoredToken, setAuthData } from "../api/authService";

type User = {
  role: string;
  isAuthenticated: boolean;
  email?: string;
  id?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (role: string, rememberMe: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore auth state from storage on mount
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();

    if (storedUser || storedToken) {
      setUser({
        role: storedUser?.role ?? "user",
        isAuthenticated: true,
        email: storedUser?.email,
        id: storedUser?.id,
      });
    }

    setLoading(false);
  }, []);

  const login = async (role: string, rememberMe: boolean) => {
    // For backward compatibility with existing UI (which passes role directly)
    // This is a simplified login that maintains the existing flow
    // In production, this would call the actual API with email/password
    
    const loggedInUser: User = {
      role,
      isAuthenticated: true,
      email: `${role}@erp.com`,
      id: `${role}-user`,
    };

    setUser(loggedInUser);

    const mockToken = import.meta.env.DEV ? `dev-mock-token-${role}` : null;
    setAuthData(mockToken, loggedInUser, rememberMe);
  };

  const logout = async () => {
    // Call API logout if token exists
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await apiLogout();
      } catch (error) {
        console.error('API logout failed, clearing local data:', error);
      }
    }
    
    // Clear local state
    setUser(null);
    clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}