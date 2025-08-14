import React from 'react';
import { NavLink } from 'react-router-dom';

export const Navigation: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b shadow-sm px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
              isActive
                ? 'bg-gray-900 text-white shadow-md transform scale-105'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/popular"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
              isActive
                ? 'bg-gray-900 text-white shadow-md transform scale-105'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          Popular
        </NavLink>
        <NavLink
          to="/collections"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
              isActive
                ? 'bg-gray-900 text-white shadow-md transform scale-105'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          Collections
        </NavLink>
      </div>
    </nav>
  );
};
