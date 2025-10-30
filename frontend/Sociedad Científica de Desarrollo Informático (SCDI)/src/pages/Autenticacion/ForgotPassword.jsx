import { useState } from "react";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null);
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        try {
            const res = await fetch(
                "https://tfg-sociedad-cientifica-production.up.railway.app/forgot-password",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            const text = await res.text();
            let data;

            try {
                data = JSON.parse(text);
            }
            catch {
                console.error("Respuesta no es JSON:", text);
                throw new Error("Error inesperado del servidor");
            }

            if (!res.ok) {
                throw new Error(data.message || "Error");
            }

            setStatus("success");
            setMsg(
                "Si existe una cuenta asociada, recibirás un email con instrucciones."
            );
        }
        catch (err) {
            setStatus("error");
            setMsg(err.message || "Error al solicitar restablecimiento");
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-blue-200 to-white">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-blue-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        ¿Olvidaste tu contraseña?
                    </h1>
                    <p className="text-gray-600">
                        Introduce tu correo electrónico y te enviaremos un enlace para restablecerla.
                    </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                        </label>
                        <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-lg transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md"
                    >
                        Enviar enlace de recuperación
                    </button>
                    </form>

                    {status && (
                    <div
                        className={`mt-6 p-3 rounded-lg text-sm font-medium ${
                        status === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                    >
                        {msg}
                    </div>
                    )}

                    <div className="mt-6 text-center">
                    <a
                        href="/login"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        ← Volver a iniciar sesión
                    </a>
                    </div>
            </div>
        </div>
    );
}