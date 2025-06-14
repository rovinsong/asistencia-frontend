import { useState } from "react";
import axios from "axios";
import Papa from "papaparse"; // asegúrate de instalar papaparse: npm install papaparse

export default function ImportarAlumnos() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL;

  // Maneja selección de archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview([]);
  };

  // Parsear CSV y mostrar preview
  const handlePreview = () => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data);
      },
      error: (err) => {
        console.error("Error parseando CSV:", err);
      }
    });
  };

  // Enviar datos al backend
  const handleUpload = async () => {
    if (!preview.length) return;
    setUploading(true);
    try {
      // Asumimos que el backend acepta POST /alumnos/bulk con array de alumnos [{ nombre, apellidos, direccion, telefono, tallerId }]
      await axios.post(`${baseUrl}/alumnos/bulk`, { alumnos: preview });
      alert("Alumnos importados correctamente");
      setFile(null);
      setPreview([]);
    } catch (error) {
      console.error(error);
      alert("Error al importar alumnos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Importar Alumnos desde CSV</h1>

      <div className="space-y-2 bg-gray-800 p-4 rounded">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full text-gray-300"
        />
        <button
          onClick={handlePreview}
          disabled={!file}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Ver Preview
        </button>
      </div>

      {preview.length > 0 && (
        <div className="mt-6 bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Vista Previa</h2>
          <div className="overflow-auto max-h-64">
            <table className="min-w-full table-auto text-gray-200">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((key) => (
                    <th key={key} className="px-2 py-1 border">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-700">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-2 py-1 border">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            {uploading ? "Importando..." : "Importar Alumnos"}
          </button>
        </div>
      )}
    </div>
  );
}
