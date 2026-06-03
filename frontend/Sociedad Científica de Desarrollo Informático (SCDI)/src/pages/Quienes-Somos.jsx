import { useTranslation } from "react-i18next";

const QuienesSomos = () => {
    const { t } = useTranslation();
    return (
        <section className="bg-white min-h-screen">
            {/* Imagen de portada */}
            <div className="w-full overflow-hidden">
                <img
                    src="/quienes-somos.webp"
                    alt="Portada Sociedad Científica Quienes Somos"
                    className="w-full h-[200px] sm:h-[320px] md:h-[480px] object-cover object-center"
                />
            </div>

            {/* Contenido */}
            <div className="py-12 px-4 sm:px-8 md:px-12 max-w-4xl mx-auto text-gray-800">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 leading-tight">
                    {t("quienes_somos.titulo")}
                </h1>

                <div className="space-y-6 text-sm sm:text-base md:text-lg leading-relaxed break-words">
                    <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p1") }} />
                    <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p2") }} />
                    <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p3") }} />
                    <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p4") }} />
                </div>
            </div>
        </section>
    );
};

export default QuienesSomos;