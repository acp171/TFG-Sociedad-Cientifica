import { useState } from "react";

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

    const buscarCalles = async (valor) => {
        if (!provincia || !valor) return;

        try {
            const url = `http://localhost:4000/buscar-calles?provincia=${encodeURIComponent(
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
        };

        const evento = {
            nombre_evento: nombreEvento,
            descripcion_evento: descripcion,
            fecha_evento_inicio: fechaInicio,
            fecha_evento_fin: fechaFin,
            direccion: JSON.stringify(direccion),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                "http://localhost:4000/eventos-cientificos/crear-evento-cientifico",
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
            } else {
                const errorData = await res.json();
                alert("Error creando evento: " + errorData.message);
            }
        } catch (error) {
            console.error("Error en envío:", error);
            alert("Error en la comunicación con el servidor");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
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
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition duration-200"
                >
                    Crear evento
                </button>
            </form>
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