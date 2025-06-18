import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Inicio from "./pages/Inicio"
import Alumnos from "./pages/Alumnos"
import Talleres from "./pages/Talleres"
import Asistencia from "./pages/Asistencia"
import Historial from "./pages/Historial"
import ImportarAlumnos from "./pages/ImportarAlumnos"
import ExportAsistencia from './pages/Export';

export default function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/talleres" element={<Talleres />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/importar-alumnos" element={<ImportarAlumnos />} />
          <Route path="/export" element={<ExportAsistencia />} />
        </Routes>
      </div>
    </Router>
  )
}
