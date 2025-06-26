import { useState } from "react";

const DatosProyecto = ({ proyecto, setProyecto, navigate, proyectoId, esPresidente, token }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        nombre_proyecto: proyecto.nombre_proyecto,
        descripcion: proyecto.descripcion,
        fecha_inicio: proyecto.fecha_inicio.slice(0, 10),
        fecha_fin: proyecto.fecha_fin.slice(0, 10),
        estado: proyecto.estado,
    });

    const handleChange = (e) => {
        setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const guardarProyecto = async () => {
        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/${proyectoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                throw new Error("Error actualizando proyecto");
            }
            const data = await res.json();
            setProyecto(data.proyecto);
            setEditMode(false);
            alert("Proyecto actualizado");
        }
        catch (err) {
            alert(err.message);
        }
    };

    const eliminarProyecto = async () => {
        if (!window.confirm("¿Eliminar proyecto?")) return;
        try {
            const res = await fetch(`https://tfg-sociedad-cientifica-production.up.railway.app/proyectos-investigacion/${proyectoId}`, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!res.ok) {
                throw new Error("Error eliminando proyecto");
            }
            alert("Proyecto eliminado");
            navigate("/proyectos-investigacion");
        }
        catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
            {!editMode ? (
                <>
                <p className="mb-3"><strong>Descripción:</strong> {proyecto.descripcion}</p>
                <p className="mb-1"><strong>Fecha inicio:</strong> {new Date(proyecto.fecha_inicio).toLocaleDateString()}</p>
                <p className="mb-1"><strong>Fecha fin:</strong> {new Date(proyecto.fecha_fin).toLocaleDateString()}</p>
                <p className="mb-4"><strong>Estado:</strong> {proyecto.estado}</p>
        
                {esPresidente && (
                    <div className="flex gap-4">
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                        onClick={() => setEditMode(true)}
                    >
                        Modificar Proyecto
                    </button>
                    <button
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                        onClick={eliminarProyecto}
                    >
                        Eliminar Proyecto
                    </button>
                    </div>
                )}
                </>
            ) : (
                <form className="flex flex-col gap-4 max-w-md">
                    <input
                        className="border rounded-md px-3 py-2"
                        name="nombre_proyecto"
                        value={formData.nombre_proyecto}
                        onChange={handleChange}
                        placeholder="Nombre Proyecto"
                    />
                    <textarea
                        className="border rounded-md px-3 py-2 resize-none"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Descripción"
                    />
                    <input
                        className="border rounded-md px-3 py-2"
                        type="date"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleChange}
                    />
                    <input
                        className="border rounded-md px-3 py-2"
                        type="date"
                        name="fecha_fin"
                        value={formData.fecha_fin}
                        onChange={handleChange}
                    />
            
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                            onClick={guardarProyecto}
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="bg-gray-400 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-500 transition"
                            onClick={() => setEditMode(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default DatosProyecto;