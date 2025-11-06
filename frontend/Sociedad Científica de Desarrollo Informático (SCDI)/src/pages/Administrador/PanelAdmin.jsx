import { useState } from "react";
import { FaUsers, FaUserTag, FaUserShield, FaProjectDiagram, FaNewspaper, FaCalendarAlt } from "react-icons/fa";

import AdminSocios from "../../components/Administrador/AdminSocios";
import AdminTipos from "../../components/Administrador/AdminTipos";
import AdminRoles from "../../components/Administrador/AdminRoles";
import AdminProyectos from "../../components/Administrador/AdminProyectos";
import AdminArticulos from "../../components/Administrador/AdminArticulos";
import AdminEventos from "../../components/Administrador/AdminEventos";

const tabs = [
    { id: "socios", label: "Socios", icon: <FaUsers /> },
    { id: "tipos", label: "Tipos de socio", icon: <FaUserTag /> },
    { id: "roles", label: "Roles", icon: <FaUserShield /> },
    { id: "proyectos", label: "Proyectos", icon: <FaProjectDiagram /> },
    { id: "articulos", label: "Artículos", icon: <FaNewspaper /> },
    { id: "eventos", label: "Eventos", icon: <FaCalendarAlt /> },
];

const PanelAdmin = () => {
    const [selectedTab, setSelectedTab] = useState("socios");

    const renderContent = () => {
        switch (selectedTab) {
        case "socios":
            return <AdminSocios />;
        case "tipos":
            return <AdminTipos />;
        case "roles":
            return <AdminRoles />;
        case "proyectos":
            return <AdminProyectos />;
        case "articulos":
            return <AdminArticulos />;
        case "eventos":
            return <AdminEventos />;
        default:
            return null;
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-b from-blue-200 to-white">
            <aside className="w-80 bg-white shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold mb-8 text-indigo-700">PANEL ADMINISTRADOR</h2>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left hover:bg-indigo-100 transition ${
                        selectedTab === tab.id ? "bg-indigo-200 font-semibold" : ""
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </aside>

            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">
                    {tabs.find((t) => t.id === selectedTab)?.label}
                </h1>
                <div className="bg-white p-6 rounded-xl shadow">{renderContent()}</div>
            </main>
        </div>
    );
};

export default PanelAdmin;