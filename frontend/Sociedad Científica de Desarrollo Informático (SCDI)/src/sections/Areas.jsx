import { useTranslation } from "react-i18next";

const Areas = () => {
    const { t } = useTranslation();
    const areas = [
        { nombre: t("home.area_web"), icono: "🌐" },
        { nombre: t("home.area_ia"), icono: "🧠" },
        { nombre: t("home.area_ciberseguridad"), icono: "🔒" },
        { nombre: t("home.area_eventos"), icono: "⚡" },
    ];

    return (
        <section className="bg-gray-50 py-16">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-10">{t("home.areas_titulo")}</h2>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {areas.map((area, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                        <div className="text-4xl mb-4">{area.icono}</div>
                        <h3 className="font-semibold text-lg text-gray-700">{area.nombre}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Areas;