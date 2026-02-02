import React from 'react';

export default function PageHeader({ title, description, className }) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
    </div>
  );
}
