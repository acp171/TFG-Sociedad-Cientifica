import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [userRole, setUserRole] = useState(null);
    const [tipoSocio, setTipoSocio] = useState(null);

    const parseTokenRole = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.rol || null;  // Cambia "rol" si en el token se llama distinto
        } catch {
            return null;
        }
    };

    const parseTokenTipoSocio = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.tipo_socio || null;  // Cambia "rol" si en el token se llama distinto
        } catch {
            return null;
        }
    };

    const login = (token, socio) => {
        localStorage.setItem("token", token);
        localStorage.setItem("socio", JSON.stringify(socio));
        setIsLoggedIn(true);
        setUserRole(parseTokenRole(token));
        setTipoSocio(parseTokenTipoSocio(token));
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("socio");
        setIsLoggedIn(false);
        setUserRole(null);
        setTipoSocio(null);
    };

    useEffect(() => {
        // Sincronizar con otras pestañas
        const handleStorageChange = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
            setUserRole(token ? parseTokenRole(token) : null);
            setTipoSocio(token ? parseTokenRole(token) : null);
        };
        window.addEventListener("storage", handleStorageChange);

        // Inicializar userRole al cargar
        const token = localStorage.getItem("token");
        setUserRole(token ? parseTokenRole(token) : null);
        setTipoSocio(token ? parseTokenRole(token) : null);

        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, tipoSocio, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);