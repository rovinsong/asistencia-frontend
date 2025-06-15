import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const linkClass = (path) =>
    location.pathname === path
      ? "block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-500 md:p-0"
      : "block py-2 pr-4 pl-3 text-gray-300 border-b border-gray-700 hover:bg-gray-700 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0";

  return (
    <nav className="bg-gray-800">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center">
          <img src="/icon.png" alt="Logo" className="h-16 w-16 mr-2" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            Asistencia App
          </span>
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
          className="inline-flex items-center p-3 ml-3 text-white bg-gray-700 rounded-md md:hidden hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
          aria-controls="navbar"
          aria-expanded={menuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div
          className={`${menuOpen ? "block" : "hidden"} w-full md:block md:w-auto`}
          id="navbar"
        >
          <ul className="flex flex-col md:flex-row md:space-x-8 mt-4 md:mt-0 md:text-sm md:font-medium">
            <li>
              <Link to="/" className={linkClass("/")}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/alumnos" className={linkClass("/alumnos")}>
                Alumnos
              </Link>
            </li>
            <li>
              <Link to="/talleres" className={linkClass("/talleres")}>
                Talleres
              </Link>
            </li>
            <li>
              <Link to="/asistencia" className={linkClass("/asistencia")}>
                Asistencia
              </Link>
            </li>
            <li>
              <Link to="/historial" className={linkClass("/historial")}>
                Historial
              </Link>
            </li>
            <li>
              <Link to="/importar-alumnos" className={linkClass("/importar-alumnos")}>
                Importar CSV
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
