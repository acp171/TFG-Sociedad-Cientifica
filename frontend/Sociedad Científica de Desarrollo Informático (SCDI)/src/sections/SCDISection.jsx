import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SCDISection = () => {
    const { t } = useTranslation();
    return (
        <section className="bg-gradient-to-b from-blue-100 to-white py-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-800">{t("home.hero_titulo")}</h1>
                    <p className="mt-4 text-gray-600 text-lg">
                        {t("home.hero_desc")}
                    </p>
                    <div className="mt-6 flex justify-center md:justify-start items-center gap-4">
                        <Link
                            to="/unete"
                            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition"
                        >
                            {t("home.unete")}
                        </Link>
                        <Link
                            to="/quienes-somos"
                            className="inline-block text-blue-600 font-semibold underline hover:text-blue-800 transition"
                        >
                            {t("common.saber_mas")}
                        </Link>
                    </div>
                </div>

                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    <img
                        src="/home.webp"
                        alt="Ilustración SCDI"
                        className="w-full max-w-[320px] md:max-w-[400px]"
                    />
                </div>
            </div>
        </section>
    );
};

export default SCDISection;