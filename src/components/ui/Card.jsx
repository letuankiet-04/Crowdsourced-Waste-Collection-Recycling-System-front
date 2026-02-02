import React from 'react';

export function Card({ children, className, as: Component = 'div' }) {
  return (
    <Component className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg ${className || ''}`}>
      {children}
    </Component>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={`border-b border-gray-100 ${className || ''}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={`font-semibold text-gray-900 ${className || ''}`}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
