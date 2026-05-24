import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const PerfilUsuario = () => {
    const { t } = useTranslation();
    const [usuario, setUsuario] = useState(null);
    const [editando, setEditando] = useState(false);

    // Campos editables
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [telefono, setTelefono] = useState("");

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const res = await fetch(
                    "https://tfg-sociedad-cientifica-production.up.railway.app/perfil",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("No se pudo cargar el perfil");
                }

                const data = await res.json();
                setUsuario(data.socio);

                // Pre-cargar datos en los inputs
                setNombre(data.socio.nombre);
                setApellidos(data.socio.apellidos);
                setTelefono(data.socio.telefono);

            }
            catch (error) {
                console.error(error);
            }
        };

        fetchPerfil();
    }, []);

    const handleGuardar = async (e) => {
        e.preventDefault();

        const res = await fetch(
            "https://tfg-sociedad-cientifica-production.up.railway.app/perfil",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    nombre,
                    apellidos,
                    telefono,
                }),
            }
        );

        const data = await res.json();

        if (res.ok) {
            alert(t("perfil.perfil_actualizado"));
            setUsuario(data.socio);
            setEditando(false);
        }
        else {
            alert(t("perfil.error_actualizar_perfil"));
        }
    };

    const handleBaja = async () => {
        if (!confirm(t("perfil.confirmar_baja"))) return;

        const res = await fetch(
            "https://tfg-sociedad-cientifica-production.up.railway.app/perfil",
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        if (res.ok) {
            alert(t("perfil.cuenta_eliminada"));
            localStorage.removeItem("token");
            window.location.href = "/";
        }
        else {
            alert(t("perfil.error_eliminar"));
        }
    };

    if (!usuario) return <p className="text-center p-6">{t("perfil.cargando")}</p>;

    return (
        <div className="min-h-[80vh] bg-gradient-to-b from-blue-200 to-white py-16 px-4">
            
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-8 mt-10">
                
                <h1 className="text-4xl font-bold text-indigo-700 mb-6 text-center">
                    {t("perfil.mi_perfil")}
                </h1>

                {!editando && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-lg font-semibold text-black">{t("perfil.nombre_completo")}</h2>
                            <p className="text-gray-900">{usuario.nombre} {usuario.apellidos}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-black">{t("perfil.email")}</h2>
                            <p className="text-gray-900">{usuario.email}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-black">{t("perfil.telefono")}</h2>
                            <p className="text-gray-900">{usuario.telefono}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-black">{t("perfil.tipo_socio")}</h2>
                            <p className="text-gray-900">{usuario.tipo_socio}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-black">{t("perfil.rol_socio")}</h2>
                            <p className="text-gray-900">{usuario.socio_rol}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-black">{t("perfil.fecha_nacimiento")}</h2>
                            <p className="text-gray-900">
                                {new Date(usuario.fecha_nacimiento).toLocaleDateString()}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-black">{t("perfil.fecha_registro")}</h2>
                            <p className="text-gray-900">
                                {new Date(usuario.fecha_registro).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                {editando && (
                    <form onSubmit={handleGuardar} className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <div>
                            <label className="font-semibold text-black">{t("perfil.nombre")}</label>
                            <input
                                className="w-full mt-1 border p-2 rounded"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-black">{t("perfil.apellidos")}</label>
                            <input
                                className="w-full mt-1 border p-2 rounded"
                                value={apellidos}
                                onChange={(e) => setApellidos(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-black">{t("perfil.telefono")}</label>
                            <input
                                className="w-full mt-1 border p-2 rounded"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                            >
                                {t("perfil.guardar_cambios")}
                            </button>
                        </div>

                    </form>
                )}
            </div>

            <div className="flex justify-center gap-4 mt-10">
                <button
                    onClick={() => setEditando(!editando)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    {editando ? t("perfil.cancelar_edicion") : t("perfil.editar_perfil")}
                </button>
                <button
                    onClick={handleBaja}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    {t("perfil.dar_baja")}
                </button>
            </div>
        </div>
    );
};

export default PerfilUsuario;