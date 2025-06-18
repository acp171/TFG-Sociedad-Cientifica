import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-gray-700 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Izquierda: Logo + Nombre */}
        <div className="flex items-center space-x-3">
          <img
            src="/scdi.webp"
            alt="Logo"
            className="w-10 h-10"
          />
          <div className="text-sm leading-tight">
            <span className="block font-semibold">Sociedad Científica de</span>
            <span className="block font-semibold">Desarrollo Informático</span>
          </div>
        </div>

        {/* Derecha: Copyright */}
        <div className="text-xs text-gray-500 text-center md:text-right">
            <div className="elementor-widget-container">
                Copyright © {new Date().getFullYear()} SCDI.
                <span>Sociedad Científica de Desarrollo Informático – </span>
                <Link to="/politica-privacidad" className="text-blue-600">
                        Aviso legal
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;