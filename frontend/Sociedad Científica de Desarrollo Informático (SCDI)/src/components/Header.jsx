import { Link } from "react-router-dom";
import { Search, User, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";


const Header = () => {
    const { isLoggedIn, logout, userRole } = useAuth();
    cconsole.log("userRole en Header:", userRole, typeof userRole);

    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState({
        articulos: [],
        eventos: [],
        proyectos: [],
    });
    const [isSearching, setIsSearching] = useState(false);

    const filtrarEventos = (eventos) =>
        eventos.filter((evento) =>
            evento.nombre_evento.toLowerCase().includes(query.toLowerCase())
        ).map((evento) => ({
            tipo: "Evento",
            nombre: evento.nombre_evento,
            id: evento.id_evento,
        }
    ));
      
    const filtrarArticulos = (articulos) =>
        articulos.filter((articulo) =>
            articulo.titulo.toLowerCase().includes(query.toLowerCase())
        ).map((articulo) => ({
            tipo: "Artículo",
            nombre: articulo.titulo,
            id: articulo.id_publicacion,
        }
    ));
      
    const filtrarProyectos = (proyectos) =>
        proyectos.filter((proyecto) =>
            proyecto.nombre_proyecto.toLowerCase().includes(query.toLowerCase())
        ).map((proyecto) => ({
            tipo: "Proyecto",
            nombre: proyecto.nombre_proyecto,
            id: proyecto.id_proyecto,
        }
    ));

    const [notificaciones, setNotificaciones] = useState([
        { id: 1, mensaje: "Nuevo artículo publicado", leido: false },
        { id: 2, mensaje: "Evento científico próximo", leido: false },
    ]);
    const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
      

    useEffect(() => {
        const fetchDatos = async () => {
            if (query.trim() === "") {
                setResultados({ articulos: [], eventos: [], proyectos: [] });
                return;
            }
        
            try {
                const [resEventos, resArticulos, resProyectos] = await Promise.all([
                    fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-eventos-cientificos").then((res) => res.json()),
                    fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-articulos-cientificos").then((res) => res.json()),
                    fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-proyectos-investigacion").then((res) => res.json()),
                ]);
            
                const eventosArray = resProyectos.eventos?.listaEventos || [];
                const articulosArray = resArticulos.articulos?.listadoArticulos || [];
                const proyectosArray = resProyectos.proyectos?.listaProyectos || [];
            
                const eventosFiltrados = filtrarEventos(eventosArray);
                const articulosFiltrados = filtrarArticulos(articulosArray);
                const proyectosFiltrados = filtrarProyectos(proyectosArray);

                setResultados({
                    articulos: articulosFiltrados,
                    eventos: eventosFiltrados,
                    proyectos: proyectosFiltrados,
                });
            }
            catch (error) {
                console.error("Error al buscar:", error);
                setResultados({ articulos: [], eventos: [], proyectos: [] });
            }
        };
        
        fetchDatos();
    }, [query]);

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
            <div className="flex items-center space-x-4 relative">
                {!isSearching ? (
                    <button
                        onClick={() => setIsSearching(true)}
                        className="p-2 rounded-full shadow"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                            placeholder="Buscar..."
                            className="border px-3 py-1 rounded-full w-64"
                        />
                        {(resultados.articulos.length > 0 || resultados.eventos.length > 0 || resultados.proyectos.length > 0) && (
                            <div className="absolute top-10 left-0 w-64 bg-white border shadow rounded z-50 max-h-80 overflow-auto">
                                {resultados.articulos.length > 0 && (
                                    <>
                                        <h4 className="px-3 py-1 font-semibold border-b">Artículos</h4>
                                        <ul>
                                            {resultados.articulos.map((item) => (
                                                <Link
                                                    to={`/articulos-cientificos/${item.id}`}
                                                    className="block px-3 py-2"
                                                    key={`${item.id}`}
                                                >
                                                    {item.nombre}
                                                </Link>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {resultados.eventos.length > 0 && (
                                    <>
                                        <h4 className="px-3 py-1 font-semibold border-b mt-2">Eventos</h4>
                                        <ul>
                                            {resultados.eventos.map((item) => (
                                                <Link
                                                    to={`/eventos-cientificos/${item.id}`}
                                                    className="block px-3 py-2"
                                                    key={`${item.id}`}
                                                >
                                                    {item.nombre}
                                                </Link>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {resultados.proyectos.length > 0 && (
                                    <>
                                        <h4 className="px-3 py-1 font-semibold border-b mt-2">Proyectos</h4>
                                        <ul>
                                            {resultados.proyectos.map((item) => (
                                                <Link
                                                    to={`/proyectos-investigacion/${item.id}`}
                                                    className="block px-3 py-2"
                                                    key={`${item.id}`}
                                                >
                                                    {item.nombre}
                                                </Link>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="relative">
                    <button
                        onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                        className="p-2 rounded-full shadow text-black hover:text-yellow-600 transition relative"
                        title="Notificaciones"
                    >
                        <Bell className="w-5 h-5" />
                        {notificaciones.some(n => !n.leido) && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1">
                            {notificaciones.filter(n => !n.leido).length}
                        </span>
                        )}
                    </button>

                    {mostrarNotificaciones && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded-lg z-50">
                        {notificaciones.length > 0 ? (
                            <ul>
                            {notificaciones.map((n) => (
                                <li
                                key={n.id}
                                className={`px-4 py-2 border-b last:border-none ${
                                    n.leido ? "bg-gray-50" : "bg-blue-50"
                                } hover:bg-gray-100 cursor-pointer`}
                                onClick={() =>
                                    setNotificaciones(prev =>
                                    prev.map(item =>
                                        item.id === n.id ? { ...item, leido: true } : item
                                    )
                                    )
                                }
                                >
                                {n.mensaje}
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="px-4 py-2 text-sm text-gray-500">No hay notificaciones</p>
                        )}
                        </div>
                    )}
                </div>

                {isLoggedIn && userRole === 1 && (
                    <Link
                        to="/panel-administrador"
                        className="p-2 rounded-full shadow text-black hover:text-green-600 transition"
                        title="Panel de administrador"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                )}

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

                {Number(userRole) !== 1 && (
                    <Link
                        to="/contacto"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow"
                    >
                        CONTÁCTANOS
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;