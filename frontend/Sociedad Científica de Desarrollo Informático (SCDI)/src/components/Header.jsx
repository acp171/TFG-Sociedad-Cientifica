import { Link } from "react-router-dom";
import { Search, User, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../hooks/AuthContext";


const Header = () => {
    const { isLoggedIn, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    // En caso de que el login ocurra desde otra parte
    useEffect(() => {
        const checkLogin = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
        };

        window.addEventListener("storage", checkLogin);
        return () => window.removeEventListener("storage", checkLogin);
    }, []);

    return (
        <header className="flex items-center justify-between h-16 bg-gray-100 shadow px-10">
            {/* Logo + Nombre */}
            <Link to="/" className="flex items-center space-x-3">
                <img src="/scdi.webp" alt="Logo" className="max-w-[64px] max-h-[64px]" />
                <div className="text-sm leading-tight">
                    <span className="block font-semibold">Sociedad Científica de</span>
                    <span className="block font-semibold">Desarrollo Informático</span>
                </div>
            </Link>

            {/* Navegación */}
            <nav>
                <ul className="flex space-x-6 font-medium">
                    <li><a href="/quienes-somos" className="hover:text-purple-400">QUIÉNES SOMOS</a></li>
                    <li><a href="/eventos-cientificos" className="hover:text-purple-400">ACTIVIDADES</a></li>
                    <li><a href="/proyectos-investigacion" className="hover:text-purple-400">PROYECTOS</a></li>
                    <li><a href="/articulos-cientificos" className="hover:text-purple-400">ARTÍCULOS</a></li>
                </ul>
            </nav>

            {/* Iconos */}
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full shadow">
                    <Search className="w-5 h-5" />
                </button>

                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full shadow text-black hover:text-red-600 transition"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                ) : (
                    <Link
                        to="/unete"
                        className="p-2 rounded-full shadow text-black hover:text-blue-700 transition"
                        title="Iniciar sesión"
                    >
                        <User className="w-5 h-5" />
                    </Link>
                )}

                <Link
                    to="/contacto"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow"
                >
                    CONTÁCTANOS
                </Link>
            </div>
        </header>
    );
};

export default Header;