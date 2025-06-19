import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const Articulos = () => {
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const articulosPorPagina = 8;
    const currentPage = parseInt(searchParams.get("page")) || 1;

    useEffect(() => {
        fetch('http://localhost:4000/listado-articulos-cientificos')
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <section className="w-full bg-gradient-to-b from-blue-100 to-white py-16 px-6 lg:px-16 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-center lg:text-left">ARTÍCULOS CIENTÍFICOS</h2>
                <Link
                    to="/articulos-cientificos/crear-articulo"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Publicar artículo
                </Link>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Cargando artículos...</p>
            ) : articulos.length === 0 ? (
                <p className="text-center text-gray-500">No hay artículos disponibles.</p>
            ) : (
                <>
                    <div className="space-y-8 mb-10">
                        {articulosVisibles.map((articulo) => (
                            <div key={articulo.id_publicacion}>
                                <Link to={`/articulos-cientificos/${articulo.id_publicacion}`}>
                                    <div className="border rounded-xl shadow bg-white p-6 text-center hover:shadow-lg transition duration-300">
                                        <h3 className="text-xl font-semibold mb-2">{articulo.titulo}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Publicado por: {articulo.nombre} {articulo.apellidos}
                                        </p>
                                        <p className="text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {articulo.contenido}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Controles de paginación */}
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => cambiarPagina(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                            ← Anterior
                        </button>

                        {[...Array(totalPaginas)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => cambiarPagina(index + 1)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === index + 1
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => cambiarPagina(currentPage + 1)}
                            disabled={currentPage === totalPaginas}
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                            Siguiente →
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};

export default Articulos;
