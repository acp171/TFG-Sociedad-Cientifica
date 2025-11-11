import { useState } from "react";
import { useAuth } from "../../hooks/AuthContext";

import PerfilUsuario from "../../components/Perfil/PerfilUsuario";
import Notificaciones from "../Notificaciones";
import InscripcionesUsuario from "../../components/Perfil/InscripcionesUsuario";
import GestionMiembros from "../../components/Perfil/GestionMiembros"; 

const tabsBase = [
    { id: "perfil", label: "Perfil" },
    { id: "notificaciones", label: "Notificaciones" },
    { id: "inscripciones", label: "Inscripciones" },
];

const PanelPerfil = () => {
    const [selectedTab, setSelectedTab] = useState("socios");
    const { userTipoSocio } = useAuth();

    const tabs = userTipoSocio === 6 
        ? [...tabsBase, { id: "miembros", label: "Miembros" }]
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
        <div className="min-h-screen flex bg-gradient-to-b from-blue-200 to-white">
            <aside className="w-80 bg-white shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold mb-8 text-indigo-700">PANEL DE USUARIO</h2>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left hover:bg-indigo-100 transition ${
                            selectedTab === tab.id ? "bg-indigo-200 font-semibold" : ""
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </aside>

            <main className="flex-1 p-8">
                <div>{renderContent()}</div>
            </main>
        </div>
    );
};

export default PanelPerfil;