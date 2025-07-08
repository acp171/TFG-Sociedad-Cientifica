import { useEffect, useState } from "react";

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ nombre: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://tfg-sociedad-cientifica-production.up.railway.app/roles",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err) {
      setError("Error cargando roles");
    } finally {
      setLoading(false);
    }
  };

  const openNewForm = () => {
    setEditingRole(null);
    setFormData({ nombre: "" });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (role) => {
    setEditingRole(role);
    setFormData({ nombre: role.nombre });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError("");
    setSuccess("");
    setFormData({ nombre: "" });
    setEditingRole(null);
  };

  const handleChange = (e) => {
    setFormData({ nombre: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingRole
        ? `https://tfg-sociedad-cientifica-production.up.railway.app/roles/${editingRole.id_socio_rol}`
        : "https://tfg-sociedad-cientifica-production.up.railway.app/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: formData.nombre.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error en la operación");
        return;
      }

      setSuccess(editingRole ? "Rol actualizado." : "Rol creado.");
      fetchRoles();
      closeForm();
    } catch (err) {
      setError("Error en la comunicación con el servidor");
    }
  };

  const handleDelete = async (role) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar el rol "${role.nombre}"? Esta acción no se puede deshacer.`
      )
    )
      return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://tfg-sociedad-cientifica-production.up.railway.app/roles/${role.id_socio_rol}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No se pudo eliminar el rol");
        return;
      }

      setSuccess("Rol eliminado correctamente.");
      fetchRoles();
    } catch (err) {
      setError("Error en la comunicación con el servidor");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestión de Roles</h2>
        <button
          onClick={openNewForm}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Nuevo Rol
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <p>Cargando roles...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-indigo-100">
              <th className="border border-gray-300 px-3 py-1">ID</th>
              <th className="border border-gray-300 px-3 py-1">Nombre</th>
              <th className="border border-gray-300 px-3 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id_socio_rol}>
                <td className="border border-gray-300 px-3 py-1">
                  {role.id_socio_rol}
                </td>
                <td className="border border-gray-300 px-3 py-1">{role.nombre}</td>
                <td className="border border-gray-300 px-3 py-1 space-x-2">
                  {/* No mostrar botones para rol "Administrador" */}
                  {role.nombre !== "Administrador" && (
                    <>
                      <button
                        onClick={() => openEditForm(role)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  {role.nombre === "Administrador" && (
                    <span className="text-gray-500 italic">Protegido</span>
                  )}
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-4 text-gray-600 italic"
                >
                  No hay roles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 w-96 max-w-full shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingRole ? "Editar Rol" : "Nuevo Rol"}
            </h3>

            <label className="block mb-3">
              Nombre *
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="border rounded px-3 py-2 mt-1 w-full"
                autoFocus
                required
              />
            </label>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={closeForm}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;