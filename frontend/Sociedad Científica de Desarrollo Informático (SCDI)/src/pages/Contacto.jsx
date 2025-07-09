import { useState } from "react";
import { motion } from "framer-motion";

const Contacto = () => {
    const [formData, setFormData] = useState({
        email: "",
        titulo: "",
        mensaje: "",
    });

    const [enviado, setEnviado] = useState(false);

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Debes estar autenticado para enviar un mensaje.");
            return;
        }

        try {
            const response = await fetch("https://tfg-sociedad-cientifica-production.up.railway.app/notificacion-contacto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: formData.email,
                    titulo: formData.titulo,
                    mensaje: formData.mensaje,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al enviar el mensaje.");
            }

            console.log("✅ Notificación enviada:", data.message);
            setEnviado(true);
            setFormData({ email: "", titulo: "", mensaje: "" });
        }
        catch (error) {
            console.error("❌ Error:", error.message);
            alert("Error al enviar el mensaje: " + error.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8"
            >
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    CONTÁCTANOS
                </h1>

                {enviado && (
                <motion.div
                    className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-6 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    ✅ ¡Gracias por tu mensaje! Te responderemos pronto.
                </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="tunombre@correo.com"
                            className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                            Título
                        </label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            required
                            placeholder="Título del mensaje"
                            className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
                            Mensaje
                        </label>
                        <textarea
                            id="mensaje"
                            name="mensaje"
                            value={formData.mensaje}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder="Escribe tu mensaje aquí..."
                            className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full transition duration-300 shadow"
                        >
                            Enviar mensaje
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Contacto;