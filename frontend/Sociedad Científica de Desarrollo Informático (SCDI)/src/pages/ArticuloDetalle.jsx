import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ArticuloDetalle = () => {
    const { id } = useParams();
    const [articulo, setArticulo] = useState(null);
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("usuario")); // asume que tienes esto

    useEffect(() => {
        fetch(`http://localhost:4000/articulos-cientificos/${id}`)
        .then(res => res.json())
        .then(data => setArticulo(data.articulo));
    }, [id]);

    const eliminar = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/eliminar-articulo-cientifico/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            navigate("/articulos-cientificos");
        }
    };

    if (!articulo) return <p>Cargando...</p>;

    return (
        <section className="w-full bg-gradient-to-b from-blue-100 to-white py-12 px-4 min-h-screen flex justify-center">
            <article className="bg-white shadow-md rounded-lg p-8 max-w-3xl w-full">
                <h1 className="text-center text-4xl font-extrabold mb-6 text-gray-900">{articulo.titulo}</h1>
                <p className="text-gray-700 mb-8 whitespace-pre-wrap leading-relaxed text-lg">{articulo.contenido}</p>
                <p className="text-sm text-gray-500 italic mb-6 text-right">
                    Publicado por: <span className="font-semibold text-gray-700">{articulo.nombre} {articulo.apellidos}</span>
                </p>

                {/* Mostrar botón para descargar PDF si existe */}
                {articulo.contenidopdf && (
                <a
                    href={`http://localhost:4000/articulos-cientificos/${id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    download={`articulo_${id}.pdf`}
                >
                    Descargar PDF
                </a>
                )}

                {/* Botón eliminar sólo si el usuario es el autor */}
                {usuario?.id === articulo.id_socio && (
                    <div className="flex justify-end">
                        <button
                        onClick={eliminar}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md transition"
                        >
                        Eliminar artículo
                        </button>
                    </div>
                )}
            </article>
        </section>
    );
};

export default ArticuloDetalle;
