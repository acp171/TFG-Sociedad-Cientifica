import { useState } from "react";
import { useAuth } from "../../hooks/AuthContext";

import PerfilUsuario from "../../components/Perfil/PerfilUsuario";
import Notificaciones from "../Notificaciones";
import InscripcionesUsuario from "../../components/Perfil/InscripcionesUsuario";
import GestionMiembros from "../../components/Perfil/GestionMiembros"; 
import { useTranslation } from "react-i18next";

const PanelPerfil = () => {
    const { t } = useTranslation();
    const [selectedTab, setSelectedTab] = useState("perfil");
    const { userTipoSocio } = useAuth();

    const tabsBase = [
        { id: "perfil", label: t("perfil_page.tab_perfil") },
        { id: "notificaciones", label: t("perfil_page.tab_notificaciones") },
        { id: "inscripciones", label: t("perfil_page.tab_inscripciones") },
    ];

    const tabs = userTipoSocio === 6 
        ? [...tabsBase, { id: "miembros", label: t("perfil_page.tab_miembros") }]
        : tabsBase;

    const renderContent = () => {
        switch (selectedTab) {
            case "perfil":
                return <PerfilUsuario />;
            case "notificaciones":
                return <Notificaciones />;
            case "inscripciones":
                return <InscripcionesUsuario />;
            case "miembros":
                    return <GestionMiembros />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-blue-200 to-white">
            <aside className="w-full md:w-80 bg-white shadow-md p-4 md:p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4 md:mb-8 text-indigo-700 text-center md:text-left">{t("perfil_page.panel")}</h2>
                <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 md:gap-4 no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg text-sm md:text-base text-left hover:bg-indigo-100 transition whitespace-nowrap ${
                                selectedTab === tab.id ? "bg-indigo-200 font-semibold" : ""
                            } md:w-full`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8 overflow-hidden">
                <div className="max-w-full">{renderContent()}</div>
            </main>
        </div>
    );
};

export default PanelPerfil;