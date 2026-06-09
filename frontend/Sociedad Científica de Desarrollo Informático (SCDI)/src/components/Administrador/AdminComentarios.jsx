import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { FaTrash, FaEye, FaEyeSlash, FaComments } from "react-icons/fa";

const AdminComentarios = () => {
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [filtro, setFiltro] = useState("todos"); // todos | visibles | ocultos

    useEffect(() => {
        fetchComentarios();
    }, []);

    const fetchComentarios = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/admin/comentarios`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Error al cargar comentarios");
            const data = await res.json();
            setComentarios(data.comentarios || []);
        } catch (err) {
            console.error(err);
            setError("Error cargando comentarios.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibilidad = async (comentario) => {
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/articulos-cientificos/${comentario.publicacion}/comentarios/${comentario.id_comentario}/moderar`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Error al moderar el comentario.");
                return;
            }
            const data = await res.json();
            setComentarios((prev) =>
                prev.map((c) =>
                    c.id_comentario === data.comentario.id_comentario
                        ? { ...c, visibilidad: data.comentario.visibilidad }
                        : c
                )
            );
            setSuccess(
                data.comentario.visibilidad
                    ? "Comentario visible para los usuarios."
                    : "Comentario ocultado correctamente."
            );
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    const handleDelete = async (comentario) => {
        if (
            !window.confirm(
                `¿Eliminar definitivamente el comentario de "${comentario.nombre} ${comentario.apellidos}"?`
            )
        )
            return;

        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/admin/comentarios/${comentario.id_comentario}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "No se pudo eliminar el comentario.");
                return;
            }
            setComentarios((prev) =>
                prev.filter((c) => c.id_comentario !== comentario.id_comentario)
            );
            setSuccess("Comentario eliminado correctamente.");
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    const comentariosFiltrados =
        filtro === "todos"
            ? comentarios
            : filtro === "visibles"
                ? comentarios.filter((c) => c.visibilidad)
                : comentarios.filter((c) => !c.visibilidad);

    const totalVisible = comentarios.filter((c) => c.visibilidad).length;
    const totalOcultos = comentarios.filter((c) => !c.visibilidad).length;

    return (
        <div>
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de comentarios</h2>
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <FaComments size={11} />
                        {comentarios.length} total
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <FaEye size={11} />
                        {totalVisible} visibles
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <FaEyeSlash size={11} />
                        {totalOcultos} ocultos
                    </span>
                </div>
            </div>

            {/* Filtro */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { value: "todos", label: "Todos" },
                    { value: "visibles", label: "Visibles" },
                    { value: "ocultos", label: "Ocultos" },
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFiltro(f.value)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                            filtro === f.value
                                ? "bg-indigo-600 text-white shadow"
                                : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Alertas */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">
                    {success}
                </div>
            )}

            {/* Contenido */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando comentarios...</p>
                </div>
            ) : comentariosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FaComments className="mx-auto text-gray-300 mb-3" size={36} />
                    <p className="text-gray-500 font-medium">
                        {filtro === "todos"
                            ? "No hay comentarios registrados."
                            : filtro === "visibles"
                                ? "No hay comentarios visibles."
                                : "No hay comentarios ocultos."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comentariosFiltrados.map((comentario) => (
                        <div
                            key={comentario.id_comentario}
                            className={`border rounded-xl overflow-hidden shadow-sm bg-white transition duration-300 ${
                                comentario.visibilidad
                                    ? "border-gray-200 hover:border-indigo-100"
                                    : "border-amber-200 bg-amber-50/30 hover:border-amber-300"
                            }`}
                        >
                            {/* Cabecera de la tarjeta */}
                            <div
                                className={`px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b ${
                                    comentario.visibilidad
                                        ? "bg-gray-50 border-gray-100"
                                        : "bg-amber-50 border-amber-100"
                                }`}
                            >
                                {/* Info del comentario */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">
                                            {comentario.nombre} {comentario.apellidos}
                                        </span>
                                        {comentario.visibilidad ? (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                <FaEye size={9} /> Visible
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                                <FaEyeSlash size={9} /> Oculto
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium">
                                        En:{" "}
                                        <span className="text-indigo-600 font-semibold">
                                            {comentario.titulo_articulo}
                                        </span>{" "}
                                        ·{" "}
                                        {comentario.fecha_comentario
                                            ? new Date(comentario.fecha_comentario).toLocaleString(
                                                  "es-ES",
                                                  {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                      timeZone: "UTC",
                                                  }
                                              )
                                            : "-"}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end md:self-center">
                                    <button
                                        onClick={() => handleToggleVisibilidad(comentario)}
                                        className={`text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                                            comentario.visibilidad
                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                        }`}
                                    >
                                        {comentario.visibilidad ? (
                                            <>
                                                <FaEyeSlash size={10} /> OCULTAR
                                            </>
                                        ) : (
                                            <>
                                                <FaEye size={10} /> MOSTRAR
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comentario)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                                    >
                                        <FaTrash size={10} /> ELIMINAR
                                    </button>
                                </div>
                            </div>

                            {/* Cuerpo del comentario */}
                            <div className="px-6 py-4">
                                <p className="text-sm text-gray-700 break-words leading-relaxed">
                                    {comentario.comentario}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminComentarios;
