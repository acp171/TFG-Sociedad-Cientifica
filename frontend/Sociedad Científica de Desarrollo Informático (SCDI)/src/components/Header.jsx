import { Link } from "react-router-dom";
import { Search, User, LogOut, Settings, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";


const Header = () => {
    const { isLoggedIn, logout, userRole } = useAuth();

    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState({
        articulos: [],
        eventos: [],
        proyectos: [],
    });
    const [isSearching, setIsSearching] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
    const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);

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

    const abrirNotificacion = (n) => {
        marcarComoLeidaNotificacion(n.id_notificacion);
        setNotificacionSeleccionada(n);
        setMostrarNotificaciones(false);
    };

    const marcarComoLeidaNotificacion = async (id) => {
        try {
            const res = await fetch(
                `https://tfg-sociedad-cientifica-production.up.railway.app/notificaciones/${id}/leida`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (!res.ok) {
                throw new Error("Error al marcar como leída");
            }
            
            setNotificaciones(prev =>
                prev.filter(n => n.id_notificacion !== id)
            );
        }
        catch (error) {
            console.error(error);
        }
    };
      
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

    useEffect(() => {
        const fetchNotificaciones = async () => {
            if (!isLoggedIn) return;

            try {
                const res = await fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-notificacion-usuario-sin-leer", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!res.ok) { 
                    throw new Error("Error al obtener notificaciones");
                }

                const data = await res.json();
                setNotificaciones(data.notificaciones.listadoNotificaciones || []);
            } catch (error) {
                console.error("Error al cargar notificaciones:", error);
                setNotificaciones([]);
            }
        };

        fetchNotificaciones();
    }, [isLoggedIn]);

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

                {isLoggedIn && userRole === 1 && (
                    <Link
                        to="/panel-administrador"
                        className="p-2 rounded-full shadow text-black hover:text-green-600 transition"
                        title="Panel de administrador"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                )}

                {isLoggedIn && (
                    <div className="relative">
                        <button
                            onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                            className="p-2 rounded-full shadow text-black hover:text-blue-600 transition relative"
                            title="Notificaciones"
                        >
                        <Inbox className="w-5 h-5" />
                            {notificaciones.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                                    {notificaciones.length}
                                </span>
                            )}
                        </button>

                        {mostrarNotificaciones && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border shadow-lg rounded-lg z-50 max-h-80 overflow-auto">
                                {notificaciones.length > 0 ? (
                                    <>
                                        <ul>
                                            {notificaciones.map((n) => (
                                                <li
                                                    key={n.id_notificacion}
                                                    className="px-4 py-2 border-b last:border-none hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => abrirNotificacion(n)}
                                                >
                                                    <p className="font-semibold">{n.titulo}</p>
                                                    <p className="text-sm text-gray-600">{n.mensaje.substring(0, 50)}...</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p className="px-4 py-2 text-sm text-gray-500">No hay notificaciones</p>
                                )}
                                <div className="border-t px-4 py-2 text-center">
                                    <Link
                                        to="/notificaciones"
                                        className="text-blue-600 hover:underline text-sm font-medium"
                                        onClick={() => setMostrarNotificaciones(false)}
                                    >
                                        Mostrar todas las notificaciones
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
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

                <Link
                    to="/contacto"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow"
                >
                    CONTÁCTANOS
                </Link>
            </div>

            {notificacionSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                        <h2 className="text-xl font-bold mb-2">{notificacionSeleccionada.titulo}</h2>
                        <p className="text-gray-700">{notificacionSeleccionada.mensaje}</p>

                        <div className="mt-4 text-right">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => setNotificacionSeleccionada(null)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;