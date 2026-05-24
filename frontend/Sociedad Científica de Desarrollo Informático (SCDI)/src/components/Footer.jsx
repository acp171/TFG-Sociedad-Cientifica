import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Footer = () => {
    const { t } = useTranslation();
    return (
      <footer className="bg-gray-200 text-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Izquierda: Logo + Nombre */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
            <img
              src="/scdi.webp"
              alt="Logo"
              className="w-12 h-12"
            />
            <div className="text-sm leading-tight">
              <span className="block font-semibold">{t("footer.sociedad_linea1")}</span>
              <span className="block font-semibold">{t("footer.sociedad_linea2")}</span>
            </div>
          </div>

          {/* Centro: Language switcher */}
          <LanguageSwitcher />

          {/* Derecha: Copyright */}
          <div className="text-xs text-gray-500 max-w-md">
              <div className="elementor-widget-container">
                  {t("footer.copyright", { year: new Date().getFullYear() })}
                  <span className="block md:inline"> Sociedad Científica de Desarrollo Informático – </span>
                  <Link to="/politica-privacidad" className="text-blue-600 hover:underline">
                          {t("common.legal")}
                  </Link>
              </div>
          </div>
        </div>
      </footer>
    );
};

export default Footer;