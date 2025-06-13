import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Historial() {
  const [talleres, setTalleres] = useState([]);
  const [tallerId, setTallerId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [alumnoFiltro, setAlumnoFiltro] = useState('');
  const [lista, setLista] = useState([]);

  const baseUrl = import.meta.env.VITE_API_URL;

  // Cargar talleres al montar
  useEffect(() => {
    axios.get(`${baseUrl}/talleres`).then((res) => setTalleres(res.data));
  }, []);

  // Cargar historial cuando cambian taller, fecha o filtro de alumno
  useEffect(() => {
    if (!tallerId) return;
    const params = { taller_id: tallerId, fecha };
    if (alumnoFiltro) params.alumno_id = alumnoFiltro;
    axios
      .get(`${baseUrl}/asistencias`, { params })
      .then((res) => setLista(res.data));
  }, [tallerId, fecha, alumnoFiltro]);

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Historial de Asistencia</h1>

      {/* Filtros: Taller, Fecha, Alumno */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={tallerId}
          onChange={(e) => setTallerId(e.target.value)}
        >
          <option value="">Seleccionar Taller</option>
          {talleres.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="p-2 rounded bg-gray-700 text-white"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <input
          type="number"
          placeholder="Filtrar por ID Alumno"
          className="p-2 rounded bg-gray-700 text-white"
          value={alumnoFiltro}
          onChange={(e) => setAlumnoFiltro(e.target.value)}
        />
      </div>

      {/* Tabla de resultados */}
      {tallerId && (
        <div className="bg-gray-800 rounded overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Alumno</th>
                <th className="px-4 py-2">Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => (
                <tr key={r.alumno_id} className="border-b border-gray-700">
                  <td className="px-4 py-2">{r.alumno_id}</td>
                  <td className="px-4 py-2">
                    {r.nombre} {r.apellidos}
                  </td>
                  <td className="px-4 py-2">
                    {r.presente ? '✅ Presente' : '❌ Ausente'}
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-center text-gray-400">
                    No hay registros para estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
