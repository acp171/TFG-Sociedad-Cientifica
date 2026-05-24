import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";
import { useTranslation } from "react-i18next";

const Eventos = () => {
    const { t } = useTranslation();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, userTipoSocio } = useAuth();

    const eventosPorPagina = 6;
    const currentPage = parseInt(searchParams.get("page")) || 1;

    useEffect(() => {
        fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-eventos-cientificos")
            .then((res) => res.json())
            .then((data) => {
                setEventos(data.eventos?.listaEventos || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar artículos:", error);
                setLoading(false);
            });
    }, []);

    const totalPaginas = Math.ceil(eventos.length / eventosPorPagina);
    const inicio = (currentPage - 1) * eventosPorPagina;
    const eventosVisibles = eventos.slice(inicio, inicio + eventosPorPagina);

    const cambiarPagina = (pagina) => {
        if (pagina >= 1 && pagina <= totalPaginas) {
            setSearchParams({ page: pagina });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <section className="flex flex-col flex-grow w-full bg-gradient-to-b from-blue-200 to-white py-16 px-6 lg:px-20 font-sans">
            <div className="flex flex-col flex-grow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6 md:mb-0">
                        {t("eventos.titulo")}
                    </h2>
                    {(userTipoSocio !== 2 || userRole === 1) && (
                        <Link
                            to="/eventos-cientificos/crear-evento-cientifico"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition duration-300 font-semibold"
                        >
                            {t("eventos.crear")}
                        </Link>
                    )}
                </div>

                <div className="flex-grow">
                    {loading ? (
                        <p className="text-center text-gray-500 text-lg">{t("eventos.cargando")}</p>
                    ) : eventos.length === 0 ? (
                        <p className="text-center text-gray-600 text-lg">{t("eventos.no_eventos")}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {eventosVisibles.map((evento) => (
                                <Link
                                    key={evento.id_evento}
                                    to={`/eventos-cientificos/${evento.id_evento}`}
                                    className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
                                    aria-label={`Ver artículo: ${evento.nombre_evento}`}
                                >
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3 truncate">{evento.nombre_evento}</h3>
                                    <p className="text-gray-700 line-clamp-3">{evento.descripcion_evento}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {eventos.length > 0 && (
                    <nav className="flex flex-wrap justify-center items-center gap-2 md:gap-3 select-none mt-auto" aria-label="Paginación artículos">
                        <button
                            onClick={() => cambiarPagina(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Página anterior"
                        >
                            {t("common.anterior")}
                        </button>

                        {[...Array(totalPaginas)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => cambiarPagina(index + 1)}
                                className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md font-medium transition ${
                                    currentPage === index + 1
                                        ? "bg-indigo-600 text-white shadow-lg"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                                aria-current={currentPage === index + 1 ? "page" : undefined}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => cambiarPagina(currentPage + 1)}
                            disabled={currentPage === totalPaginas}
                            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Página siguiente"
                        >
                            {t("common.siguiente")}
                        </button>
                    </nav>
                )}
            </div>
        </section>
    );
};

export default Eventos;