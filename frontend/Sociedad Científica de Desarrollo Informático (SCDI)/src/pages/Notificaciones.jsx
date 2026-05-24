import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MailOpen, Mail, X } from "lucide-react";
import { useAuth } from "../hooks/AuthContext";
import { useTranslation } from "react-i18next";

const Notificaciones = () => {
    const { isLoggedIn } = useAuth();
    const { t } = useTranslation();
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificacionActiva, setNotificacionActiva] = useState(null);

    const fetchNotificaciones = async () => {
        try {
            const res = await fetch(
                "https://tfg-sociedad-cientifica-production.up.railway.app/listado-notificacion-usuario",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Error al obtener notificaciones");
            }

            const data = await res.json();
            setNotificaciones(data.notificaciones.listadoNotificaciones || []);
        } 
        catch (error) {
            console.error("Error al cargar notificaciones:", error);
            setNotificaciones([]);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) fetchNotificaciones();
    }, [isLoggedIn]);

    useEffect(() => {
        document.body.classList.add(
            "bg-gradient-to-b",
            "from-blue-200",
            "to-white"
        );

        return () => {
            document.body.classList.remove(
                "bg-gradient-to-b",
                "from-blue-200",
                "to-white"
            );
        };
    }, []);


    const marcarComoLeidaNotificacion = async (id) => {
        try {
            await fetch(
                `https://tfg-sociedad-cientifica-production.up.railway.app/notificaciones/${id}/leida`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setNotificaciones((prev) =>
                prev.map((n) =>
                n.id_notificacion === id ? { ...n, estado_lectura: true } : n
                )
            );
        }
        catch (error) {
            console.error("Error al marcar como leída:", error);
        }
    };

    const abrirNotificacion = (notificacion) => {
        setNotificacionActiva(notificacion);
        if (!notificacion.estado_lectura) {
            marcarComoLeidaNotificacion(notificacion.id_notificacion);
        }
    };

    const cerrarModal = () => setNotificacionActiva(null);

    if (!isLoggedIn) {
        return <p className="p-4 text-center text-gray-600">{t("notificaciones_page.debes_iniciar")}</p>;
    }

    if (loading) {
        return <p className="p-4 text-center text-gray-600">{t("notificaciones_page.cargando")}</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                {t("notificaciones_page.titulo")}
            </h1>

            {notificaciones.length === 0 ? (
                <div className="text-center text-gray-500 bg-gray-50 py-10 rounded-xl shadow">
                    <MailOpen className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p>{t("notificaciones_page.sin_notificaciones")}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {notificaciones.map((n) => (
                        <motion.div
                            key={n.id_notificacion}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl shadow cursor-pointer transition-all ${
                                n.estado_lectura
                                ? "bg-gray-100 border border-gray-200"
                                : "bg-blue-50 border border-blue-300 hover:shadow-md"
                            }`}
                            onClick={() => abrirNotificacion(n)}
                        >
                            <div className="flex justify-between items-center">
                                <h2
                                    className={`text-lg ${
                                        n.estado_lectura ? "font-medium" : "font-semibold text-blue-700"
                                    }`}
                                >
                                    {n.titulo}
                                </h2>

                                {n.estado_lectura ? (
                                    <MailOpen className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <Mail className="w-5 h-5 text-blue-500" />
                                )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                                {n.mensaje.length > 80
                                ? n.mensaje.substring(0, 80) + "..."
                                : n.mensaje}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                {new Date(n.fecha_envio).toLocaleString()}
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {notificacionActiva && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                                onClick={cerrarModal}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold mb-2 text-gray-800">
                                {notificacionActiva.titulo}
                            </h2>
                            <p className="text-gray-700 mb-4">{notificacionActiva.mensaje}</p>
                            <p className="text-sm text-gray-400">
                                {new Date(notificacionActiva.fecha_envio).toLocaleString()}
                            </p>

                            <div className="text-right mt-4">
                                <button
                                    onClick={cerrarModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                                >
                                    {t("notificaciones_page.cerrar")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notificaciones;