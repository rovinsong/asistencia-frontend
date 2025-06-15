// src/pages/Alumnos.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [form, setForm] = useState({
    nombreCompleto: "",
    direccion: "",
    telefono: "",
    tallerId: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [editForm, setEditForm] = useState({
    nombreCompleto: "",
    direccion: "",
    telefono: ""
  });

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAlumnos();
    fetchTalleres();
  }, []);

  const fetchAlumnos = async () => {
    try {
      const res = await axios.get(`${baseUrl}/alumnos`);
      setAlumnos(res.data);
    } catch (err) {
      console.error("Error al cargar alumnos:", err);
    }
  };

  const fetchTalleres = async () => {
    try {
      const res = await axios.get(`${baseUrl}/talleres`);
      setTalleres(res.data);
    } catch (err) {
      console.error("Error al cargar talleres:", err);
    }
  };

  // — Crear nuevo alumno —
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
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
      setForm({ nombreCompleto: "", direccion: "", telefono: "", tallerId: "" });
      fetchAlumnos();
    } catch (err) {
      console.error("Error al crear alumno:", err);
      alert("No se pudo crear el alumno");
    }
  };

  // — Filtrado por buscador —
  const filteredAlumnos = alumnos.filter((a) => {
    const full = `${a.nombre} ${a.apellidos}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  // — Abrir modal de edición —
  const handleEdit = (a) => {
    setEditingAlumno(a);
    setEditForm({
      nombreCompleto: `${a.nombre} ${a.apellidos}`,
      direccion: a.direccion || "",
      telefono: a.telefono || ""
    });
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // — Guardar cambios —
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const parts = editForm.nombreCompleto.trim().split(" ");
    const nombre = parts.shift();
    const apellidos = parts.join(" ");
    try {
      await axios.put(`${baseUrl}/alumnos/${editingAlumno.id}`, {
        nombre, apellidos,
        direccion: editForm.direccion,
        telefono: editForm.telefono
      });
      fetchAlumnos();
      setEditingAlumno(null);
    } catch (err) {
      console.error("Error actualizando:", err);
      alert("No se pudo actualizar");
    }
  };

  // — Eliminar alumno —
  const handleDeleteAlumno = async () => {
    if (!window.confirm("¿Eliminar este alumno?")) return;
    try {
      await axios.delete(`${baseUrl}/alumnos/${editingAlumno.id}`);
      fetchAlumnos();
      setEditingAlumno(null);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("No se pudo eliminar");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Gestión de Alumnos</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar alumno..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
      />

      {/* Formulario de creación */}
      <form onSubmit={handleSubmit} className="space-y-2 bg-gray-800 p-4 rounded mb-6">
        <input
          type="text"
          name="nombreCompleto"
          placeholder="Nombre Completo"
          value={form.nombreCompleto}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <select
          name="tallerId"
          value={form.tallerId}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        >
          <option value="">Seleccionar Taller</option>
          {talleres.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
        >
          Agregar Alumno
        </button>
      </form>

      {/* Listado agrupado por taller */}
      <div>
        {talleres.map((t) => (
          <div key={t.id} className="mb-6">
            <h2 className="text-lg font-semibold text-blue-300">{t.nombre}</h2>
            <ul className="space-y-2">
              {filteredAlumnos
                .filter((a) => a.talleres.includes(t.id))
                .map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between bg-gray-700 p-2 rounded"
                  >
                    <span>{a.nombre} {a.apellidos}</span>
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-yellow-400 hover:text-yellow-600"
                    >
                      Editar
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {editingAlumno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Alumno</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                type="text"
                name="nombreCompleto"
                placeholder="Nombre Completo"
                value={editForm.nombreCompleto}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={editForm.direccion}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={editForm.telefono}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAlumno(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
            <hr className="my-4 border-gray-600" />
            <button
              onClick={handleDeleteAlumno}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
              Eliminar Alumno
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
