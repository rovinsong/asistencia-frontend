// src/pages/ExportAsistencia.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function ExportAsistencia() {
  const [talleres, setTalleres] = useState([]);
  const [tallerId, setTallerId] = useState('');
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const [alumnosFull, setAlumnosFull] = useState([]);
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Carga talleres y alumnos
    axios.get(`${baseUrl}/talleres`).then(res => setTalleres(res.data));
    axios.get(`${baseUrl}/alumnos`).then(res => setAlumnosFull(res.data));
  }, []);

  const handleExport = async () => {
    if (!tallerId || !mes) return;
    setLoading(true);
    try {
      // --- 1) Generar todas las fechas del mes ---
      const [year, monthNum] = mes.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const allDates = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        return `${mes}-${String(d).padStart(2, '0')}`;
      });

      // --- 2) Filtrar sólo días configurados en el taller ---
      const taller = talleres.find(t => t.id === Number(tallerId));
      const diasArray = Array.isArray(taller.dias) ? taller.dias : [];
      const diasMap = {
        domingo:   0,
        lunes:     1,
        martes:    2,
        miercoles: 3, 'miércoles': 3,
        jueves:    4,
        viernes:   5,
        sabado:    6, 'sábado':    6
      };
      const allowedNums = diasArray
        .map(d => diasMap[d.toLowerCase()])
        .filter(n => typeof n === 'number');

      const fechas = allDates.filter(fecha => {
        const [y, m, d] = fecha.split('-').map(Number);
        // Usamos year, monthIndex (m-1), day para evitar desfases
        const dayNum = new Date(y, m - 1, d).getDay();
        return allowedNums.includes(dayNum);
      });

      // --- 3) Obtener asistencias sólo para esas fechas ---
      const requests = fechas.map(fecha =>
        axios
          .get(`${baseUrl}/asistencias`, { params: { taller_id: tallerId, fecha } })
          .then(res => ({ fecha, lista: res.data }))
      );
      const results = await Promise.all(requests);

      // --- 4) Mapear alumnos y sus datos de contacto ---
      const mapa = new Map();
      results.forEach(({ lista }) =>
        lista.forEach(r => {
          if (!mapa.has(r.alumno_id)) {
            const info = alumnosFull.find(a => a.id === r.alumno_id) || {};
            mapa.set(r.alumno_id, {
              alumno_id: r.alumno_id,
              nombre:    r.nombre,
              apellidos: r.apellidos,
              direccion: info.direccion || '',
              telefono:  info.telefono || ''
            });
          }
        })
      );

      // 5) Preparar datos para Excel, usando solo el día (dos dígitos) como clave
      const days = fechas.map(f => f.slice(-2));  // ["02","04","09",...]
      const excelData = Array.from(mapa.values()).map(item => {
        const rec = {
          'Nombre': `${item.nombre} ${item.apellidos}`,
          'Dirección':       item.direccion,
          'Teléfono':        item.telefono,
        };
        fechas.forEach((fecha, i) => {
          const dayKey = days[i];
          const reg = results.find(r => r.fecha === fecha)
                            .lista.find(r => r.alumno_id === item.alumno_id);
          rec[dayKey] = reg && reg.presente ? 'P' : 'A';
        });
        return rec;
      });

      // 6) Generar y descargar Excel con cabecera “Número de día”
      const wb = XLSX.utils.book_new();
      const headers = ['Nombre Completo', 'Dirección', 'Teléfono', ...days];
      const ws = XLSX.utils.json_to_sheet(excelData, { header: headers });
      XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
      XLSX.writeFile(wb, `asistencia_${tallerId}_${mes}.xlsx`);
    } catch (e) {
      console.error(e);
      alert('Error al exportar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Exportar Asistencia</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
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
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        {loading ? 'Generando...' : 'Exportar a Excel'}
      </button>
    </div>
  );
}
