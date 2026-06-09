import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaUserMinus } from "react-icons/fa";

const AdminComites = () => {
    const [comites, setComites] = useState([]);
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComiteForm, setShowComiteForm] = useState(false);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [selectedComiteId, setSelectedComiteId] = useState(null);

    const [comiteData, setComiteData] = useState({
        nombre_comite: "",
        descripcion: "",
        socio: "" // ID del presidente inicial
    });

    const [memberData, setMemberData] = useState({
        socio: "",
        rol_comite: "6" // 6 = Miembro comité por defecto
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const rolesComite = [
        { id: "2", nombre: "Presidente" },
        { id: "3", nombre: "Secretario" },
        { id: "4", nombre: "Tesorero" },
        { id: "5", nombre: "Vocal" },
        { id: "6", nombre: "Miembro comité" }
    ];

    useEffect(() => {
        fetchDatos();
    }, []);

    const fetchDatos = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            
            // 1. Obtener comités
            const resComites = await fetch(`${API_BASE_URL}/listado-comites-cientificos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resComites.ok) throw new Error("Error al obtener los comités");
            const dataComites = await resComites.json();
            setComites(dataComites.listadoComites || []);

            // 2. Obtener listado de socios para los selectores
            const resSocios = await fetch(`${API_BASE_URL}/socios/listado-socios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resSocios.ok) throw new Error("Error al obtener el listado de socios");
            const dataSocios = await resSocios.json();
            setSocios(dataSocios.socios?.listaSocios || []);
        } catch (err) {
            console.error(err);
            setError("Error cargando la información de comités o socios.");
        } finally {
            setLoading(false);
        }
    };

    // Crear un nuevo comité
    const handleCreateComite = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!comiteData.nombre_comite || !comiteData.descripcion || !comiteData.socio) {
            setError("Por favor, rellene todos los campos obligatorios.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/crear-comite-cientifico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre_comite: comiteData.nombre_comite,
                    descripcion: comiteData.descripcion,
                    socio: parseInt(comiteData.socio, 10)
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al crear el comité.");
                return;
            }

            setSuccess("Comité científico creado con éxito.");
            setShowComiteForm(false);
            setComiteData({ nombre_comite: "", descripcion: "", socio: "" });
            fetchDatos();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    // Eliminar un comité
    const handleDeleteComite = async (id, nombre) => {
        if (!window.confirm(`¿Seguro que quieres eliminar por completo el comité "${nombre}"?`)) return;

        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/comites/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al eliminar el comité.");
                return;
            }

            setSuccess("Comité científico eliminado correctamente.");
            fetchDatos();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    // Añadir miembro a un comité
    const handleAddMember = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!memberData.socio || !memberData.rol_comite) {
            setError("Debe seleccionar un socio y un rol.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/add-miembro-comite-cientifico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    socio: parseInt(memberData.socio, 10),
                    comite: selectedComiteId,
                    rol_comite: parseInt(memberData.rol_comite, 10)
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al añadir miembro.");
                return;
            }

            setSuccess("Miembro añadido correctamente.");
            setShowMemberForm(false);
            setMemberData({ socio: "", rol_comite: "6" });
            fetchDatos();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    // Expulsar miembro de un comité
    const handleRemoveMember = async (comiteId, socioId, nombreMiembro) => {
        if (!window.confirm(`¿Seguro que quieres expulsar a "${nombreMiembro}" de este comité?`)) return;

        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/eliminar-miembro-comite`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    socio: socioId,
                    comite: comiteId
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Error al expulsar al miembro.");
                return;
            }

            setSuccess("Miembro expulsado del comité correctamente.");
            fetchDatos();
        } catch (err) {
            console.error(err);
            setError("Error al comunicarse con el servidor.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Comités Científicos</h2>
                <button
                    onClick={() => {
                        setShowComiteForm(true);
                        setError("");
                        setSuccess("");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2"
                >
                    <FaPlus size={14} /> NUEVO COMITÉ
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">{success}</div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando comités y socios...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comites.map((comite) => (
                        <div key={comite.id_comite} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:border-indigo-100 transition duration-300">
                            {/* Cabecera del Comité */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        {comite.nombre_comite}
                                        <span className="text-xs font-normal text-gray-400 bg-gray-200 px-2 py-0.5 rounded">ID: {comite.id_comite}</span>
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{comite.descripcion}</p>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <button
                                        onClick={() => {
                                            setSelectedComiteId(comite.id_comite);
                                            setShowMemberForm(true);
                                            setError("");
                                            setSuccess("");
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1.5"
                                    >
                                        <FaPlus size={10} /> AÑADIR MIEMBRO
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComite(comite.id_comite, comite.nombre_comite)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1.5"
                                    >
                                        <FaTrash size={10} /> ELIMINAR
                                    </button>
                                </div>
                            </div>

                            {/* Listado de Miembros */}
                            <div className="p-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Miembros del Comité</h4>
                                {comite.miembros && comite.miembros.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-400 font-semibold text-xs uppercase">
                                                    <th className="py-2">Nombre</th>
                                                    <th className="py-2">Rol en Comité</th>
                                                    <th className="py-2 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comite.miembros.map((miembro) => (
                                                    <tr key={miembro.id_socio} className="border-b border-gray-50 hover:bg-slate-50 transition">
                                                        <td className="py-3 font-medium text-gray-800">{miembro.nombre_socio}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                miembro.rol === "Presidente" ? "bg-red-100 text-red-800" :
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
                                                                onClick={() => handleRemoveMember(comite.id_comite, miembro.id_socio, miembro.nombre_socio)}
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
                                    <p className="text-gray-500 text-sm italic">Este comité no tiene miembros registrados.</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {comites.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No se encontraron comités registrados.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Crear Comité */}
            {showComiteForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-[450px] max-w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Crear Nuevo Comité</h3>
                        <form onSubmit={handleCreateComite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Comité *</label>
                                <input
                                    type="text"
                                    value={comiteData.nombre_comite}
                                    onChange={(e) => setComiteData({ ...comiteData, nombre_comite: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej. Comité de Inteligencia Artificial"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción *</label>
                                <textarea
                                    value={comiteData.descripcion}
                                    onChange={(e) => setComiteData({ ...comiteData, descripcion: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Describa el propósito y objetivos del comité..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Presidente Inicial *</label>
                                <select
                                    value={comiteData.socio}
                                    onChange={(e) => setComiteData({ ...comiteData, socio: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    required
                                >
                                    <option value="">Seleccione un socio...</option>
                                    {socios.map((socio) => (
                                        <option key={socio.id_socio} value={socio.id_socio}>
                                            {socio.nombre} {socio.apellidos} ({socio.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowComiteForm(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition font-semibold"
                                >
                                    Crear Comité
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
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Añadir Miembro</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Socio *</label>
                                <select
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
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Rol en el Comité *</label>
                                <select
                                    value={memberData.rol_comite}
                                    onChange={(e) => setMemberData({ ...memberData, rol_comite: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    required
                                >
                                    {rolesComite.map((rol) => (
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

export default AdminComites;
