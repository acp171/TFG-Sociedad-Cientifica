import { Link } from "react-router-dom";

const Footer = () => {
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
              <span className="block font-semibold">Sociedad Científica de</span>
              <span className="block font-semibold">Desarrollo Informático</span>
            </div>
          </div>

          {/* Derecha: Copyright */}
          <div className="text-xs text-gray-500 max-w-md">
              <div className="elementor-widget-container">
                  Copyright © {new Date().getFullYear()} SCDI.
                  <span className="block md:inline">Sociedad Científica de Desarrollo Informático – </span>
                  <Link to="/politica-privacidad" className="text-blue-600 hover:underline">
                          Aviso legal
                  </Link>
              </div>
          </div>
        </div>
      </footer>
    );
};

export default Footer;