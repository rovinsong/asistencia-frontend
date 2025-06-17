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
  const [showModal, setShowModal] = useState(false);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreCompleto.trim() || !form.tallerId) return;
    // Dividir nombre completo
    const parts = form.nombreCompleto.trim().split(" ");
    const nombre = parts.shift();
    const apellidos = parts.join(" ");

    try {
      await axios.post(`${baseUrl}/alumnos`, {
        nombre,
        apellidos,
        direccion: form.direccion,
        telefono: form.telefono,
        tallerId: form.tallerId
      });
      // reset
      setForm({ nombreCompleto: "", direccion: "", telefono: "", tallerId: "" });
      setShowModal(false);
      fetchAlumnos();
    } catch (error) {
      console.error("Error al crear alumno:", error);
      alert("Error al crear alumno");
    }
  };

  const handleRemove = async (alumnoId, tallerId) => {
    if (!window.confirm("¿Eliminar este alumno de este taller?")) return;
    try {
      await axios.delete(`${baseUrl}/alumnos/${alumnoId}/talleres/${tallerId}`);
      fetchAlumnos();
    } catch (error) {
      console.error("Error al eliminar alumno:", error);
      alert("Error al eliminar alumno");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Gestión de Alumnos</h1>

      {/* LISTADO AGRUPADO POR TALLER */}
      <div className="mt-6">
        {talleres.map((t) => (
          <div key={t.id} className="mb-6">
            <h2 className="text-lg font-semibold text-blue-300">{t.nombre}</h2>
            <ul className="space-y-2">
              {alumnos
                .filter((a) => a.talleres.includes(t.id))
                .map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between bg-gray-700 p-2 rounded"
                  >
                    <span className="text-white">
                      {a.nombre} {a.apellidos}
                    </span>
                    <button
                      onClick={() => handleRemove(a.id, t.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Botón para abrir modal */}
      <div className="mt-8">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Agregar Alumno
        </button>
      </div>

      {/* Modal de Agregar Alumno */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Nuevo Alumno</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              <div className="flex justify-between space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
