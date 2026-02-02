import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarNavItem({ to, icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 ease-in-out group ${
          isActive
            ? 'bg-green-50 text-green-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1 hover:scale-[1.02]'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {children}
    </NavLink>
  );
}
