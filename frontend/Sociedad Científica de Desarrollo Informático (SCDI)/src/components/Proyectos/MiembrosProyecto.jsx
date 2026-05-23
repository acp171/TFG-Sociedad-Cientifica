import { useState } from "react";

const roles = [
    { id: 8, nombre_rol: "Miembro" },
    { id: 2, nombre_rol: "Presidente" },
    { id: 3, nombre_rol: "Administrador" },
];

const MiembrosProyecto = ({ miembros, setMiembros, proyectoId, esPresidente, token, refetchProyecto }) => {
    const [nuevoSocio, setNuevoSocio] = useState("");
    const [nuevoRol, setNuevoRol] = useState("");

    const agregarMiembro = async () => {
        if (!nuevoSocio || !nuevoRol) {
            alert("Selecciona socio y rol");
            return;
        }
        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/${proyectoId}/miembros`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ socio: nuevoSocio, rol_proyecto: nuevoRol }),
            });
            if (!res.ok) {
                throw new Error("Error agregando miembro");
            }
            
            const data = await res.json(); // Supón que devuelve el nuevo miembro
            setMiembros((prev) => [...prev, data.miembro]); // 👈 actualización local
            setNuevoSocio("");
            setNuevoRol("");
        }
        catch (err) {
            alert(err.message);
        }
    };

    const eliminarMiembro = async (id_socio) => {
        if (!window.confirm("¿Eliminar miembro?")) return;
        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/${proyectoId}/miembros/${id_socio}`, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            });
            if (!res.ok) {
                throw new Error("Error eliminando miembro");
            }
            
            setMiembros((prev) => prev.filter((m) => m.id_socio !== id_socio));
        }
        catch (err) {
            alert(err.message);
        }
    };

    const cambiarRol = async (id_socio, rolId) => {
        if (!window.confirm("¿Cambiar rol?")) return;
        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/${proyectoId}/miembros/${id_socio}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rol_proyecto: rolId }),
            });
            if (!res.ok) {
                throw new Error("Error cambiando rol");
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
                    placeholder="ID Socio"
                    value={nuevoSocio}
                    onChange={(e) => setNuevoSocio(e.target.value)}
                />
                <select
                    className="border rounded-md px-3 py-2"
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                >
                    <option value="">Selecciona rol</option>
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                        {r.nombre_rol}
                        </option>
                    ))}
                </select>
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                    onClick={agregarMiembro}
                >
                    Añadir Miembro
                </button>
            </div>
        
            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-auto">
                    <thead>
                        <tr className="bg-indigo-100 uppercase text-xs text-left">
                            <th className="border px-3 py-2 whitespace-nowrap">ID Socio</th>
                            <th className="border px-3 py-2 whitespace-nowrap">Nombre</th>
                            <th className="border px-3 py-2 whitespace-nowrap">Rol</th>
                            <th className="border px-3 py-2 whitespace-nowrap">Fecha Registro</th>
                            <th className="border px-3 py-2 whitespace-nowrap">Acciones</th>
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
                                    Eliminar
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