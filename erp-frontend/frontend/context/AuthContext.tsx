import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";

type User = {
  role: string;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  const login = (role: string, rememberMe: boolean) => {
  

  const loggedInUser: User = {
    role,
    isAuthenticated: true,
  };

  setUser(loggedInUser);

  if (rememberMe) {
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  } else {
    localStorage.removeItem("user");
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
