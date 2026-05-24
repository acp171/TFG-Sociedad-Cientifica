import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const Articulos = () => {
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const articulosPorPagina = 6;
    const currentPage = parseInt(searchParams.get("page")) || 1;

    useEffect(() => {
        fetch("https://tfg-sociedad-cientifica-production.up.railway.app/listado-articulos-cientificos")
            .then((res) => res.json())
            .then((data) => {
                setArticulos(data.articulos?.listadoArticulos || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar artículos:", error);
                setLoading(false);
            });
    }, []);

    const totalPaginas = Math.ceil(articulos.length / articulosPorPagina);
    const inicio = (currentPage - 1) * articulosPorPagina;
    const articulosVisibles = articulos.slice(inicio, inicio + articulosPorPagina);

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
                        ARTÍCULOS CIENTÍFICOS
                    </h2>
                    <Link
                        to="/articulos-cientificos/crear-articulo"
                        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition duration-300 font-semibold"
                    >
                        Publicar artículo
                    </Link>
                </div>

                <div className="flex-grow">
                    {loading ? (
                        <p className="text-center text-gray-500 text-lg">Cargando artículos...</p>
                    ) : articulos.length === 0 ? (
                        <p className="text-center text-gray-600 text-lg">No hay artículos disponibles.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {articulosVisibles.map((articulo) => (
                                <Link
                                    key={articulo.id_publicacion}
                                    to={`/articulos-cientificos/${articulo.id_publicacion}`}
                                    className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
                                    aria-label={`Ver artículo: ${articulo.titulo}`}
                                >
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3 truncate">{articulo.titulo}</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Publicado por:{" "}
                                        <span className="font-medium">
                                            {articulo.nombre} {articulo.apellidos}
                                        </span>
                                    </p>
                                    <p className="text-gray-700 line-clamp-3">{articulo.contenido}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {articulos.length > 0 && (
                    <nav className="flex flex-wrap justify-center items-center gap-2 md:gap-3 select-none mt-auto" aria-label="Paginación artículos">
                        <button
                            onClick={() => cambiarPagina(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Página anterior"
                        >
                            ← Anterior
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
                            Siguiente →
                        </button>
                    </nav>
                )}
            </div>
        </section>
    );
};

export default Articulos;