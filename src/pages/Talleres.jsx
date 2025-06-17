// src/pages/Talleres.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Talleres() {
  const [talleres, setTalleres]       = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [diasNuevo, setDiasNuevo]     = useState([]);
  const [editing, setEditing]         = useState(null);
  const [editNombre, setEditNombre]   = useState('');
  const [diasEdit, setDiasEdit]       = useState([]);

  const baseUrl = import.meta.env.VITE_API_URL;
  const weekdays = [
    'Lunes','Martes','Miércoles',
    'Jueves','Viernes','Sábado','Domingo'
  ];

  useEffect(() => {
    fetchTalleres();
  }, []);

  const fetchTalleres = async () => {
    try {
      const res = await axios.get(`${baseUrl}/talleres`);
      setTalleres(res.data);
    } catch (err) {
      console.error('Error al cargar talleres:', err);
    }
  };

  // — Crear —
  const toggleDiaNuevo = (day) => {
    setDiasNuevo(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;
    try {
      await axios.post(`${baseUrl}/talleres`, {
        nombre: nombreNuevo.trim(),
        dias: diasNuevo
      });
      setNombreNuevo('');
      setDiasNuevo([]);
      fetchTalleres();
    } catch {
      alert('Error creando taller');
    }
  };

  // — Editar —
  const startEdit = (t) => {
    setEditing(t);
    setEditNombre(t.nombre);
    setDiasEdit(t.dias || []);
  };
  const toggleDiaEdit = (day) => {
    setDiasEdit(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editNombre.trim()) return;
    try {
      await axios.put(`${baseUrl}/talleres/${editing.id}`, {
        nombre: editNombre.trim(),
        dias: diasEdit
      });
      fetchTalleres();
      cancelEdit();
    } catch {
      alert('Error actualizando taller');
    }
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditNombre('');
    setDiasEdit([]);
  };

  // — Eliminar —
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este taller?')) return;
    try {
      await axios.delete(`${baseUrl}/talleres/${id}`);
      fetchTalleres();
    } catch {
      alert('Error eliminando taller');
    }
  };

  // Filtrado
  const filtered = talleres.filter(t =>
    t.nombre.toLowerCase()
     .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Gestión de Talleres</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar taller..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
      />

      {/* Crear */}
      <form onSubmit={handleCreate}
            className="mb-6 bg-gray-800 p-4 rounded space-y-2">
        <input
          type="text"
          placeholder="Nuevo Taller"
          value={nombreNuevo}
          onChange={e => setNombreNuevo(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />

        <div className="grid grid-cols-4 gap-2">
          {weekdays.map(day => (
            <label key={day} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={diasNuevo.includes(day)}
                onChange={() => toggleDiaNuevo(day)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <span>{day.slice(0,3)}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded bg-green-600 hover:bg-green-700"
        >
          Agregar Taller
        </button>
      </form>

      {/* Listado */}
      <div className="space-y-4">
        {filtered.map(t => (
          <div key={t.id}
               className="flex items-center justify-between bg-gray-800 p-3 rounded">
            <div>
              <strong>{t.nombre}</strong>
              <div className="text-gray-400 text-sm">
                { (t.dias||[]).join(', ') || '—' }
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => startEdit(t)}
                className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Editar */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Editar Taller</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                value={editNombre}
                onChange={e => setEditNombre(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />

              <div className="grid grid-cols-4 gap-2">
                {weekdays.map(day => (
                  <label key={day} className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={diasEdit.includes(day)}
                      onChange={() => toggleDiaEdit(day)}
                      className="form-checkbox h-5 w-5 text-blue-400"
                    />
                    <span>{day.slice(0,3)}</span>
                  </label>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
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
