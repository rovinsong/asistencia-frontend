import { Link, useLocation } from "react-router-dom"

export default function Navbar() {
  const location = useLocation()
  const linkStyle = (path) =>
    location.pathname === path ? "text-blue-500 font-semibold" : "text-gray-300 hover:text-white"

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">Asistencia App</h1>
      <div className="flex space-x-4">
        <Link to="/" className={linkStyle("/")}>Inicio</Link>
        <Link to="/alumnos" className={linkStyle("/alumnos")}>Alumnos</Link>
        <Link to="/talleres" className={linkStyle("/talleres")}>Talleres</Link>
        <Link to="/asistencia" className={linkStyle("/asistencia")}>Asistencia</Link>
        <Link to="/historial" className={linkStyle("/historial")}>Historial</Link>
      </div>
    </nav>
  )
}
