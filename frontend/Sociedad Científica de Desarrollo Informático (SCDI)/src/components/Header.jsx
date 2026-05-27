import { Link } from "react-router-dom";
import { Search, User, LogOut, Settings, Inbox, Menu, X } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";


const Header = () => {
    const { isLoggedIn, logout, userRole } = useAuth();
    const { t } = useTranslation();

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        setIsMenuOpen(false);
    };

    return (
        <header className="flex items-center justify-between h-20 bg-gray-100 shadow px-3 md:px-10 sticky top-0 z-50">
            {/* Espacio invisible en móvil para equilibrar el botón de menú y forzar centrado */}
            <div className="w-10 lg:hidden flex-shrink-0"></div>

            {/* Logo + Nombre */}
            <Link to="/" className="flex items-center justify-center space-x-3 z-50 flex-grow lg:flex-grow-0" title="Página de inicio de SCDI">
                <img src="/scdi.webp" alt="Logo" className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 object-contain flex-shrink-0" />
                <div className="text-sm xs:text-base md:text-lg leading-tight text-slate-800 text-left">
                    <span className="block font-extrabold tracking-tight">Sociedad Científica de</span>
                    <span className="block font-extrabold tracking-tight">Desarrollo Informático</span>
                </div>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden lg:block">
                <ul className="flex space-x-6 font-medium">
                    <li><a href="/quienes-somos" className="hover:text-purple-400" title={t("header.quienes_somos")}>{t("header.quienes_somos")}</a></li>
                    <li><a href="/eventos-cientificos" className="hover:text-purple-400" title={t("header.actividades")}>{t("header.actividades")}</a></li>
                    <li><a href="/proyectos-investigacion" className="hover:text-purple-400" title={t("header.proyectos")}>{t("header.proyectos")}</a></li>
                    <li><a href="/articulos-cientificos" className="hover:text-purple-400" title={t("header.articulos")}>{t("header.articulos")}</a></li>
                </ul>
            </nav>

            {/* Iconos Desktop */}
            <div className="hidden lg:flex items-center space-x-4 relative">
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
                            placeholder={t("header.buscar")}
                            className="border px-3 py-1 rounded-full w-64"
                        />
                        {(resultados.articulos.length > 0 || resultados.eventos.length > 0 || resultados.proyectos.length > 0) && (
                            <div className="absolute top-10 left-0 w-64 bg-white border shadow rounded z-50 max-h-80 overflow-auto">
                                {resultados.articulos.length > 0 && (
                                    <>
                                        <h4 className="px-3 py-1 font-semibold border-b">{t("header.articulos_titulo")}</h4>
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
                                        <h4 className="px-3 py-1 font-semibold border-b mt-2">{t("header.eventos_titulo")}</h4>
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
                                        <h4 className="px-3 py-1 font-semibold border-b mt-2">{t("header.proyectos_titulo")}</h4>
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
                        title={t("header.panel_admin")}
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                )}


                {isLoggedIn && (
                    <div className="relative">
                        <button
                            onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                            className="p-2 rounded-full shadow text-black hover:text-blue-600 transition relative"
                            title={t("header.notificaciones", { count: notificaciones.length })}
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
                                    <p className="px-4 py-2 text-sm text-gray-500">{t("header.no_notificaciones")}</p>
                                )}
                                <div className="border-t px-4 py-2 text-center">
                                    <Link
                                        to="/notificaciones"
                                        className="text-blue-600 hover:underline text-sm font-medium"
                                        onClick={() => setMostrarNotificaciones(false)}
                                    >
                                        {t("header.ver_todas")}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isLoggedIn && (
                    <Link
                        to="/perfil"
                        className="p-2 rounded-full shadow text-black hover:text-blue-600 transition"
                        title={t("header.mi_perfil")}
                    >
                        <FaUser className="w-5 h-5" />
                    </Link>
                )}

                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full shadow text-black hover:text-red-600 transition"
                        title={t("header.cerrar_sesion")}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                ) : (
                    <Link
                        to="/unete"
                        className="p-2 rounded-full shadow text-black hover:text-blue-700 transition"
                        title={t("header.iniciar_sesion")}
                    >
                        <User className="w-5 h-5" />
                    </Link>
                )}

                <LanguageSwitcher />

                <Link
                    to="/contacto"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow"
                >
                    {t("common.contactanos")}
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                className="lg:hidden p-1 rounded-md text-gray-700 hover:bg-gray-200 transition z-50 w-10 h-10 flex items-center justify-center flex-shrink-0 ml-auto"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 lg:hidden flex flex-col p-6 pt-24 space-y-8 overflow-y-auto slide-in-left">
                    <nav>
                        <ul className="flex flex-col space-y-6 text-xl font-bold text-center items-center">
                            <li><a href="/quienes-somos" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 inline-block w-full">{t("header.quienes_somos")}</a></li>
                            <li><a href="/eventos-cientificos" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 inline-block w-full">{t("header.actividades")}</a></li>
                            <li><a href="/proyectos-investigacion" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 inline-block w-full">{t("header.proyectos")}</a></li>
                            <li><a href="/articulos-cientificos" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 inline-block w-full">{t("header.articulos")}</a></li>
                        </ul>
                    </nav>

                    <div className="flex justify-center">
                        <LanguageSwitcher />
                    </div>

                    <div className="border-t pt-8 space-y-4">
                        <div className="flex flex-col gap-4">
                            {isLoggedIn && userRole === 1 && (
                                <Link
                                    to="/panel-administrador"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center space-x-2 p-3 bg-gray-100 rounded-lg w-full text-center"
                                >
                                    <Settings className="w-6 h-6" />
                                    <span className="font-semibold">{t("header.administracion")}</span>
                                </Link>
                            )}

                            {isLoggedIn && (
                                <Link
                                    to="/notificaciones"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center space-x-2 p-3 bg-gray-100 rounded-lg w-full text-center"
                                >
                                    <Inbox className="w-6 h-6" />
                                    <span className="font-semibold">{t("header.notificaciones", { count: notificaciones.length })}</span>
                                </Link>
                            )}

                            {isLoggedIn && (
                                <Link
                                    to="/perfil"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center space-x-2 p-3 bg-gray-100 rounded-lg w-full text-center"
                                >
                                    <FaUser className="w-5 h-5" />
                                    <span className="font-semibold">{t("header.mi_perfil")}</span>
                                </Link>
                            )}

                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center space-x-2 p-3 bg-red-50 text-red-600 rounded-lg w-full text-center"
                                >
                                    <LogOut className="w-6 h-6" />
                                    <span className="font-bold">{t("header.cerrar_sesion")}</span>
                                </button>
                            ) : (
                                <Link
                                    to="/unete"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg w-full text-center"
                                >
                                    <User className="w-6 h-6" />
                                    <span className="font-bold tracking-wide">{t("header.iniciar_sesion")}</span>
                                </Link>
                            )}
                        </div>

                        <Link
                            to="/contacto"
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-center bg-blue-600 text-white font-bold py-4 rounded-lg shadow-lg mt-4"
                        >
                            {t("common.contactanos")}
                        </Link>
                    </div>
                </div>
            )}

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
                                {t("common.cerrar")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;