import { useEffect, useState } from "react";
import axios from "axios";

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    direccion: "",
    telefono: "",
    tallerId: "",
  });

  useEffect(() => {
    fetchAlumnos();
    fetchTalleres();
  }, []);

  const fetchAlumnos = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/alumnos`);
    setAlumnos(res.data);
  };

  const fetchTalleres = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/talleres`);
    setTalleres(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${import.meta.env.VITE_API_URL}/alumnos`, form);
    setForm({ nombre: "", apellidos: "", direccion: "", telefono: "", tallerId: "" });
    fetchAlumnos();
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Gestión de Alumnos</h1>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="space-y-2 bg-gray-800 p-4 rounded">
        <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" required />
        <input type="text" name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" required />
        <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
        <input type="text" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" />
        
        <select name="tallerId" value={form.tallerId} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 text-white" required>
          <option value="">Seleccionar Taller</option>
          {talleres.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full">Agregar Alumno</button>
      </form>

      {/* LISTADO */}
      <div className="mt-6">
        {talleres.map((t) => (
          <div key={t.id} className="mb-6">
            <h2 className="text-lg font-semibold text-blue-300">{t.nombre}</h2>
            <ul className="ml-4 mt-2 list-disc">
              {alumnos
                .filter((a) => a.talleres.includes(t.id))
                .map((a) => (
                  <li key={a.id}>{a.nombre} {a.apellidos}</li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
