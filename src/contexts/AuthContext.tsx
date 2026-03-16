import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/services/api";

export type Role = "admin" | "elder" | "caretaker" | "ngo" | "orphan";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isOTPVerified: boolean;
  verifyOTP: () => void;
}

export interface RegisterData {
  name: string; email: string; password: string; role: Role;
  organization?: string; registrationNo?: string; focusArea?: string;
  website?: string; phone?: string; address?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);
const USER_KEY = "careconnect_user";
const TOKEN_KEY = "careconnect_token";
const OTP_KEY = "careconnect_otp_verified";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const otp = localStorage.getItem(OTP_KEY);
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
    if (otp === "true") setIsOTPVerified(true);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login(email, password);
      const { token: t, user: u } = res.data;
      setToken(t);
      setUser(u);
      setIsOTPVerified(false);
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      localStorage.removeItem(OTP_KEY);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const res = await authAPI.register(data);
      return { success: true, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsOTPVerified(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(OTP_KEY);
  };

  const verifyOTP = () => {
    setIsOTPVerified(true);
    localStorage.setItem(OTP_KEY, "true");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isOTPVerified, verifyOTP }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
