import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingNombre, setEditingNombre] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTalleres();
  }, []);

  const fetchTalleres = async () => {
    const res = await axios.get(`${baseUrl}/talleres`);
    setTalleres(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;
    await axios.post(`${baseUrl}/talleres`, { nombre: nombreNuevo });
    setNombreNuevo('');
    fetchTalleres();
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditingNombre(t.nombre);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingNombre('');
  };

  const handleUpdate = async () => {
    if (!editingNombre.trim()) return;
    await axios.put(`${baseUrl}/talleres/${editingId}`, { nombre: editingNombre });
    cancelEdit();
    fetchTalleres();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este taller?')) return;
    await axios.delete(`${baseUrl}/talleres/${id}`);
    fetchTalleres();
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Gestión de Talleres</h1>

      {/* — FORMULARIO CREAR — */}
      <form onSubmit={handleCreate} className="mb-6 bg-gray-800 p-4 rounded space-y-2">
        <input
          type="text"
          placeholder="Nuevo Taller"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-green-600 hover:bg-green-700"
        >
          Agregar Taller
        </button>
      </form>

      {/* — LISTADO y EDICIÓN — */}
      <div className="space-y-4">
        {talleres.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-gray-800 p-3 rounded"
          >
            {editingId === t.id ? (
              <>
                <input
                  type="text"
                  value={editingNombre}
                  onChange={(e) => setEditingNombre(e.target.value)}
                  className="flex-1 p-2 rounded bg-gray-700 text-white mr-2"
                />
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 mr-2"
                >
                  Guardar
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{t.nombre}</span>
                <button
                  onClick={() => startEdit(t)}
                  className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
