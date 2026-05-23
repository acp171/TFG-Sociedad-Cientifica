import { useNavigate } from "react-router-dom";

const RegistroExitoso = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago exitoso!</h1>
                <p className="text-gray-700 mb-6">Tu registro se ha completado correctamente.</p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Iniciar sesión
                </button>
            </div>
        </div>
    );
};

export default RegistroExitoso;