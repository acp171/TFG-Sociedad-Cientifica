import API_BASE_URL from '../../config/backendConfig';
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const GestionMiembros = () => {
    const { t } = useTranslation();
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoMiembro, setNuevoMiembro] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        fecha_nacimiento: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchMiembros = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    `${API_BASE_URL}/corporacion/miembros`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    throw new Error("Error al cargar miembros");
                }
                
                const data = await res.json();
                setMiembros(data.miembros || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMiembros();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevoMiembro((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        try {
            const token = localStorage.getItem("token");
            console.log(token);
            const res = await fetch(
                `${API_BASE_URL}/corporacion/miembros`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(nuevoMiembro),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al añadir miembro");

            setMiembros((prev) => [...prev, data.miembro]);
            setNuevoMiembro({ nombre: "", apellidos: "", email: "", password: "", telefono: "", fecha_nacimiento: "",});
            setSuccess(t("perfil_page.miembro_anadido"));
        }
        catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t("perfil_page.confirmar_eliminar_miembro"))) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/corporacion/miembros/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) {
                throw new Error("Error al eliminar miembro");
            }

            setMiembros((prev) => prev.filter((m) => m.id_socio !== id));
        }
        catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">{t("perfil_page.miembros_corporacion")}</h2>

            {loading ? (
                <p>{t("perfil_page.cargando_miembros")}</p>
            ) : miembros.length === 0 ? (
                <p>{t("perfil_page.no_hay_miembros")}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full mb-6 border-collapse">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-4 py-2 text-left">{t("perfil_page.nombre_completo")}</th>
                                <th className="border px-4 py-2 text-left">{t("perfil_page.email")}</th>
                                <th className="border px-4 py-2 text-left">{t("perfil_page.tipo_socio")}</th>
                                <th className="border px-4 py-2 text-left">{t("perfil_page.acciones")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {miembros.map((m) => (
                                <tr key={m.id_socio} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2 whitespace-nowrap">{m.nombre} {m.apellidos}</td>
                                    <td className="border px-4 py-2">{m.email}</td>
                                    <td className="border px-4 py-2">{t("perfil_page.profesional")}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => handleDelete(m.id_socio)}
                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                                        >
                                            {t("perfil_page.eliminar")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Formulario para añadir miembro */}
            <form onSubmit={handleAdd} className="space-y-3">
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <>{t("perfil_page.nombre")}</>
                <input type="text" name="nombre" placeholder={t("perfil_page.nombre")} value={nuevoMiembro.nombre} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>{t("perfil_page.apellidos")}</>
                <input type="text" name="apellidos" placeholder={t("perfil_page.apellidos")} value={nuevoMiembro.apellidos} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>{t("perfil_page.email")}</>
                <input type="email" name="email" placeholder={t("perfil_page.email")} value={nuevoMiembro.email} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>{t("perfil_page.contrasena")}</>
                <input type="password" name="password" placeholder={t("perfil_page.contrasena")} value={nuevoMiembro.password} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>{t("perfil_page.telefono")}</>
                <input type="tel" name="telefono" placeholder={t("perfil_page.telefono")} value={nuevoMiembro.telefono} onChange={handleChange} required className="w-full border p-3 rounded" />
                <>{t("perfil_page.fecha_nacimiento")}</>
                <input type="date" name="fecha_nacimiento" value={nuevoMiembro.fecha_nacimiento} onChange={handleChange} required className="w-full border p-3 rounded" />

                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    {t("perfil_page.anadir_miembro")}
                </button>
            </form>
        </div>
    );
};

export default GestionMiembros;