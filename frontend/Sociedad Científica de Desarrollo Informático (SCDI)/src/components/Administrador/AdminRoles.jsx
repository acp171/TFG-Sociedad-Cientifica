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
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setRoles(data.roles || []);
    } catch (err) {
      console.error(err);
      setError("Error cargando roles");
    } finally {
      setLoading(false);
    }
  };

  const openNewForm = () => {
    setEditingRole(null);
    setFormData({ nombre: "" });
    setShowForm(true);
  };

  const openEditForm = (role) => {
    setEditingRole(role);
    setFormData({ nombre: role.nombre });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingRole(null);
    setFormData({ nombre: "" });
    setShowForm(false);
    setError("");
    setSuccess("");
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
      const method = editingRole ? "PUT" : "POST";
      const url = editingRole
        ? `https://tfg-sociedad-cientifica-production.up.railway.app/roles/${editingRole.id}`
        : "https://tfg-sociedad-cientifica-production.up.railway.app/roles";

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
      console.error("Error:", err);
      setError("Error en la comunicación con el servidor");
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el rol "${role.nombre}"?`))
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://tfg-sociedad-cientifica-production.up.railway.app/roles/${role.id}`,
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
      console.error("Error:", err);
      setError("Error al eliminar el rol");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Roles</h2>
        <button
          onClick={openNewForm}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Nuevo Rol
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && (
        <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>
      )}

      {loading ? (
        <p>Cargando roles...</p>
      ) : (
        <table className="w-full border border-gray-300 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Nombre</th>
              <th className="border px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="border px-3 py-2">{role.id}</td>
                <td className="border px-3 py-2">{role.nombre}</td>
                <td className="border px-3 py-2 space-x-2">
                  {role.nombre === "Administrador" ? (
                    <span className="text-gray-500 italic">Protegido</span>
                  ) : (
                    <>
                      <button
                        onClick={() => openEditForm(role)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-600 italic">
                  No hay roles registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingRole ? "Editar Rol" : "Nuevo Rol"}
            </h3>

            <label className="block mb-3">
              Nombre *
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={closeForm}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
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