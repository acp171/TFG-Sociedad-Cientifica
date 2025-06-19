import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiArrowLeft, HiDownload, HiTrash } from "react-icons/hi";

const ArticuloDetalle = () => {
    const { id } = useParams();
    const [articulo, setArticulo] = useState(null);
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    useEffect(() => {
        fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/articulos-cientificos/${id}`)
            .then(res => res.json())
            .then(data => setArticulo(data.articulo));
    }, [id]);

    const eliminar = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar este artículo? Esta acción no se puede deshacer.")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/eliminar-articulo-cientifico/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            navigate("/articulos-cientificos");
        }
    };

    if (!articulo) { 
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
                <p className="text-gray-500 text-lg">Cargando artículo...</p>
            </div>
        );
    }

    const fechaFormateada = new Date(articulo.fecha_publicacion).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6 lg:px-20 flex flex-col items-center">
            {/* Botón volver */}
            <button
                onClick={() => navigate(-1)}
                className="self-start mb-8 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 rounded"
                aria-label="Volver a la página anterior"
            >
                <HiArrowLeft className="mr-2 text-xl" /> Volver
            </button>

            <article className="bg-white shadow-xl rounded-xl p-10 max-w-4xl w-full">
                <h1 className="text-center text-5xl font-extrabold mb-8 text-gray-900 tracking-wide drop-shadow-sm">
                    {articulo.titulo}
                </h1>

                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg mb-12 border-l-4 border-blue-600 pl-6">
                    {articulo.contenido}
                </p>

                <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
                    <p className="text-sm text-gray-500 italic">
                        Publicado por:{" "}
                        <span className="font-semibold text-gray-700">
                            {articulo.nombre} {articulo.apellidos}
                        </span>{" "}
                        el {fechaFormateada}
                    </p>

                    {articulo.contenidopdf && (
                        <a
                            href={`https://tfg-sociedad-cientifica-production.up.railway.app/articulos-cientificos/${id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`articulo_${id}.pdf`}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <HiDownload className="text-xl" /> Descargar PDF
                        </a>
                    )}
                </div>

                {usuario?.id === articulo.id_socio && (
                    <div className="flex justify-end">
                        <button
                            onClick={eliminar}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition shadow-md focus:outline-none focus:ring-2 focus:ring-red-600"
                            aria-label="Eliminar artículo"
                        >
                            <HiTrash className="text-xl" /> Eliminar artículo
                        </button>
                    </div>
                )}
            </article>
        </section>
    );
};

export default ArticuloDetalle;
