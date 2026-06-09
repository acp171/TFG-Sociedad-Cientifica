import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaUserMinus, FaEdit } from "react-icons/fa";

const AdminProyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [socios, setSocios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showForm, setShowForm] = useState(false);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [selectedProyectoId, setSelectedProyectoId] = useState(null);
    const [editingProyecto, setEditingProyecto] = useState(null);

    const [formData, setFormData] = useState({
        nombre_proyecto: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
    });

    const [memberData, setMemberData] = useState({
        socio: "",
        rol_proyecto: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchDatos();
    }, []);

    const fetchDatos = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");

            // 1. Obtener proyectos (ahora incluyen miembros)
            const resProyectos = await fetch(`${API_BASE_URL}/listado-proyectos-investigacion`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resProyectos.ok) throw new Error("Error al obtener los proyectos");
            const dataProyectos = await resProyectos.json();
            setProyectos(dataProyectos.proyectos?.listaProyectos || []);

            // 2. Obtener listado de socios para los selectores
            const resSocios = await fetch(`${API_BASE_URL}/socios/listado-socios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resSocios.ok) throw new Error("Error al obtener el listado de socios");
            const dataSocios = await resSocios.json();
            setSocios(dataSocios.socios?.listaSocios || []);

            // 3. Obtener roles del sistema
            const resRoles = await fetch(`${API_BASE_URL}/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resRoles.ok) throw new Error("Error al obtener los roles");
            const dataRoles = await resRoles.json();
            setRoles(dataRoles.roles || []);
        } catch (err) {
            console.error(err);
            setError("Error cargando la información de proyectos, socios o roles.");
        } finally {
            setLoading(false);
        }
    };

    const openNewForm = () => {
        setEditingProyecto(null);
        setFormData({ nombre_proyecto: "", descripcion: "", fecha_inicio: "", fecha_fin: "" });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (proyecto) => {
        setEditingProyecto(proyecto);
        setFormData({
            nombre_proyecto: proyecto.nombre_proyecto || "",
            descripcion: proyecto.descripcion || "",
            fecha_inicio: proyecto.fecha_inicio
                ? new Date(proyecto.fecha_inicio).toISOString().slice(0, 10)
                : "",
            fecha_fin: proyecto.fecha_fin
                ? new Date(proyecto.fecha_fin).toISOString().slice(0, 10)
                : "",
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setFormData({ nombre_proyecto: "", descripcion: "", fecha_inicio: "", fecha_fin: "" });
        setEditingProyecto(null);
        setError("");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.nombre_proyecto.trim()) {
            setError("El título del proyecto es obligatorio.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const url = editingProyecto
                ? `${API_BASE_URL}/proyectos-investigacion/${editingProyecto.id_proyecto}`
                : `${API_BASE_URL}/proyectos-investigacion/crear-proyecto-investigacion`;
            const method = editingProyecto ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Error al guardar el proyecto.");
                return;
            }

            setSuccess(editingProyecto ? "Proyecto actualizado con éxito." : "Proyecto creado con éxito.");
            fetchDatos();
            closeForm();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    const handleDelete = async (proyecto) => {
        if (!window.confirm(`¿Seguro que quieres eliminar por completo el proyecto "${proyecto.nombre_proyecto}"?`)) return;

        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/${proyecto.id_proyecto}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al eliminar el proyecto.");
                return;
            }

            setSuccess("Proyecto eliminado correctamente.");
            fetchDatos();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!memberData.socio || !memberData.rol_proyecto) {
            setError("Debe seleccionar un socio y un rol.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/${selectedProyectoId}/miembros`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    socio: parseInt(memberData.socio, 10),
                    rol_proyecto: parseInt(memberData.rol_proyecto, 10)
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al añadir miembro.");
                return;
            }

            setSuccess("Miembro añadido correctamente.");
            setShowMemberForm(false);
            setMemberData({ socio: "", rol_proyecto: "" });
            fetchDatos();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    const handleRemoveMember = async (proyectoId, socioId, nombreMiembro) => {
        if (!window.confirm(`¿Seguro que quieres expulsar a "${nombreMiembro}" de este proyecto?`)) return;

        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/${proyectoId}/miembros/${socioId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al expulsar al miembro.");
                return;
            }

            setSuccess("Miembro expulsado del proyecto correctamente.");
            fetchDatos();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de proyectos</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2"
                >
                    <FaPlus size={14} /> NUEVO PROYECTO
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">{success}</div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando proyectos...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {proyectos.map((proyecto) => (
                        <div key={proyecto.id_proyecto} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:border-indigo-100 transition duration-300">
                            {/* Cabecera del Proyecto */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 gap-4">
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-lg font-bold text-gray-900">{proyecto.nombre_proyecto}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                                            proyecto.estado === "En curso" ? "bg-green-100 text-green-800" :
                                            proyecto.estado === "Pendiente" ? "bg-amber-100 text-amber-800" :
                                            "bg-gray-100 text-gray-800"
                                        }`}>
                                            {proyecto.estado}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{proyecto.descripcion}</p>
                                    <div className="text-xs text-gray-400 mt-1 font-medium">
                                        Duración: {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString() : 'N/A'} - {proyecto.fecha_fin ? new Date(proyecto.fecha_fin).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <button
                                        onClick={() => {
                                            setSelectedProyectoId(proyecto.id_proyecto);
                                            setShowMemberForm(true);
                                            setError("");
                                            setSuccess("");
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1.5"
                                    >
                                        <FaPlus size={10} /> MIEMBRO
                                    </button>
                                    <button
                                        onClick={() => openEditForm(proyecto)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1.5"
                                    >
                                        <FaEdit size={10} /> EDITAR
                                    </button>
                                    <button
                                        onClick={() => handleDelete(proyecto)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1.5"
                                    >
                                        <FaTrash size={10} /> ELIMINAR
                                    </button>
                                </div>
                            </div>

                            {/* Listado de Miembros */}
                            <div className="p-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Miembros del Proyecto</h4>
                                {proyecto.miembros && proyecto.miembros.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 font-semibold text-xs uppercase">
                                                    <th className="py-2">Nombre</th>
                                                    <th className="py-2">Rol en Proyecto</th>
                                                    <th className="py-2 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {proyecto.miembros.map((miembro) => (
                                                    <tr key={miembro.id_socio} className="border-b border-gray-50 hover:bg-slate-50 transition">
                                                        <td className="py-3 font-medium text-gray-800">{miembro.nombre_socio}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                miembro.rol === "Presidente" || miembro.rol === "Administrador" ? "bg-red-100 text-red-800" :
                                                                miembro.rol === "Secretario" ? "bg-amber-100 text-amber-800" :
                                                                miembro.rol === "Tesorero" ? "bg-blue-100 text-blue-800" :
                                                                miembro.rol === "Vocal" ? "bg-purple-100 text-purple-800" :
                                                                "bg-gray-100 text-gray-800"
                                                            }`}>
                                                                {miembro.rol}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <button
                                                                onClick={() => handleRemoveMember(proyecto.id_proyecto, miembro.id_socio, miembro.nombre_socio)}
                                                                className="text-red-500 hover:text-red-700 transition"
                                                                title="Expulsar miembro"
                                                            >
                                                                <FaUserMinus size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm italic">Este proyecto no tiene miembros registrados.</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {proyectos.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No se encontraron proyectos registrados.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Crear / Editar Proyecto */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-[450px] max-w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                            {editingProyecto ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="nombre_proyecto" className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Proyecto *</label>
                                <input
                                    id="nombre_proyecto"
                                    type="text"
                                    name="nombre_proyecto"
                                    value={formData.nombre_proyecto}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej. Redes Neuronales Profundas"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-1">Descripción *</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Describa los objetivos del proyecto..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="fecha_inicio" className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Inicio</label>
                                    <input
                                        id="fecha_inicio"
                                        type="date"
                                        name="fecha_inicio"
                                        value={formData.fecha_inicio}
                                        onChange={handleChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="fecha_fin" className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Fin *</label>
                                    <input
                                        id="fecha_fin"
                                        type="date"
                                        name="fecha_fin"
                                        value={formData.fecha_fin}
                                        onChange={handleChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
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

            {/* Modal: Añadir Miembro */}
            {showMemberForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-[400px] max-w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Añadir Miembro al Proyecto</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label htmlFor="member_socio" className="block text-sm font-semibold text-gray-700 mb-1">Socio *</label>
                                <select
                                    id="member_socio"
                                    value={memberData.socio}
                                    onChange={(e) => setMemberData({ ...memberData, socio: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    required
                                >
                                    <option value="">Seleccione un socio...</option>
                                    {socios.map((socio) => (
                                        <option key={socio.id_socio} value={socio.id_socio}>
                                            {socio.nombre} {socio.apellidos}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="member_rol" className="block text-sm font-semibold text-gray-700 mb-1">Rol en el Proyecto *</label>
                                <select
                                    id="member_rol"
                                    value={memberData.rol_proyecto}
                                    onChange={(e) => setMemberData({ ...memberData, rol_proyecto: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    required
                                >
                                    <option value="">Seleccione un rol...</option>
                                    {roles.map((rol) => (
                                        <option key={rol.id} value={rol.id}>
                                            {rol.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowMemberForm(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition font-semibold"
                                >
                                    Añadir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProyectos;