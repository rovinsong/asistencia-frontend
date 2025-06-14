import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const linkClass = (path) =>
    location.pathname === path
      ? "block py-2 px-3 text-blue-700 font-semibold"
      : "block py-2 px-3 text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white";

  return (
    <nav className="bg-white border-gray-200 dark:border-gray-600 dark:bg-gray-900">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo.svg" className="h-8" alt="AsistenciaApp Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            AsistenciaApp
          </span>
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="mega-menu-full"
          aria-expanded={menuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div
          id="mega-menu-full"
          className={`${menuOpen ? "block" : "hidden"} items-center justify-between font-medium w-full md:flex md:w-auto md:order-1`}
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link to="/" className={linkClass("/")}>Inicio</Link>
            </li>
            <li>
              <Link to="/alumnos" className={linkClass("/alumnos")}>Alumnos</Link>
            </li>
            <li>
              <Link to="/talleres" className={linkClass("/talleres")}>Talleres</Link>
            </li>
            <li>
              <Link to="/asistencia" className={linkClass("/asistencia")}>Asistencia</Link>
            </li>
            <li>
              <Link to="/historial" className={linkClass("/historial")}>Historial</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
