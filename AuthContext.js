import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await api.get("/api/user");
            setUser(data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 419)) {
                    setUser(null);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            await api.get("/sanctum/csrf-cookie");
            const response = await api.post("/login", {
                email,
                password
            })

            setUser(response.data.user);
            return response.data.user;
        } catch (err) {
            setUser(null);
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/logout");
        } finally {
            setUser(null);
        }
    }, []);

    const contextValue = useMemo(() => ({
        user,
        setUser,
        login,
        logout,
        loading
    }), [user, setUser, login, logout, loading]);

    return (
        <AuthContext.Provider
            value={contextValue}
        >
            {children}
        </AuthContext.Provider>
    );
};