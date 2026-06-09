import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminTipos = () => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        nombre_tipo: "",
        descripcion: "",
        cuota: "",
        price_stripe: "",
    });

    useEffect(() => {
        fetchTipos();
    }, []);

    const fetchTipos = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/tipos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setTipos(data.tipos || []);
        }
        catch (err) {
            console.error("Error al cargar tipos:", err);
            setError("Error al cargar los tipos de socio.");
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const token = localStorage.getItem("token");

        const url = editandoId
            ? `${API_BASE_URL}/tipos/${editandoId}`
            : `${API_BASE_URL}/tipos`;

        const method = editandoId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Error al guardar tipo");

            setSuccess(editandoId ? "Tipo de socio actualizado con éxito." : "Tipo de socio creado con éxito.");
            await fetchTipos();
            closeForm();
        }
        catch (err) {
            console.error(err);
            setError("Error guardando tipo de socio.");
        }
    };

    const handleEdit = (tipo) => {
        setFormData({
            nombre_tipo: tipo.nombre_tipo,
            descripcion: tipo.descripcion,
            cuota: tipo.cuota,
            price_stripe: tipo.price_stripe,
        });
        setEditandoId(tipo.id_tipo_socio);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openNewForm = () => {
        setFormData({ nombre_tipo: "", descripcion: "", cuota: "", price_stripe: "" });
        setEditandoId(null);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditandoId(null);
        setFormData({ nombre_tipo: "", descripcion: "", cuota: "", price_stripe: "" });
        setError("");
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este tipo de socio?")) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_BASE_URL}/tipos/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Error al eliminar tipo");

            setSuccess("Tipo de socio eliminado con éxito.");
            fetchTipos();
        }
        catch (err) {
            console.error(err);
            setError("No se pudo eliminar el tipo.");
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de tipos de socio</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    NUEVO TIPO
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">{success}</div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando tipos de socio...</p>
                </div>
            ) : (
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm block sm:table">
                        <thead className="hidden sm:table-header-group">
                            <tr className="border-b border-gray-200 text-gray-400 font-semibold text-xs uppercase bg-gray-50">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Nombre</th>
                                <th className="py-3 px-4">Descripción</th>
                                <th className="py-3 px-4">Cuota (€)</th>
                                <th className="py-3 px-4">Stripe Price ID</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="block sm:table-row-group space-y-3 sm:space-y-0">
                            {tipos.map((tipo) => (
                                <tr key={tipo.id_tipo_socio} className="flex flex-col sm:table-row border border-gray-200 sm:border-0 sm:border-b hover:bg-slate-50 transition rounded-xl sm:rounded-none p-4 sm:p-0 bg-white mb-3 sm:mb-0 shadow-sm sm:shadow-none">
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 text-gray-500">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-28">ID:</span>
                                        #{tipo.id_tipo_socio}
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 font-semibold text-gray-800">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-28">Nombre:</span>
                                        {tipo.nombre_tipo}
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 text-gray-600">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-28">Descripción:</span>
                                        {tipo.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 text-gray-800 font-medium">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-28">Cuota mensual:</span>
                                        {tipo.cuota} €
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 text-gray-500 font-mono text-xs">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-28">Stripe ID:</span>
                                        {tipo.price_stripe}
                                    </td>
                                    <td className="flex sm:table-cell py-2 sm:py-3 sm:px-4 text-right justify-between sm:justify-end items-center border-t sm:border-t-0 border-gray-200 mt-2 sm:mt-0 pt-2 sm:pt-0">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase">Acciones:</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(tipo)}
                                                className="bg-amber-550 bg-amber-500 hover:bg-amber-600 text-white text-xs px-2.5 py-1 rounded transition font-semibold flex items-center gap-1"
                                            >
                                                <FaEdit size={10} /> Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tipo.id_tipo_socio)}
                                                className="bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1 rounded transition font-semibold flex items-center gap-1"
                                            >
                                                <FaTrash size={10} /> Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tipos.length === 0 && (
                                <tr className="block sm:table-row">
                                    <td colSpan="6" className="block sm:table-cell text-center py-12 text-gray-500 italic">
                                        No hay tipos de socio registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Crear / Editar Tipo */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-[450px] max-w-full shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                            {editandoId ? "Editar Tipo de Socio" : "Crear Tipo de Socio"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="tip-nombre" className="block text-sm font-semibold text-gray-700 mb-1">Nombre del tipo *</label>
                                <input
                                    id="tip-nombre"
                                    type="text"
                                    name="nombre_tipo"
                                    value={formData.nombre_tipo}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="tip-desc" className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    id="tip-desc"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label htmlFor="tip-cuota" className="block text-sm font-semibold text-gray-700 mb-1">Cuota mensual (€) *</label>
                                <input
                                    id="tip-cuota"
                                    type="number"
                                    step="0.01"
                                    name="cuota"
                                    value={formData.cuota}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="tip-stripe" className="block text-sm font-semibold text-gray-700 mb-1">ID Stripe (price_id) *</label>
                                <input
                                    id="tip-stripe"
                                    type="text"
                                    name="price_stripe"
                                    value={formData.price_stripe}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
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

export default AdminTipos;