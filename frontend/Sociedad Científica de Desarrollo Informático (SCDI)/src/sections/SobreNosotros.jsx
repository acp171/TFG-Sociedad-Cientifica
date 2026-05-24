import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SobreNosotros = () => {
    const { t } = useTranslation();
    return (
        <section className="bg-white py-12">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">{t("home.sobre_titulo")}</h2>
                <p className="text-gray-600 text-lg">
                    {t("home.sobre_desc")}
                </p>
                <div className="mt-6">
                    <Link
                        to="/quienes-somos"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow"
                    >
                        {t("common.saber_mas")}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SobreNosotros;