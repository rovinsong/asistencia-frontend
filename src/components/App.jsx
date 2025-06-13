import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Inicio from "../pages/Inicio";
import Alumnos from "../pages/Alumnos";
import Talleres from "./pages/Talleres";
import Asistencia from "./pages/Asistencia";
import Historia from "./pages/Historia";

export default function App() {
  return (
    <Router>
      <div className="dark:bg-gray-900 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/talleres" element={<Talleres />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/historia" element={<Historia />} />
        </Routes>
      </div>
    </Router>
  );
}
