import { Link } from "react-router-dom";
import { Search } from "lucide-react"; // Puedes usar lucide o un ícono SVG

const Header = () => {
    return (
        <header className="flex items-center justify-between h-16 bg-gray-100 shadow" style={{paddingLeft: "40px", paddingRight: "40px"}}>
            {/* Izquierda: Logo + Nombre */}
            <Link to="/" className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                    <img
                    src="/scdi.webp"
                    alt="Logo"
                    className="max-w-[64px] max-h-[64px]"
                    />
                    <div className="text-sm leading-tight">
                        <span className="block font-semibold">Sociedad Científica de</span>
                        <span className="block font-semibold">Desarrollo Informático</span>
                    </div>
                </div>
            </Link>

            {/* Centro: Navegación */}
            <nav>
                <ul className="flex list-none space-x-6 font-medium p-2">
                    <li>
                        <a href="/quienes-somos" className="text-black no-underline hover:text-purple-400 transition-colors duration-200">
                            QUIÉNES SOMOS
                        </a>
                    </li>
                    <li>
                        <a href="#actividades" className="text-black no-underline hover:text-purple-400 transition-colors duration-200">
                            ACTIVIDADES
                        </a>
                    </li>
                    <li>
                        <a href="#proyectos" className="text-black no-underline hover:text-purple-400 transition-colors duration-200">
                            PROYECTOS
                        </a>
                    </li>
                    <li>
                        <a href="/articulos-cientificos" className="text-black no-underline hover:text-purple-400 transition-colors duration-200">
                            ARTÍCULOS
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Búsqueda + botón */}
            <div className="flex items-center space-x-4">
                <button className="p-2">
                    <Search className="w-5 h-5" />
                </button>
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