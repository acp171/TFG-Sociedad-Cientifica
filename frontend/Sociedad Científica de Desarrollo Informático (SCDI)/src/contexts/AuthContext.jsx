import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const calcularCaducidad = () => {
    try {
        const socio = JSON.parse(localStorage.getItem("socio"));
        if (!socio?.fecha_expiracion) return false;
        return new Date() > new Date(socio.fecha_expiracion);
    } catch {
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [userRole, setUserRole] = useState(null);
    const [userTipoSocio, setUserTipoSocio] = useState(null);
    const [suscripcionCaducada, setSuscripcionCaducada] = useState(false);

    const parseTokenRole = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.rol || null;
        } catch {
            return null;
        }
    };

    const parseTokenTipoSocio = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.tipo || null;
        } catch {
            return null;
        }
    };

    const login = (token, socio) => {
        localStorage.setItem("token", token);
        localStorage.setItem("socio", JSON.stringify(socio));
        setIsLoggedIn(true);
        setUserRole(parseTokenRole(token));
        setUserTipoSocio(parseTokenTipoSocio(token));
        // Calcular si ya viene caducado desde el primer momento
        setSuscripcionCaducada(
            socio?.fecha_expiracion ? new Date() > new Date(socio.fecha_expiracion) : false
        );
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("socio");
        setIsLoggedIn(false);
        setUserRole(null);
        setUserTipoSocio(null);
        setSuscripcionCaducada(false);
    };

    // Llamado por BloqueoSuscripcion tras una renovación exitosa para limpiar el estado
    const marcarRenovado = useCallback(() => {
        // Actualizar socio en localStorage con nueva fecha en el futuro
        try {
            const socio = JSON.parse(localStorage.getItem("socio"));
            if (socio) {
                const nuevaFecha = new Date();
                nuevaFecha.setDate(nuevaFecha.getDate() + 30);
                socio.fecha_expiracion = nuevaFecha.toISOString();
                localStorage.setItem("socio", JSON.stringify(socio));
            }
        } catch {}
        setSuscripcionCaducada(false);
    }, []);

    useEffect(() => {
        // Sincronizar con otras pestañas
        const handleStorageChange = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
            setUserRole(token ? parseTokenRole(token) : null);
            setUserTipoSocio(token ? parseTokenTipoSocio(token) : null);
            setSuscripcionCaducada(calcularCaducidad());
        };
        window.addEventListener("storage", handleStorageChange);

        // Inicializar al cargar
        const token = localStorage.getItem("token");
        setUserRole(token ? parseTokenRole(token) : null);
        setUserTipoSocio(token ? parseTokenTipoSocio(token) : null);
        setSuscripcionCaducada(calcularCaducidad());

        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, userTipoSocio, suscripcionCaducada, login, logout, marcarRenovado }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);