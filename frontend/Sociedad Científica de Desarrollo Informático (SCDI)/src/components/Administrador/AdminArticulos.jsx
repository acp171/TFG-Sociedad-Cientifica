import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { HiXCircle } from 'react-icons/hi';
import { FaTrash } from "react-icons/fa";

const AdminArticulos = () => {
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        titulo: "",
        contenido: "",
        pdf: null,
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pdfFile, setPdfFile] = useState(null);

    useEffect(() => {
        fetchArticulos();
    }, []);

    const fetchArticulos = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/listado-articulos-cientificos`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Error al cargar artículos");
            const data = await res.json();
            setArticulos(data.articulos?.listadoArticulos || []);
        }
        catch (err) {
            setError("Error cargando artículos");
        }
        finally {
            setLoading(false);
        }
    };

    const openNewForm = () => {
        setFormData({ titulo: "", contenido: "" });
        setPdfFile(null);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setFormData({ titulo: "", contenido: "" });
        setPdfFile(null);
        setError("");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.titulo.trim()) {
            setError("El título es obligatorio");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const body = new FormData();
            body.append("titulo", formData.titulo.trim());
            body.append("contenido", formData.contenido.trim());

            if (pdfFile) {
                body.append("pdf", pdfFile);
            }

            const res = await fetch(
                `${API_BASE_URL}/articulos-cientificos/publicar-articulo-cientifico`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body,
                }
            );

            const text = await res.text();
            console.log("Respuesta:", text);

            if (!res.ok) {
                try {
                    const data = JSON.parse(text);
                    setError(data.message || "Error en la operación");
                } catch {
                    setError("Error inesperado");
                }
                return;
            }

            setSuccess("Artículo creado correctamente.");
            fetchArticulos();
            closeForm();
        }
        catch {
            setError("Error en la comunicación con el servidor");
        }
    };

    const handleDelete = async (art) => {
        if (!window.confirm(`¿Eliminar artículo "${art.titulo}"?`)) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/articulos-cientificos/${art.id_publicacion}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "No se pudo eliminar el artículo");
                return;
            }
            setSuccess("Artículo eliminado correctamente.");
            fetchArticulos();
        } catch {
            setError("Error en la comunicación con el servidor");
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de artículos</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    NUEVO ARTÍCULO
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">{success}</div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando artículos...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {articulos.map((art) => (
                        <div key={art.id_publicacion} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:border-indigo-100 transition duration-300">
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{art.titulo}</h3>
                                    <div className="text-xs text-gray-400 mt-1 font-medium">
                                        Publicado: {art.fecha_publicacion ? new Date(art.fecha_publicacion).toLocaleDateString() : "-"}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(art)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto"
                                >
                                    <FaTrash size={10} /> ELIMINAR
                                </button>
                            </div>
                            {art.contenido && (
                                <div className="px-6 py-4">
                                    <p className="text-sm text-gray-600 break-words">{art.contenido}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {articulos.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No hay artículos registrados.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Nuevo Artículo */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-[450px] max-w-full shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Nuevo Artículo</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="art-titulo" className="block text-sm font-semibold text-gray-700 mb-1">Título *</label>
                                <input
                                    id="art-titulo"
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej. Inteligencia Artificial en la Medicina"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="art-contenido" className="block text-sm font-semibold text-gray-700 mb-1">Contenido *</label>
                                <textarea
                                    id="art-contenido"
                                    name="contenido"
                                    value={formData.contenido}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Escriba el contenido del artículo..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="pdf-upload"
                                    className="inline-block cursor-pointer bg-gray-700 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg transition select-none font-semibold text-sm"
                                >
                                    Subir PDF
                                </label>
                                <input
                                    id="pdf-upload"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setPdfFile(e.target.files[0])}
                                    className="hidden"
                                />
                                {pdfFile ? (
                                    <div className="mt-3 flex items-center gap-3 text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                                        <span className="truncate flex-1">📄 {pdfFile.name}</span>
                                        <HiXCircle
                                            title="Quitar archivo"
                                            onClick={() => setPdfFile(null)}
                                            className="text-2xl text-gray-400 hover:text-red-600 cursor-pointer transition duration-200 shrink-0"
                                        />
                                    </div>
                                ) : (
                                    <p className="mt-3 text-gray-400 text-sm italic">No hay ningún archivo seleccionado.</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition font-semibold"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminArticulos;