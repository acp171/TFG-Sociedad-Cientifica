import { useState } from "react";
import { FaUsers, FaUserTag, FaUserShield, FaProjectDiagram, FaNewspaper, FaCalendarAlt, FaBars, FaTimes, FaBriefcase } from "react-icons/fa";

import AdminSocios from "../../components/Administrador/AdminSocios";
import AdminTipos from "../../components/Administrador/AdminTipos";
import AdminRoles from "../../components/Administrador/AdminRoles";
import AdminProyectos from "../../components/Administrador/AdminProyectos";
import AdminArticulos from "../../components/Administrador/AdminArticulos";
import AdminEventos from "../../components/Administrador/AdminEventos";
import AdminComites from "../../components/Administrador/AdminComites";

const tabs = [
    { id: "socios", label: "Socios", icon: <FaUsers /> },
    { id: "tipos", label: "Tipos de socio", icon: <FaUserTag /> },
    { id: "roles", label: "Roles", icon: <FaUserShield /> },
    { id: "comites", label: "Comités", icon: <FaBriefcase /> },
    { id: "proyectos", label: "Proyectos", icon: <FaProjectDiagram /> },
    { id: "articulos", label: "Artículos", icon: <FaNewspaper /> },
    { id: "eventos", label: "Eventos", icon: <FaCalendarAlt /> },
];

const PanelAdmin = () => {
    const [selectedTab, setSelectedTab] = useState("socios");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (selectedTab) {
        case "socios":
            return <AdminSocios />;
        case "tipos":
            return <AdminTipos />;
        case "roles":
            return <AdminRoles />;
        case "comites":
            return <AdminComites />;
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
        <div className="min-h-screen flex bg-gradient-to-b from-blue-200 to-white relative transition-all duration-300">
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Aside Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl p-6 space-y-4 transition-transform duration-300 transform 
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:relative lg:translate-x-0 lg:shadow-md lg:w-80
            `}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-indigo-700">PANEL ADMINISTRADOR</h2>
                    <button 
                        className="lg:hidden p-2 text-gray-500"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <div className="space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setSelectedTab(tab.id);
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition ${
                                selectedTab === tab.id 
                                ? "bg-indigo-600 text-white shadow-lg font-semibold" 
                                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 w-full overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        className="lg:hidden p-3 bg-white shadow-md rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <FaBars size={20} />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {tabs.find((t) => t.id === selectedTab)?.label}
                    </h1>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl shadow overflow-hidden">
                    <div className="w-full">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PanelAdmin;