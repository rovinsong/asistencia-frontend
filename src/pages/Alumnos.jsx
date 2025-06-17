// src/pages/Alumnos.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    nombreCompleto: "",
    direccion: "",
    telefono: "",
    tallerId: ""
  });
  const [editData, setEditData] = useState({
    alumnoId: null,
    tallerId: null,
    nombreCompleto: "",
    direccion: "",
    telefono: ""
  });

  // ← Nuevo estado para búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAlumnos();
    fetchTalleres();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const res = await axios.get(`${baseUrl}/alumnos`);
      setAlumnos(res.data);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    }
  };

  const fetchTalleres = async () => {
    try {
      const res = await axios.get(`${baseUrl}/talleres`);
      setTalleres(res.data);
    } catch (error) {
      console.error("Error al cargar talleres:", error);
    }
  };

  // ——— AGREGAR ALUMNO ——————————————————————
  const openAdd = () => setShowAddModal(true);
  const closeAdd = () => {
    setShowAddModal(false);
    setForm({ nombreCompleto: "", direccion: "", telefono: "", tallerId: "" });
  };

  const handleAddChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreCompleto.trim() || !form.tallerId) return;
    const parts = form.nombreCompleto.trim().split(" ");
    const nombre = parts.shift();
    const apellidos = parts.join(" ");
    try {
      await axios.post(`${baseUrl}/alumnos`, {
        nombre, apellidos,
        direccion: form.direccion,
        telefono: form.telefono,
        tallerId: form.tallerId
      });
      closeAdd();
      fetchAlumnos();
    } catch (error) {
      console.error("Error al crear alumno:", error);
      alert("Error al crear alumno");
    }
  };

  // ——— EDITAR / ELIMINAR EN TALLER ——————————————————————
  const openEdit = (a, tId) => {
    setEditData({
      alumnoId: a.id,
      tallerId: tId,
      nombreCompleto: `${a.nombre} ${a.apellidos}`,
      direccion: a.direccion || "",
      telefono: a.telefono || ""
    });
    setShowEditModal(true);
  };
  const closeEdit = () => {
    setShowEditModal(false);
    setEditData({
      alumnoId: null,
      tallerId: null,
      nombreCompleto: "",
      direccion: "",
      telefono: ""
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { alumnoId, nombreCompleto, direccion, telefono } = editData;
    if (!nombreCompleto.trim()) return;
    const parts = nombreCompleto.trim().split(" ");
    const nombre = parts.shift();
    const apellidos = parts.join(" ");
    try {
      await axios.put(`${baseUrl}/alumnos/${alumnoId}`, {
        nombre, apellidos, direccion, telefono
      });
      closeEdit();
      fetchAlumnos();
    } catch (error) {
      console.error("Error al actualizar alumno:", error);
      alert("Error al actualizar");
    }
  };

  const handleRemove = async () => {
    const { alumnoId, tallerId } = editData;
    if (!window.confirm("¿Eliminar este alumno de este taller?")) return;
    try {
      await axios.delete(
        `${baseUrl}/alumnos/${alumnoId}/talleres/${tallerId}`
      );
      closeEdit();
      fetchAlumnos();
    } catch (error) {
      console.error("Error al eliminar alumno:", error);
      alert("Error al eliminar");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Gestión de Alumnos</h1>

      {/* — BARRA DE BÚSQUEDA — */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>

      {/* LISTADO AGRUPADO POR TALLER */}
      <div className="mt-6">
        {talleres.map((t) => (
          <div key={t.id} className="mb-6">
            <h2 className="text-lg font-semibold text-blue-300">{t.nombre}</h2>
            <ul className="space-y-2">
              {alumnos
                // primero filtramos por taller...
                .filter((a) => a.talleres.includes(t.id))
                // ...luego por el término de búsqueda
                .filter((a) => {
                  const full = `${a.nombre} ${a.apellidos}`.toLowerCase();
                  return full.includes(searchTerm.toLowerCase());
                })
                .map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between bg-gray-700 p-2 rounded"
                  >
                    <span className="text-white">
                      {a.nombre} {a.apellidos}
                    </span>
                    <button
                      onClick={() => openEdit(a, t.id)}
                      className="text-yellow-400 hover:text-yellow-500"
                    >
                      Editar
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {/* BOTÓN AGREGAR */}
      <div className="mt-8">
        <button
          onClick={openAdd}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Agregar Alumno
        </button>
      </div>

      {/* MODAL AGREGAR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Alumno</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input
                name="nombreCompleto"
                value={form.nombreCompleto}
                onChange={handleAddChange}
                placeholder="Nombre Completo"
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleAddChange}
                placeholder="Dirección"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleAddChange}
                placeholder="Teléfono"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <select
                name="tallerId"
                value={form.tallerId}
                onChange={handleAddChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              >
                <option value="">Seleccionar Taller</option>
                {talleres.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={closeAdd}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Alumno</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                name="nombreCompleto"
                value={editData.nombreCompleto}
                onChange={handleEditChange}
                placeholder="Nombre Completo"
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                name="direccion"
                value={editData.direccion}
                onChange={handleEditChange}
                placeholder="Dirección"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                name="telefono"
                value={editData.telefono}
                onChange={handleEditChange}
                placeholder="Teléfono"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
            <hr className="my-4 border-gray-700" />
            <button
              onClick={handleRemove}
              className="w-full py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar de este taller
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
