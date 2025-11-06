import { useEffect, useState } from "react";

const PerfilUsuario = () => {
    const [usuario, setUsuario] = useState(null);

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

                if (!res.ok) throw new Error("No se pudo cargar el perfil");

                const data = await res.json();
                setUsuario(data.usuario);
            } catch (error) {
                console.error(error);
            }
        };

        fetchPerfil();
    }, []);

    if (!usuario) return <p className="text-center p-6">Cargando perfil...</p>;

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-8 mt-10">
            <h1 className="text-4xl font-bold text-indigo-700 mb-6 text-center">
                Mi Perfil
            </h1>

            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700">Nombre</h2>
                    <p className="text-gray-900">{usuario.nombre}</p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-700">Correo</h2>
                    <p className="text-gray-900">{usuario.email}</p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-700">Tipo de socio</h2>
                    <p className="text-gray-900">{usuario.tipo_socio}</p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-700">Fecha de registro</h2>
                    <p className="text-gray-900">
                        {new Date(usuario.fecha_registro).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PerfilUsuario;