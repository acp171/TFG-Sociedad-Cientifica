import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CallToAction = () => {
    const { t } = useTranslation();
    return (
        <section className="pt-10 pb-10 px-6 bg-blue-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{t("home.cta_titulo")}</h2>
            <p className="mb-6 text-lg">{t("home.cta_desc")}</p>
            <Link
                to="/unete"
                className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-200 hover:text-blue-800 transition"
            >
                {t("common.unirme")}
            </Link>
        </section>
    );
};

export default CallToAction;
