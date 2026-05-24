import { useTranslation } from "react-i18next";

const QuienesSomos = () => {
    const { t } = useTranslation();
    return (
        <section className="bg-white">
            {/* Imagen de portada */}
            <div className="w-full">
                <img
                    src="/quienes-somos.webp"
                    alt="Portada Sociedad Científica Quienes Somos"
                    className="w-full h-[250px] md:h-[550px] object-cover"
                />
            </div>
            <div className="py-16 px-6 max-w-5xl mx-auto text-gray-800 space-y-8">
                <h1 className="text-4xl font-bold text-center mb-8">{t("quienes_somos.titulo")}</h1>
            
                <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p1") }} />
                <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p2") }} />
                <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p3") }} />
                <p dangerouslySetInnerHTML={{ __html: t("quienes_somos.p4") }} />
            </div>
        </section>
    );
};
  
export default QuienesSomos;