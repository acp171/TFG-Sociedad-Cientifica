import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiXCircle } from 'react-icons/hi';

const CrearArticulo = () => {
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            // Si no está logueado, redirige a login
            navigate("/login");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("contenido", contenido);

        if (pdfFile) {
            formData.append("contenidopdf", pdfFile);
        }

        try {
            const res = await fetch("http://localhost:4000/publicar-articulo-cientifico", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                navigate("/articulos-cientificos");
            } else {
                const error = await res.json();
                alert("Error al publicar: " + (error.message || "Error desconocido"));
            }
        } catch (err) {
            console.error("Error al subir artículo:", err);
        }
    };

    return (
        <section className="w-full bg-gradient-to-b from-blue-100 to-white py-16 px-6 lg:px-16 min-h-[80vh] flex flex-col pb-12">
            <h2 className="text-center text-2xl font-bold mb-8">PUBLICAR ARTÍCULO CIENTÍFICO</h2>
            <form onSubmit={handleSubmit} className="space-y-8 flex-grow flex flex-col justify-between" encType="multipart/form-data">
                <div>
                    <label className="block mb-2 font-semibold">Título</label>
                    <input
                        type="text"
                        placeholder="Título"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                        className="w-1/2 border p-2 rounded mb-6"
                    />

                    <label className="block mb-2 font-semibold">Contenido</label>
                    <textarea
                        placeholder="Contenido"
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        required
                        className="w-full border p-2 rounded h-40 mb-6"
                    ></textarea>

                    <div className="w-full">
                        <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                        >
                        Subir PDF
                        </label>

                        <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        className="hidden"
                        />

                        {pdfFile ? (
                            <div className="mt-2 flex items-center gap-2 text-sm text-black">
                                <span>Archivo seleccionado: {pdfFile.name}</span>
                                <HiXCircle
                                title="Quitar archivo"
                                onClick={() => setPdfFile(null)}
                                className="pt-0.5 text-xl text-gray-500 hover:text-red-600 cursor-pointer transition duration-200"
                                />
                            </div>
                        ) : (
                            <div className="mt-2 flex items-center gap-2 text-sm text-black">
                                <span>Archivo seleccionado: No hay ningún archivo seleccionado.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center mt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
                    >
                        Publicar
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CrearArticulo;
