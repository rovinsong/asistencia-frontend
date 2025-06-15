import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Asegúrate de copiar tu spinner.gif en public/spinner.gif
export default function Asistencia() {
  const [talleres, setTalleres] = useState([]);
  const [selectedTaller, setSelectedTaller] = useState("");
  const getToday = () => new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(getToday());
  const [alumnos, setAlumnos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Cargar talleres al iniciar
    axios.get(`${baseUrl}/talleres`)
      .then(res => setTalleres(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // Al cambiar taller o fecha, recargar lista
    if (selectedTaller && fecha) {
      setMessage(null);
      axios.get(
        `${baseUrl}/asistencias?taller_id=${selectedTaller}&fecha=${fecha}`
      )
      .then(res => setAlumnos(res.data))
      .catch(err => {
        console.error(err.response?.data || err);
        setMessage({ type: 'error', text: 'Error al cargar la lista' });
      });
    } else {
      setAlumnos([]);
    }
  }, [selectedTaller, fecha]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const delay = new Promise(r => setTimeout(r, 2000));
    const payload = {
      taller_id: selectedTaller,
      fecha,
      asistencias: alumnos.map(a => ({ alumno_id: a.alumno_id, presente: a.presente }))
    };
    try {
      await Promise.all([
        axios.post(`${baseUrl}/asistencias`, payload),
        delay
      ]);
      // Redirigir a Historial mostrando taller y fecha
      navigate(`/historial?taller_id=${selectedTaller}&tallerId=${selectedTaller}&fecha=${fecha}`)
    } catch (error) {
      console.error(error.response?.data || error);
      const errorMsg = error.response?.data?.error || error.message;
      setMessage({ type: 'error', text: `Error al guardar: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  };

  const togglePresente = (id) => {
    setAlumnos(alumnos.map(a =>
      a.alumno_id === id ? { ...a, presente: !a.presente } : a
    ));
  };

  return (
    <div className="relative p-4 text-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">Registro de Asistencia</h1>

      {/* Controles principales (sin botón manual) */}
      <div className="flex flex-wrap items-center space-x-2 mb-4">
        <select
          value={selectedTaller}
          onChange={e => setSelectedTaller(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded w-40"
        >
          <option value="">Seleccionar Taller</option>
          {talleres.map(t => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>

        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded w-40"
        />
      </div>

      {/* Lista de alumnos */}
      {alumnos.length > 0 && (
        <>  
          <ul className="space-y-2">
            {alumnos.map(a => (
              <li key={a.alumno_id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                <span className="text-lg font-semibold">{a.nombre} {a.apellidos}</span>
                <input
                  type="checkbox"
                  checked={a.presente}
                  onChange={() => togglePresente(a.alumno_id)}
                  className="h-5 w-5 text-green-500"
                />
              </li>
            ))}
          </ul>

          {/* Botón Guardar */}
          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              {saving ? (
                <>
                  <img src="/spinner.gif" alt="Cargando..." className="h-6 w-6 mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Asistencia'
              )}
            </button>
          </div>

          {/* Mensaje de resultado */}
          {message && (
            <div className={`mt-2 p-2 rounded ${message.type === 'success' ? 'bg-green-700' : 'bg-red-700'}`}>
              {message.text}
            </div>
          )}
        </>
      )}

      {/* Overlay spinner con fondo difuminado */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <img src="/spinner.gif" alt="Cargando..." className="h-16 w-16" />
        </div>
      )}
    </div>
  );
}
