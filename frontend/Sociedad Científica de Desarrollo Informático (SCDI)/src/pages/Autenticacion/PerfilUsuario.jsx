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

                if (!res.ok) {
                    throw new Error("No se pudo cargar el perfil");
                }

                const data = await res.json();
                setUsuario(data.socio);
            }
            catch (error) {
                console.error(error);
            }
        };

        fetchPerfil();
    }, []);

    if (!usuario) return <p className="text-center p-6">Cargando perfil...</p>;

    return (
        <div className="min-h-[80vh] bg-gradient-to-b from-blue-200 to-white py-16 px-4">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-8 mt-10">
                <h1 className="text-4xl font-bold text-indigo-700 mb-6 text-center">
                    Mi perfil
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div>
                        <h2 className="text-lg font-semibold text-black">Nombre completo</h2>
                        <p className="text-gray-900">{usuario.nombre} {usuario.apellidos}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-black">Correo electrónico</h2>
                        <p className="text-gray-900">{usuario.email}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-black">Teléfono</h2>
                        <p className="text-gray-900">{usuario.telefono}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-black">Tipo de socio</h2>
                        <p className="text-gray-900">{usuario.tipo_socio}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-black">Rol del socio</h2>
                        <p className="text-gray-900">{usuario.socio_rol}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-black">Fecha de nacimiento</h2>
                        <p className="text-gray-900">
                            {new Date(usuario.fecha_nacimiento).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-black">Fecha de registro</h2>
                        <p className="text-gray-900">
                            {new Date(usuario.fecha_alta).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilUsuario;