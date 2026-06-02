import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiXCircle, HiArrowLeft } from 'react-icons/hi';
import { useTranslation } from "react-i18next";

const CrearArticulo = () => {
    const { t } = useTranslation();
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", {
                state: { from: location.pathname }
            });
        }
    }, [navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("contenido", contenido);

        if (pdfFile) {
            formData.append("pdf", pdfFile);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/articulos-cientificos/publicar-articulo-cientifico`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            const text = await res.text();
            console.log("Respuesta cruda del servidor:", text);

            if (res.ok) {
                navigate("/articulos-cientificos");
            } else {
                let mensaje = "Error";
                try {
                    const data = JSON.parse(text);
                    mensaje = data.message || mensaje;
                } catch {
                    // ya tenemos `text`, lo mostramos por consola
                }
                alert(t("crear_articulo.error_publicar") + mensaje);
            }
        } catch (err) {
            console.error("Error al subir artículo:", err);
        }
    };

    return (
        <section className="min-h-[80vh] flex flex-col justify-center items-center bg-gradient-to-b from-blue-200 to-white py-16 px-6 lg:px-20 font-sans">
            {/* Botón Volver */}
            <button
                onClick={() => navigate("/articulos-cientificos")}
                className="self-start mb-6 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition"
            >
                <HiArrowLeft className="mr-2 text-xl" />
                {t("crear_articulo.volver")}
            </button>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-12 text-center">
                {t("crear_articulo.titulo_pagina")}
            </h2>
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg p-8 max-w-3xl w-full space-y-8"
                encType="multipart/form-data"
            >
                <div>
                    <label htmlFor="titulo" className="block mb-3 font-semibold text-gray-700">
                        {t("crear_articulo.titulo")}
                    </label>
                    <input
                        id="titulo"
                        type="text"
                        placeholder={t("crear_articulo.titulo_placeholder")}
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md p-3 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                </div>

                <div>
                    <label htmlFor="contenido" className="block mb-3 font-semibold text-gray-700">
                        {t("crear_articulo.contenido")}
                    </label>
                    <textarea
                        id="contenido"
                        placeholder={t("crear_articulo.contenido_placeholder")}
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        required
                        rows={8}
                        className="w-full border border-gray-300 rounded-md p-3 text-gray-900 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    ></textarea>
                </div>

                <div>
                    <label
                        htmlFor="pdf-upload"
                        className="inline-block cursor-pointer bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition select-none"
                    >
                        {t("crear_articulo.subir_pdf")}
                    </label>
                    <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        className="hidden"
                    />
                    {pdfFile ? (
                        <div className="mt-4 flex items-center gap-3 text-gray-900 text-base">
                        <span>{t("crear_articulo.archivo_seleccionado", { name: pdfFile.name })}</span>
                        <HiXCircle
                            title={t("crear_articulo.quitar_archivo")}
                            onClick={() => setPdfFile(null)}
                            className="text-2xl text-gray-500 hover:text-red-600 cursor-pointer transition duration-200"
                        />
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-500">{t("crear_articulo.no_archivo")}</p>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-semibold px-10 py-3 rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
                    >
                        {t("crear_articulo.publicar")}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CrearArticulo;