import API_BASE_URL from '../../config/backendConfig';
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";

const CrearEvento = () => {
    const [provincia, setProvincia] = useState("");
    const [calleInput, setCalleInput] = useState("");
    const [calles, setCalles] = useState([]);
    const [calleSeleccionada, setCalleSeleccionada] = useState(null);
    const [nombreEvento, setNombreEvento] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [direccionExtra, setDireccionExtra] = useState("");
    const [precio, setPrecio] = useState("0");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", {
                state: { from: location.pathname }
            });
        }
    }, [navigate, location]);

    const buscarCalles = async (valor) => {
        if (!provincia || !valor) return;

        try {
            const url = `${API_BASE_URL}/buscar-calles?provincia=${encodeURIComponent(
                provincia
            )}&query=${encodeURIComponent(valor)}`;

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error("Error al buscar calles");
            }

            const data = await res.json();
            const callesFiltradas = data.filter(
                (item) =>
                    item.type === "residential" ||
                    item.type === "street" ||
                    item.class === "highway"
            );

            setCalles(callesFiltradas);
        } catch (error) {
            console.error("Error buscando calles:", error);
        }
    };

    const handleCalleChange = (e) => {
        const valor = e.target.value;
        setCalleInput(valor);
        buscarCalles(valor);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!provincia || !calleSeleccionada) {
            alert("Provincia y calle seleccionada son obligatorias");
            return;
        }

        const direccion = {
            calle: calleSeleccionada.display_name,
            ciudad:
                calleSeleccionada.address.city ||
                calleSeleccionada.address.town ||
                calleSeleccionada.address.village ||
                provincia,
            provincia,
            codigo_postal: calleSeleccionada.address.postcode || "",
            extra: direccionExtra,
            latitud: parseFloat(calleSeleccionada.lat),
            longitud: parseFloat(calleSeleccionada.lon),
        };

        const evento = {
            nombre_evento: nombreEvento,
            descripcion_evento: descripcion,
            fecha_evento_inicio: fechaInicio,
            fecha_evento_fin: fechaFin,
            precio: parseFloat(precio) || 0,
            direccion: JSON.stringify(direccion),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/eventos-cientificos/crear-evento-cientifico`,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(evento),
                }
            );

            if (res.ok) {
                alert("Evento creado con éxito");
                setNombreEvento("");
                setDescripcion("");
                setFechaInicio("");
                setFechaFin("");
                setProvincia("");
                setCalleInput("");
                setCalles([]);
                setCalleSeleccionada(null);
                setDireccionExtra("");
                setPrecio("0");
            } 
            else {
                const errorData = await res.json();
                alert("Error creando evento: " + errorData.message);
            }
        } catch (error) {
            console.error("Error en envío:", error);
            alert("Error en la comunicación con el servidor");
        }
    };

    return (
        <div className="w-full bg-white shadow-xl rounded-2xl p-8 mt-10 relative">
            <button
                onClick={() => navigate("/eventos-cientificos")}
                className="ml-10 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 rounded"
            >
                <HiArrowLeft className="mr-2 text-xl" />
                Volver
            </button>

            <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10 relative">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    CREAR EVENTO CIENTÍFICO
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre del evento"
                        type="text"
                        value={nombreEvento}
                        onChange={(e) => setNombreEvento(e.target.value)}
                        required
                    />
                    <Textarea
                        label="Descripción"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Fecha de inicio"
                            type="datetime-local"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            required
                        />
                        <Input
                            label="Fecha de fin"
                            type="datetime-local"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            required
                        />
                    </div>
                    <Input
                        label="Provincia"
                        type="text"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        placeholder="Ej: Madrid"
                        required
                    />
                    <Input
                        label="Calle"
                        type="text"
                        value={calleInput}
                        onChange={handleCalleChange}
                        placeholder="Escribe parte del nombre"
                        required
                    />
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">
                            Selecciona calle:
                        </label>
                        <select
                            value={calleSeleccionada?.place_id || ""}
                            onChange={(e) =>
                                setCalleSeleccionada(
                                    calles.find(
                                        (c) => c.place_id.toString() === e.target.value
                                    ) || null
                                )
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        >
                            <option value="">-- Elige una calle --</option>
                            {calles.map((calle) => (
                                <option key={calle.place_id} value={calle.place_id}>
                                    {calle.display_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Detalles adicionales"
                        type="text"
                        value={direccionExtra}
                        onChange={(e) => setDireccionExtra(e.target.value)}
                        placeholder="Ej: Número, piso, letra..."
                    />
                    <Input
                        label="Precio de inscripción (€)"
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        placeholder="0 = gratuito"
                    />
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition duration-200 cursor-pointer"
                    >
                        Crear evento
                    </button>
                </form>
                </div>
        </div>
    );
};

const Input = ({ label, type, value, onChange, required, placeholder }) => (
    <div>
        <label className="block text-gray-700 font-semibold mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded px-3 py-2"
        />
    </div>
);

const Textarea = ({ label, value, onChange, required }) => (
    <div>
        <label className="block text-gray-700 font-semibold mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            required={required}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
        />
    </div>
);

export default CrearEvento;