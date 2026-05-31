import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { HiXCircle } from 'react-icons/hi';

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
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setFormData({ titulo: "", contenido: "" });
        setError("");
        setSuccess("");
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Gestión de Artículos</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    NUEVO ARTÍCULO
                </button>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
            )}
            {success && (
                <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>
            )}

            {loading ? (
                <p>Cargando artículos...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Título</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Fecha publicación</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articulos.map((art) => (
                                <tr key={art.id_publicacion}>
                                    <td className="border border-gray-300 px-3 py-2">{art.id_publicacion}</td>
                                    <td className="border border-gray-300 px-3 py-2 min-w-[200px]">{art.titulo}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center whitespace-nowrap">
                                        {art.fecha_publicacion
                                            ? new Date(art.fecha_publicacion).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDelete(art)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {articulos.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-gray-600 italic">
                                        No hay artículos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg p-6 w-96 max-w-full shadow-lg"
                    >
                        <h3 className="text-xl font-semibold mb-4">Nuevo Artículo</h3>

                        <label className="block mb-3">
                            Título *
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                required
                            />
                        </label>

                        <label className="block mb-3">
                            Contenido *
                            <textarea
                                name="contenido"
                                value={formData.contenido}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 mt-1 w-full"
                                rows={4}
                                required
                            />
                        </label>

                        <div>
                            <label
                                htmlFor="pdf-upload"
                                className="inline-block cursor-pointer bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition select-none"
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
                                <div className="mt-4 flex items-center gap-3 text-gray-900 text-base">
                                <span>Archivo seleccionado: {pdfFile.name}</span>
                                <HiXCircle
                                    title="Quitar archivo"
                                    onClick={() => setPdfFile(null)}
                                    className="text-2xl text-gray-500 hover:text-red-600 cursor-pointer transition duration-200"
                                />
                                </div>
                            ) : (
                                <p className="mt-4 text-gray-500">No hay ningún archivo seleccionado.</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminArticulos;