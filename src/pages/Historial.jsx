import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Historial() {
  const [talleres, setTalleres] = useState([]);
  const [tallerId, setTallerId] = useState('');
  const [mes, setMes]       = useState(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [data, setData]     = useState({ columns: [], rows: [], totals: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // 1) Carga tus talleres
    axios.get(`${baseUrl}/talleres`)
      .then(res => setTalleres(res.data))
      .catch(e => console.error(e));
  }, []);

  // 2) Sólo llamar loadMonthData cuando ya tenga tallerId, mes y la lista de talleres cargada
  useEffect(() => {
    if (tallerId && mes && talleres.length > 0) {
      loadMonthData();
    }
  }, [tallerId, mes, talleres]);

  async function loadMonthData() {
    setLoading(true);
    setError(null);

    try {
      // Fecha, días del mes
      const [year, monthNum] = mes.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();

      // 1) Generar todas las fechas del mes
      const allDates = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        return `${mes}-${String(d).padStart(2, '0')}`;
      });

      // 2) Tomar la configuración de días del taller
      const taller = talleres.find(t => t.id === Number(tallerId));
      if (!taller) {
        // Si no lo encontró, vaciamos y salimos
        setData({ columns: [], rows: [], totals: { byRow: [], byCol: [] }});
        return;
      }
      // Asegurarnos de tener un array de strings
      const diasArray = Array.isArray(taller.dias)
        ? taller.dias
        : (taller.dias || '').split(',');

      // Mapa día → índice getDay()
      const diasMap = {
        'domingo':   0,
        'lunes':     1,
        'martes':    2,
        'miercoles': 3,
        'miércoles': 3,
        'jueves':    4,
        'viernes':   5,
        'sabado':    6,
        'sábado':    6
      };

      // 3) Convertir y filtrar sólo índices válidos
      const allowedNums = diasArray
        .map(d => d.trim().toLowerCase())
        .map(d => diasMap[d])
        .filter(n => typeof n === 'number');

      // 4) Filtrar allDates por esos días de la semana
      const dates = allDates.filter(fecha => {
      const [y, m, d] = fecha.split('-').map(Number);
      const dayNum = new Date(y, m - 1, d).getDay();
      return allowedNums.includes(dayNum);
      });

      // --- DEBUGGING OPCIONAL ---
      console.log({ diasArray, allowedNums, dates });

      // 5) Pedir asistencia sólo de esas fechas
      const requests = dates.map(fecha =>
        axios
          .get(`${baseUrl}/asistencias`, { params: { taller_id: tallerId, fecha } })
          .then(res => ({ fecha, lista: res.data }))
      );
      const results = await Promise.all(requests);

      // 6) Crear set de alumnos
      const alumnosMap = new Map();
      results.forEach(({ lista }) =>
        lista.forEach(r => {
          if (!alumnosMap.has(r.alumno_id)) {
            alumnosMap.set(r.alumno_id, {
              alumno_id: r.alumno_id,
              nombre:     r.nombre,
              apellidos:  r.apellidos
            });
          }
        })
      );

      // 7) Inicializar filas y rellenar presencias
      const rows = Array.from(alumnosMap.values()).map(a => ({
        ...a,
        presentMap: Object.fromEntries(dates.map(d => [d, false]))
      }));
      results.forEach(({ fecha, lista }) => {
        const presentes = new Set(lista.filter(r => r.presente).map(r => r.alumno_id));
        rows.forEach(row => {
          row.presentMap[fecha] = presentes.has(row.alumno_id);
        });
      });

      // 8) Totales
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
  }// ← Aquí cerramos loadMonthData

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Historial de Asistencia (mes completo)</h1>

      {/* Filtros */}
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
      {error && <div className="text-red-400">{error}</div>}

      {!loading && !error && data.columns.length > 0 && (
        <div className="overflow-x-auto bg-gray-800 rounded">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-2 py-1 sticky left-0 bg-gray-800">Alumno</th>
                {data.columns.map(fecha => {
                  // descomponemos "YYYY-MM-DD"
                  const [y, m, d] = fecha.split('-').map(Number);
                  const diaSemana = new Date(y, m - 1, d).getDay();
                  // nombres abreviados
                  const nombres = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
                  return (
                    <th key={fecha} className="px-2 py-1 text-center">
                      <div className="text-xs">{nombres[diaSemana]}</div>
                      <div className="text-sm">{String(d).padStart(2,'0')}</div>
                    </th>
                  );
                })}
                <th className="px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr key={row.alumno_id} className="border-b border-gray-700">
                  <td className="px-2 py-1 sticky left-0 bg-gray-800">
                    {row.nombre} {row.apellidos}
                  </td>
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
