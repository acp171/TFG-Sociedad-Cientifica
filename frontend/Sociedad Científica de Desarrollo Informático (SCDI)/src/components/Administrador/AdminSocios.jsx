import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";

const AdminSocios = () => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        fecha_nacimiento: "",
        id_plan: "",
    });
    const [showForm, setShowForm] = useState(false);

    const planes = [
        { id: 1, nombre: "Socio / Titular" },
        { id: 2, nombre: "Estudiante / Junior" },
        { id: 3, nombre: "Profesional" },
        { id: 4, nombre: "Honorario" },
        { id: 5, nombre: "Internacional" },
        { id: 6, nombre: "Corporación" },
    ];

    useEffect(() => {
        fetchSocios();
    }, []);

    const fetchSocios = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/socios/listado-socios`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

            const data = await res.json();
            setSocios(data.socios?.listaSocios || []);
        }
        catch (err) {
            console.error("Error cargando socios:", err);
            setError("Error cargando socios");
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const openNewForm = () => {
        setFormData({
            nombre: "", apellidos: "", email: "", password: "",
            telefono: "", fecha_nacimiento: "", id_plan: "",
        });
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setFormData({
            nombre: "", apellidos: "", email: "", password: "",
            telefono: "", fecha_nacimiento: "", id_plan: "",
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.nombre || !formData.apellidos || !formData.email || !formData.password || !formData.id_plan) {
            setError("Por favor completa todos los campos obligatorios.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/socios/crear-socios`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || "Error creando nuevo socio.");
                return;
            }

            setSuccess("Socio creado correctamente.");
            fetchSocios();
            closeForm();
        }
        catch {
            setError("Error creando nuevo socio.");
        }
    };

    const getRolBadge = (rol) => {
        const colors = {
            "Administrador": "bg-red-100 text-red-800",
            "Presidente": "bg-red-100 text-red-800",
            "Secretario": "bg-amber-100 text-amber-800",
            "Tesorero": "bg-blue-100 text-blue-800",
            "Vocal": "bg-purple-100 text-purple-800",
        };
        return colors[rol] || "bg-gray-100 text-gray-800";
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de socios</h2>
                <button
                    onClick={openNewForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    NUEVO SOCIO
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-6 shadow-sm">{success}</div>}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 font-medium">Cargando socios...</p>
                </div>
            ) : (
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm block sm:table">
                        <thead className="hidden sm:table-header-group">
                            <tr className="border-b border-gray-200 text-gray-400 font-semibold text-xs uppercase bg-gray-50">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Nombre</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Rol</th>
                                <th className="py-3 px-4">Plan</th>
                            </tr>
                        </thead>
                        <tbody className="block sm:table-row-group space-y-3 sm:space-y-0">
                            {socios.map((socio) => (
                                <tr key={socio.id_socio} className="flex flex-col sm:table-row border border-gray-200 sm:border-0 sm:border-b hover:bg-slate-50 transition rounded-xl sm:rounded-none p-4 sm:p-0 bg-white mb-3 sm:mb-0 shadow-sm sm:shadow-none">
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 text-gray-500">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-16">ID:</span>
                                        #{socio.id_socio}
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 font-medium text-gray-800">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-16">Nombre:</span>
                                        {socio.nombre} {socio.apellidos}
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4 text-gray-600">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-16">Email:</span>
                                        <span className="break-all">{socio.email}</span>
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-16">Rol:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getRolBadge(socio.socio_rol)}`}>
                                            {socio.socio_rol}
                                        </span>
                                    </td>
                                    <td className="block sm:table-cell py-1 sm:py-3 sm:px-4">
                                        <span className="inline-block sm:hidden text-xs font-bold text-gray-400 uppercase mr-2 w-16">Plan:</span>
                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                                            {socio.plan}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {socios.length === 0 && (
                                <tr className="block sm:table-row">
                                    <td colSpan="5" className="block sm:table-cell text-center py-12 text-gray-500 italic">
                                        No hay socios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Crear Socio */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start overflow-auto pt-10 z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-[450px] max-w-full shadow-2xl relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Crear Nuevo Socio</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="soc-nombre" className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                                    <input id="soc-nombre" type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label htmlFor="soc-apellidos" className="block text-sm font-semibold text-gray-700 mb-1">Apellidos *</label>
                                    <input id="soc-apellidos" type="text" name="apellidos" value={formData.apellidos} onChange={handleChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="soc-email" className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                                <input id="soc-email" type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div>
                                <label htmlFor="soc-password" className="block text-sm font-semibold text-gray-700 mb-1">Contraseña *</label>
                                <input id="soc-password" type="password" name="password" value={formData.password} onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="soc-tel" className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                                    <input id="soc-tel" type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="soc-fecha" className="block text-sm font-semibold text-gray-700 mb-1">Fecha de nacimiento</label>
                                    <input id="soc-fecha" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange}
                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="soc-plan" className="block text-sm font-semibold text-gray-700 mb-1">Plan *</label>
                                <select id="soc-plan" name="id_plan" value={formData.id_plan} onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                                    <option value="">Selecciona un plan</option>
                                    {planes.map((plan) => (
                                        <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                <button type="button" onClick={closeForm}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-semibold">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition font-semibold">
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

export default AdminSocios;