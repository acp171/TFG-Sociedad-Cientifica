import API_BASE_URL from '../../config/backendConfig';
import { useState } from "react";
import { useTranslation } from "react-i18next";

const roles = [
    { id: 8, nombre_rol: "Miembro" },
    { id: 2, nombre_rol: "Presidente" },
    { id: 3, nombre_rol: "Administrador" },
];

const MiembrosProyecto = ({ miembros, setMiembros, proyectoId, esPresidente, token, refetchProyecto }) => {
    const { t } = useTranslation();
    const [nuevoSocio, setNuevoSocio] = useState("");
    const [nuevoRol, setNuevoRol] = useState("");

    const agregarMiembro = async () => {
        if (!nuevoSocio || !nuevoRol) {
            alert(t("detalle_proyecto.selecciona_socio_rol"));
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/${proyectoId}/miembros`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ socio: nuevoSocio, rol_proyecto: nuevoRol }),
            });
            if (!res.ok) {
                throw new Error(t("detalle_proyecto.error_anadir_miembro"));
            }
            
            const data = await res.json(); 
            setMiembros((prev) => [...prev, data.miembro]);
            setNuevoSocio("");
            setNuevoRol("");
        }
        catch (err) {
            alert(err.message);
        }
    };

    const eliminarMiembro = async (id_socio) => {
        if (!window.confirm(t("detalle_proyecto.confirmar_eliminar_miembro"))) return;
        try {
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/${proyectoId}/miembros/${id_socio}`, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            });
            if (!res.ok) {
                throw new Error(t("detalle_proyecto.error_eliminar_miembro"));
            }
            
            setMiembros((prev) => prev.filter((m) => m.id_socio !== id_socio));
        }
        catch (err) {
            alert(err.message);
        }
    };

    const cambiarRol = async (id_socio, rolId) => {
        if (!window.confirm(t("detalle_proyecto.confirmar_cambio_rol"))) return;
        try {
            const res = await fetch(`${API_BASE_URL}/proyectos-investigacion/${proyectoId}/miembros/${id_socio}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rol_proyecto: rolId }),
            });
            if (!res.ok) {
                throw new Error(t("detalle_proyecto.error_cambiar_rol"));
            }
            const data = await res.json();
            setMiembros(data.miembros);
        }
        catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                    className="border rounded-md px-3 py-2 flex-grow"
                    type="number"
                    placeholder={t("detalle_proyecto.id_socio")}
                    value={nuevoSocio}
                    onChange={(e) => setNuevoSocio(e.target.value)}
                />
                <select
                    className="border rounded-md px-3 py-2"
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                >
                    <option value="">{t("detalle_proyecto.selecciona_rol")}</option>
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                        {r.nombre_rol === "Miembro" ? t("perfil_page.tipo_socio") : r.nombre_rol}
                        </option>
                    ))}
                </select>
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                    onClick={agregarMiembro}
                >
                    {t("detalle_proyecto.anadir_miembro")}
                </button>
            </div>
        
            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-auto">
                    <thead>
                        <tr className="bg-indigo-100 uppercase text-xs text-left">
                            <th className="border px-3 py-2 whitespace-nowrap">{t("detalle_proyecto.id_socio")}</th>
                            <th className="border px-3 py-2 whitespace-nowrap">{t("detalle_proyecto.nombre")}</th>
                            <th className="border px-3 py-2 whitespace-nowrap">{t("detalle_proyecto.rol")}</th>
                            <th className="border px-3 py-2 whitespace-nowrap">{t("detalle_proyecto.fecha_registro")}</th>
                            <th className="border px-3 py-2 whitespace-nowrap">{t("detalle_proyecto.acciones")}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {miembros.map((m) => (
                            <tr key={m.id_socio} className="hover:bg-indigo-50">
                            <td className="border px-3 py-2">{m.id_socio}</td>
                            <td className="border px-3 py-2 min-w-[150px]">{m.nombre} {m.apellidos}</td>
                            <td className="border px-3 py-2">
                                {esPresidente ? (
                                    <select
                                        className="border rounded-md px-2 py-1 bg-white"
                                        value={roles.find(r => r.nombre_rol === m.rol)?.id || ""}
                                        onChange={(e) => cambiarRol(m.id_socio, e.target.value)}
                                    >
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                                        ))}
                                    </select>
                                ) : (
                                    m.rol
                                )}
                            </td>
                            <td className="border px-3 py-2 whitespace-nowrap">{new Date(m.fecha_registro).toLocaleDateString()}</td>
                            <td className="border px-3 py-2">
                                {esPresidente && (
                                <button
                                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-xs"
                                    onClick={() => eliminarMiembro(m.id_socio)}
                                >
                                    {t("perfil_page.eliminar")}
                                </button>
                                )}
                            </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MiembrosProyecto;