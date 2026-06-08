import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { login as apiLogin, register as apiRegister, getMe } from '../api/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { name: string; email: string; password: string; major: string; university: string }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('semiplan_token');
        if (token) {
            getMe()
                .then((u) => setUser(u))
                .catch(() => {
                    localStorage.removeItem('semiplan_token');
                    localStorage.removeItem('semiplan_user');
                })
                .finally(() => setLoading(false));
        } else {
            // Check for stored user (demo mode)
            const stored = localStorage.getItem('semiplan_user');
            if (stored) {
                setUser(JSON.parse(stored));
            }
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const result = await apiLogin({ email, password });
        localStorage.setItem('semiplan_token', result.token);
        localStorage.setItem('semiplan_user', JSON.stringify(result.user));
        setUser(result.user);
    };

    const register = async (data: { name: string; email: string; password: string; major: string; university: string }) => {
        const result = await apiRegister(data);
        localStorage.setItem('semiplan_token', result.token);
        localStorage.setItem('semiplan_user', JSON.stringify(result.user));
        setUser(result.user);
    };

    const logout = () => {
        localStorage.removeItem('semiplan_token');
        localStorage.removeItem('semiplan_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
