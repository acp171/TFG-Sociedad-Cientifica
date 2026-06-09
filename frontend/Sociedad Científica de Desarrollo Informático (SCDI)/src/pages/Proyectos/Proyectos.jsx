import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import API_BASE_URL from "../../config/backendConfig";

const Proyectos = () => {
    const { t } = useTranslation();
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, userTipoSocio } = useAuth();

    // Filtros
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFechaFin, setFiltroFechaFin] = useState("");

    const proyectosPorPagina = 6;
    const currentPage = parseInt(searchParams.get("page")) || 1;

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/listado-proyectos-investigacion`)
            .then((res) => res.json())
            .then((data) => {
                setProyectos(data.proyectos?.listaProyectos || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error cargando proyectos", err);
                setLoading(false);
            });
    }, []);

    // Filtrado de proyectos
    const proyectosFiltrados = proyectos.filter((proyecto) => {
        let cumpleEstado = true;
        let cumpleFecha = true;

        if (filtroEstado) {
            cumpleEstado = proyecto.estado.toLowerCase() === filtroEstado.toLowerCase();
        }

        if (filtroFechaFin) {
            // Comparar solo la parte de fecha (YYYY-MM-DD) para evitar problemas de zona horaria
            const fechaFinProyecto = proyecto.fecha_fin
                ? proyecto.fecha_fin.slice(0, 10)
                : "";
            cumpleFecha = fechaFinProyecto >= filtroFechaFin;
        }

        return cumpleEstado && cumpleFecha;
    });

    const totalPaginas = Math.ceil(proyectosFiltrados.length / proyectosPorPagina);
    const inicio = (currentPage - 1) * proyectosPorPagina;
    const proyectosVisibles = proyectosFiltrados.slice(inicio, inicio + proyectosPorPagina);

    const cambiarPagina = (pagina) => {
        if (pagina >= 1 && pagina <= totalPaginas) {
            setSearchParams({ page: pagina });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <section className="flex flex-col flex-grow py-16 px-6 lg:px-20 bg-gradient-to-b from-blue-200 to-white">
            <div className="flex flex-col flex-grow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 md:mb-0">{t("proyectos.titulo")}</h1>
                    {(userTipoSocio > 2 || userRole === 1) && (
                        <Link
                            to="/proyectos-investigacion/crear-proyecto"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition duration-300 font-semibold"
                        >
                            {t("proyectos.nuevo")}
                        </Link>
                    )}
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 mb-10">
                    <select
                        value={filtroEstado}
                        onChange={(e) => {
                            setFiltroEstado(e.target.value);
                            setSearchParams({ page: 1 });
                        }}
                        className="border rounded p-3"
                    >
                        <option value="">{t("proyectos.todos_estados")}</option>
                        <option value="activo">Activo</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="pausado">Pausado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                    <div className="flex flex-col gap-4">
                        <input
                            type="date"
                            value={filtroFechaFin}
                            onChange={(e) => {
                                setFiltroFechaFin(e.target.value);
                                setSearchParams({ page: 1 });
                            }}
                            className="border rounded p-2"
                        />
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="flex-grow">
                    {loading ? (
                        <p className="text-center text-gray-500 text-lg">{t("proyectos.cargando")}</p>
                    ) : proyectosVisibles.length === 0 ? (
                        <p className="text-gray-500 text-center">{t("proyectos.no_proyectos")}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {proyectosVisibles.map((proyecto) => (
                                <Link
                                    key={proyecto.id_proyecto}
                                    to={`/proyectos-investigacion/${proyecto.slug || proyecto.id_proyecto}`}
                                    className="p-6 bg-gray-50 rounded-xl shadow-md"
                                    aria-label={`Ver proyecto: ${proyecto.nombre_proyecto}`}
                                >
                                    <h2 className="text-2xl font-semibold text-blue-700 mb-2">{proyecto.nombre_proyecto}</h2>
                                    <p className="text-gray-700 mb-4">{proyecto.descripcion}</p>
                                    <p className="text-sm text-gray-500">
                                        <strong>{t("proyectos.inicio")}</strong> {new Date(proyecto.fecha_inicio).toLocaleDateString()}{" "}
                                        <strong>{t("proyectos.fin")}</strong> {new Date(proyecto.fecha_fin).toLocaleDateString()}<br />
                                        <strong>{t("proyectos.estado")}</strong> {proyecto.estado}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {proyectosFiltrados.length > 0 && (
                    <nav className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mt-10 select-none" aria-label="Paginación proyectos">
                        <button
                            onClick={() => cambiarPagina(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {t("common.anterior")}
                        </button>

                        {[...Array(totalPaginas)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => cambiarPagina(index + 1)}
                                className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md font-medium transition ${currentPage === index + 1
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => cambiarPagina(currentPage + 1)}
                            disabled={currentPage === totalPaginas}
                            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {t("common.siguiente")}
                        </button>
                    </nav>
                )}
            </div>
        </section>
    );
};

export default Proyectos;