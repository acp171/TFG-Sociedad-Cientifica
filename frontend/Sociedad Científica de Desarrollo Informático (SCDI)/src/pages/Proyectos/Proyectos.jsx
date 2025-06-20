import { useEffect, useState } from "react";

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/listado-proyectos-investigacion")
      .then((res) => res.json())
      .then((data) => {
        setProyectos(data.proyectos?.listaProyectos || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando proyectos", err);
        setLoading(false);
      });
  }, []);

  // Aplica los filtros solo si están definidos
  const proyectosFiltrados = proyectos.filter((proyecto) => {
    let cumpleEstado = true;
    let cumpleFecha = true;

    if (filtroEstado) {
      cumpleEstado = proyecto.estado.toLowerCase() === filtroEstado.toLowerCase();
    }

    if (filtroFechaFin) {
      const fechaFinFiltro = new Date(filtroFechaFin);
      const fechaFinProyecto = new Date(proyecto.fecha_fin);
      cumpleFecha = fechaFinProyecto <= fechaFinFiltro;
    }

    return cumpleEstado && cumpleFecha;
  });

  return (
    <section className="min-h-screen bg-white py-16 px-6 lg:px-20">
      <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
        Proyectos de Investigación
      </h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 mb-10">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En curso">En curso</option>
          <option value="Finalizado">Finalizado</option>
        </select>

        <input
          type="date"
          value={filtroFechaFin}
          onChange={(e) => setFiltroFechaFin(e.target.value)}
          className="border rounded p-2"
          placeholder="Filtrar por fecha fin"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Cargando proyectos...</p>
      ) : proyectosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-center">No hay proyectos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {proyectosFiltrados.map((proyecto) => (
            <div
              key={proyecto.id_proyecto}
              className="p-6 bg-gray-50 rounded-xl shadow-md"
            >
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">
                {proyecto.titulo}
              </h2>
              <p className="text-gray-700 mb-4">{proyecto.descripcion}</p>
              <p className="text-sm text-gray-500">
                <strong>Inicio:</strong>{" "}
                {new Date(proyecto.fecha_inicio).toLocaleDateString()}{" "}
                <strong>Fin:</strong>{" "}
                {new Date(proyecto.fecha_fin).toLocaleDateString()}
                <br />
                <strong>Estado:</strong> {proyecto.estado}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Proyectos;
