import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({ nombre: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/roles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error");
            setRoles(data.roles || []);
        } catch (err) {
            console.error(err);
            setError("Error cargando roles");
        } finally {
            setLoading(false);
        }
    };

    const openNewForm = () => {
        setEditingRole(null);
        setFormData({ nombre: "" });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (role) => {
        setEditingRole(role);
        setFormData({ nombre: role.nombre });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setEditingRole(null);
        setFormData({ nombre: "" });
        setShowForm(false);
        setError("");
    };

    const handleChange = (e) => {
        setFormData({ nombre: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.nombre.trim()) {
            setError("El nombre es obligatorio");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const method = editingRole ? "PUT" : "POST";
            const url = editingRole
                ? `${API_BASE_URL}/roles/${editingRole.id}`
                : `${API_BASE_URL}/roles`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nombre: formData.nombre.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error en la operación");
                return;
            }

            setSuccess(editingRole ? "Rol actualizado con éxito." : "Rol creado con éxito.");
            fetchRoles();
            closeForm();
        } catch (err) {
            console.error("Error:", err);
            setError("Error en la comunicación con el servidor");
        }
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el rol "${role.nombre}"?`))
            return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/roles/${role.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "No se pudo eliminar el rol");
                return;
            }

            setSuccess("Rol eliminado correctamente.");
            fetchRoles();
        } catch (err) {
            console.error("Error:", err);
            setError("Error al eliminar el rol");
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de roles</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    NUEVO ROL
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">{success}</div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando roles...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {roles.map((role) => (
                        <div key={role.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:border-indigo-100 transition duration-300">
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900">{role.nombre}</h3>
                                    <span className="text-xs text-gray-400 font-medium">ID: {role.id}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                                    {role.nombre === "Administrador" ? (
                                        <span className="text-gray-400 italic text-sm px-3 py-1.5">🔒 Protegido</span>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => openEditForm(role)}
                                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                                            >
                                                <FaEdit size={10} /> EDITAR
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role)}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                                            >
                                                <FaTrash size={10} /> ELIMINAR
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {roles.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No hay roles registrados.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Crear/Editar Rol */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-[400px] max-w-full shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                            {editingRole ? "Editar Rol" : "Nuevo Rol"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="rol-nombre" className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Rol *</label>
                                <input
                                    id="rol-nombre"
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej. Investigador"
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

export default AdminRoles;