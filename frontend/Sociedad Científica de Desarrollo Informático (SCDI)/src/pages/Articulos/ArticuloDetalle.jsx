import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiArrowLeft, HiDownload, HiTrash } from "react-icons/hi";

const ArticuloDetalle = () => {
    const { id } = useParams();
    const [articulo, setArticulo] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("socio"));

    useEffect(() => {
        fetch(`http://localhost:4000/articulos-cientificos/${id}`)
            .then(res => res.json())
            .then(data => {
                setArticulo(data.articulo);
                setComentarios((data.comentarios || []).filter(c => c.visibilidad !== false));
            });
    }, [id]);

    const eliminar = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar este artículo? Esta acción no se puede deshacer.")) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/articulos-cientificos/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            navigate("/articulos-cientificos");
        }
    };

    const enviarComentario = async (idPublicacion) => {
        if (!nuevoComentario.trim()) return;

        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/articulos-cientificos/${idPublicacion}/comentarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                comentario: nuevoComentario
            })
        });

        if (res.ok) {
            const nuevo = await res.json();
            setComentarios([...comentarios, nuevo.comentario]);
            setNuevoComentario("");
        } else {
            alert("No se pudo enviar el comentario.");
        }
    };

    const cambiarVisibilidadComentario = async (idPublicacion, idComentario) => {
        const token = localStorage.getItem("token");
    
        const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/articulos-cientificos/${idPublicacion}/comentarios/${idComentario}/moderar`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
    
        if (res.ok) {
            const actualizado = await res.json();
            setComentarios(prev =>
                prev.map(c =>
                    c.id_comentario === actualizado.comentario.id_comentario
                        ? { ...c, visibilidad: actualizado.comentario.visibilidad }
                        : c
                )
            );
        } else {
            alert("No se pudo actualizar la visibilidad del comentario.");
        }
    };

    if (!articulo) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
                <p className="text-gray-500 text-lg">Cargando artículo...</p>
            </div>
        );
    }

    const fechaFormateadaArticulo = new Date(articulo.fecha_publicacion).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const comentariosConFecha = comentarios.map((comentario) => ({
        ...comentario,
        fechaFormateada: new Date(comentario.fecha_comentario).toLocaleString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }));    

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6 lg:px-20 flex flex-col items-center">
            <button
                onClick={() => navigate(-1)}
                className="self-start mb-8 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 rounded"
                aria-label="Volver a la página anterior"
            >
                <HiArrowLeft className="mr-2 text-xl" /> Volver
            </button>

            <article className="bg-gradient-to-b from-blue-200 to-white shadow-xl rounded-xl p-10 max-w-4xl w-full">
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
                        el {fechaFormateadaArticulo}
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

                {/* Sección de comentarios */}
                <div className="border-t pt-8 mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Comentarios</h2>

                    {comentariosConFecha.length === 0 ? (
                        <p className="text-gray-500 mb-4">Aún no hay comentarios.</p>
                    ) : (
                        <ul className="space-y-4 mb-6">
                            {comentariosConFecha.map((comentario, i) => (
                                <li key={i} className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="text-gray-700">{comentario.comentario}</p>
                                    <p className="text-sm text-gray-500 italic">
                                        Publicado por:{" "}
                                        <span className="font-semibold text-gray-700">
                                            {comentario.nombre} {comentario.apellidos}
                                        </span>{" "}
                                        el {comentario.fechaFormateada}
                                    </p>

                                    {/* Botón para admin para cambiar visibilidad */}
                                    {usuario?.socio_rol === 1 && (
                                        <button
                                            onClick={() => cambiarVisibilidadComentario(articulo.id_publicacion, comentario.id_comentario)}
                                            className={`mt-2 px-4 py-2 rounded text-sm font-semibold transition ${
                                                comentario.visibilidad
                                                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                    : "bg-green-600 hover:bg-green-700 text-white"
                                            }`}
                                        >
                                            {comentario.visibilidad ? "Ocultar" : "Mostrar"}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-6">
                        <textarea
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md p-3 mb-4"
                            placeholder="Escribe tu comentario..."
                        ></textarea>
                        <button
                            onClick={() => {
                                if (!usuario) {
                                    navigate("/login");
                                } else {
                                    enviarComentario(articulo.id_publicacion);
                                }
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Enviar comentario
                        </button>
                    </div>
                </div>
            </article>
        </section>
    );
};

export default ArticuloDetalle;