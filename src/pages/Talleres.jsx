// src/pages/Talleres.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTaller, setEditingTaller] = useState(null);
  const [editNombre, setEditNombre] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL;

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

  // Crear nuevo taller
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;
    try {
      await axios.post(`${baseUrl}/talleres`, { nombre: nombreNuevo.trim() });
      setNombreNuevo('');
      fetchTalleres();
    } catch (err) {
      console.error('Error creando taller:', err);
      alert('No se pudo crear el taller');
    }
  };

  // Filtrar según buscador
  const filtered = talleres.filter(t =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Iniciar edición
  const startEdit = (t) => {
    setEditingTaller(t);
    setEditNombre(t.nombre);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingTaller(null);
    setEditNombre('');
  };

  // Guardar cambios
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editNombre.trim()) return;
    try {
      await axios.put(`${baseUrl}/talleres/${editingTaller.id}`, { nombre: editNombre.trim() });
      fetchTalleres();
      cancelEdit();
    } catch (err) {
      console.error('Error actualizando taller:', err);
      alert('No se pudo actualizar');
    }
  };

  // Eliminar taller
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este taller?')) return;
    try {
      await axios.delete(`${baseUrl}/talleres/${id}`);
      fetchTalleres();
    } catch (err) {
      console.error('Error eliminando taller:', err);
      alert('No se pudo eliminar');
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Gestión de Talleres</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar taller..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
      />

      {/* Formulario de creación */}
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

      {/* Listado filtrado */}
      <div className="space-y-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-gray-800 p-3 rounded"
          >
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
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {editingTaller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Editar Taller</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
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
