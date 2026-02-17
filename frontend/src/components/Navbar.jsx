import { NavLink } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  return (
    <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="font-bold text-lg">🔐 Time-Lock Storage</h1>

      <div className="flex gap-6 items-center">
        <NavLink to="/" className="hover:text-indigo-400">
          Dashboard
        </NavLink>
        <NavLink to="/profile" className="hover:text-indigo-400">
          Profile
        </NavLink>
        <NavLink to="/plans" className="hover:text-indigo-400">
          Plans
        </NavLink>

        <button
          onClick={onLogout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
