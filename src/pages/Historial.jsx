// src/pages/Historial.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Historial() {
  const [talleres, setTalleres] = useState([]);
  const [tallerId, setTallerId] = useState('');
  const [mes, setMes] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [data, setData] = useState({ columns: [], rows: [], totals: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // cargar talleres
    axios.get(`${baseUrl}/talleres`)
      .then((res) => setTalleres(res.data))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!tallerId || !mes) return;
    loadMonthData();
  }, [tallerId, mes]);

  async function loadMonthData() {
    setLoading(true);
    setError(null);
    try {
      const [year, monthNum] = mes.split('-').map(Number);
      // cuántos días tiene este mes:
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      // lista de fechas "YYYY-MM-DD"
      const allDates = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        return `${mes}-${String(d).padStart(2, '0')}`;
      });

      // ——— FILTRO: quedarnos solo con los días del taller ——————————————————
      const taller = talleres.find(t => String(t.id) === tallerId);
      const diasArray = taller?.dias || []; // p.ej. ["Lunes","Miércoles"]
      // Mapa día -> número:
      const diasMap = {
        domingo: 0,
        lunes:   1,
        martes:  2,
        miercoles: 3, 'miércoles': 3,
        jueves:  4,
        viernes: 5,
        sabado:  6, 'sábado':   6
      };
      // Convertimos los días permitidos en índices:
      const allowedNums = diasArray
        .map(d => diasMap[d.toLowerCase()])
        .filter(n => n !== undefined);
      // Filtramos las fechas por su getDay():
      const dates = allDates.filter(fecha => 
        allowedNums.includes(new Date(fecha).getDay())
      );
      // ———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

      // Para cada fecha pedimos la asistencia
      const requests = dates.map((fecha) =>
        axios.get(`${baseUrl}/asistencias`, {
          params: { taller_id: tallerId, fecha }
        }).then(res => ({ fecha, lista: res.data }))
      );

      const results = await Promise.all(requests);

      // Construir set de alumnos únicos
      const alumnosMap = new Map();
      results.forEach(({ lista }) => {
        lista.forEach(r => {
          if (!alumnosMap.has(r.alumno_id)) {
            alumnosMap.set(r.alumno_id, {
              alumno_id: r.alumno_id,
              nombre: r.nombre,
              apellidos: r.apellidos
            });
          }
        });
      });

      // inicializar rows
      const rows = Array.from(alumnosMap.values()).map(a => ({
        ...a,
        presentMap: Object.fromEntries(dates.map(d => [d, false]))
      }));

      // llenar presentMap
      results.forEach(({ fecha, lista }) => {
        const presenteIds = new Set(lista.filter(r => r.presente).map(r => r.alumno_id));
        rows.forEach(row => {
          row.presentMap[fecha] = presenteIds.has(row.alumno_id);
        });
      });

      // total por fila y total por columna
      const totals = {
        byRow: rows.map(row =>
          Object.values(row.presentMap).filter(v => v).length
        ),
        byCol: dates.map(col =>
          rows.filter(row => row.presentMap[col]).length
        )
      };

      setData({ columns: dates, rows, totals });
    } catch (e) {
      console.error(e);
      setError('Falló al cargar historial');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Historial de Asistencia (mes completo)</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={tallerId}
          onChange={e => setTallerId(e.target.value)}
        >
          <option value="">Seleccionar Taller</option>
          {talleres.map(t => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>

        <input
          type="month"
          className="p-2 rounded bg-gray-700 text-white"
          value={mes}
          onChange={e => setMes(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}

      {error && (
        <div className="text-red-400">{error}</div>
      )}

      {!loading && !error && data.columns.length > 0 && (
        <div className="overflow-x-auto bg-gray-800 rounded">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-2 py-1 sticky left-0 bg-gray-800">Alumno</th>
                {data.columns.map(fecha => {
                  const day = fecha.slice(-2);
                  return <th key={fecha} className="px-2 py-1">{day}</th>;
                })}
                <th className="px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr key={row.alumno_id} className="border-b border-gray-700">
                  <td className="px-2 py-1 sticky left-0 bg-gray-800">{row.nombre} {row.apellidos}</td>
                  {data.columns.map(col => (
                    <td key={col} className="px-2 py-1">
                      {row.presentMap[col] ? '✅' : ''}
                    </td>
                  ))}
                  <td className="px-2 py-1">{data.totals.byRow[idx]}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700">
                <td className="px-2 py-1 sticky left-0 bg-gray-800">Total</td>
                {data.totals.byCol.map((cnt, i) => (
                  <td key={i} className="px-2 py-1 font-semibold">{cnt}</td>
                ))}
                <td className="px-2 py-1"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!loading && !error && data.columns.length === 0 && tallerId && (
        <div className="text-gray-400">No hay registros para este mes.</div>
      )}
    </div>
  );
}
