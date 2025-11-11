import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";

const Proyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { userTipoSocio } = useAuth();

    // Filtros
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFechaFin, setFiltroFechaFin] = useState("");

    const proyectosPorPagina = 6;
    const currentPage = parseInt(searchParams.get("page")) || 1;

    useEffect(() => {
        setLoading(true);
        fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-proyectos-investigacion")
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
            const fechaFinFiltro = new Date(filtroFechaFin);
            const fechaFinProyecto = new Date(proyecto.fecha_fin);
            cumpleFecha = fechaFinProyecto <= fechaFinFiltro;
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
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 md:mb-0">PROYECTOS DE INVESTIGACIÓN</h1>
                    {userTipoSocio > 2 && (
                        <Link
                                to="/proyectos-investigacion/crear-proyecto"
                                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition duration-300 font-semibold"
                            >
                                Nuevo proyecto
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
                        className="border rounded p-2"
                    >
                        <option value="">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En curso">En curso</option>
                        <option value="Finalizado">Finalizado</option>
                    </select>

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

                {/* Contenido principal */}
                <div className="flex-grow">
                    {loading ? (
                        <p className="text-center text-gray-500 text-lg">Cargando proyectos...</p>
                    ) : proyectosVisibles.length === 0 ? (
                        <p className="text-gray-500 text-center">No hay proyectos disponibles.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {proyectosVisibles.map((proyecto) => (
                                <Link 
                                    key={proyecto.id_proyecto} 
                                    to={`/proyectos-investigacion/${proyecto.id_proyecto}`}
                                    className="p-6 bg-gray-50 rounded-xl shadow-md"
                                    aria-label={`Ver proyecto: ${proyecto.nombre_proyecto}`}
                                >
                                    <h2 className="text-2xl font-semibold text-blue-700 mb-2">{proyecto.nombre_proyecto}</h2>
                                    <p className="text-gray-700 mb-4">{proyecto.descripcion}</p>
                                    <p className="text-sm text-gray-500">
                                        <strong>Inicio:</strong> {new Date(proyecto.fecha_inicio).toLocaleDateString()}{" "}
                                        <strong>Fin:</strong> {new Date(proyecto.fecha_fin).toLocaleDateString()}<br />
                                        <strong>Estado:</strong> {proyecto.estado}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {proyectosFiltrados.length > 0 && (
                    <nav className="flex justify-center items-center gap-3 mt-10 select-none" aria-label="Paginación proyectos">
                        <button
                            onClick={() => cambiarPagina(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            ← Anterior
                        </button>

                        {[...Array(totalPaginas)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => cambiarPagina(index + 1)}
                                className={`px-4 py-2 rounded-md font-medium transition ${
                                    currentPage === index + 1
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
                            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Siguiente →
                        </button>
                    </nav>
                )}
            </div>
        </section>
    );
};

export default Proyectos;