import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Asistencia() {
  const [talleres, setTalleres] = useState([]);
  const [tallerId, setTallerId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [lista, setLista] = useState([]);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // cargar talleres
    axios.get(`${baseUrl}/talleres`)
      .then(res => setTalleres(res.data));
  }, []);

  // Cuando cambie taller o fecha, obtener asistencias
  useEffect(() => {
    if (!tallerId) return;
    axios.get(`${baseUrl}/asistencias`, {
      params: { taller_id: tallerId, fecha }
    }).then(res => setLista(res.data));
  }, [tallerId, fecha]);

  const togglePresente = (idx) => {
    const copia = [...lista];
    copia[idx].presente = !copia[idx].presente;
    setLista(copia);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      taller_id: parseInt(tallerId),
      fecha,
      asistencias: lista.map(item => ({
        alumno_id: item.alumno_id,
        presente: item.presente
      }))
    };
    await axios.post(`${baseUrl}/asistencias`, payload);
    alert('Asistencias registradas');
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Registro de Asistencia</h1>

      {/* Selección de taller y fecha */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-6">
        <select
          className="flex-1 p-2 rounded bg-gray-700 text-white"
          value={tallerId}
          onChange={e => setTallerId(e.target.value)}
        >
          <option value="">Seleccionar Taller</option>
          {talleres.map(t => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>

        <input
          type="date"
          className="p-2 rounded bg-gray-700 text-white"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </div>

      {/* Listado de alumnos con checkbox */}
      {tallerId && (
        <form onSubmit={handleSubmit} className="space-y-2">
          {lista.map((a, idx) => (
            <label
              key={a.alumno_id}
              className="flex items-center justify-between bg-gray-800 p-3 rounded"
            >
              <span>{a.nombre} {a.apellidos}</span>
              <input
                type="checkbox"
                checked={a.presente}
                onChange={() => togglePresente(idx)}
                className="w-6 h-6"
              />
            </label>
          ))}

          <button
            type="submit"
            className="mt-4 w-full py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Guardar Asistencia
          </button>
        </form>
      )}
    </div>
  );
}
