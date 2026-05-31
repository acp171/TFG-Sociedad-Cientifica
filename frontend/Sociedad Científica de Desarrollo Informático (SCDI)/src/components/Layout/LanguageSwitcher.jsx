import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({ className = "" }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.startsWith("en") ? "en" : "es";

    const toggle = () => {
        const next = currentLang === "es" ? "en" : "es";
        i18n.changeLanguage(next);
    };

    return (
        <button
            onClick={toggle}
            title="Cambiar idioma / Change language"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition text-sm font-semibold shadow-sm ${className}`}
        >
            <span className="text-base leading-none">
                {currentLang === "es" ? "🇪🇸" : "🇬🇧"}
            </span>
            <span className="uppercase tracking-wide text-gray-700">
                {currentLang === "es" ? "ES" : "EN"}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
