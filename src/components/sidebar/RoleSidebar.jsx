import React from 'react';
import { Link } from 'react-router-dom';

export default function RoleSidebar({ brand, navItems, footer }) {
  return (
    <div className="w-72 bg-white h-screen flex flex-col border-r border-gray-100 fixed left-0 top-0 z-50">
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
         <img src={brand.logoSrc} alt={brand.logoAlt} className="h-8 w-8 mr-3" />
         <span className="font-bold text-xl text-gray-900">{brand.title}</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems}
      </nav>
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {footer}
      </div>
    </div>
  );
}
