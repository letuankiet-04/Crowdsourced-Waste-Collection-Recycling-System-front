import React from 'react';

export default function RoleLayout({ sidebar, navbar, footer, children, showBackgroundEffects }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        {navbar}
        <main className="flex-1 p-6 relative">
             {showBackgroundEffects && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              </div>
             )}
            <div className="relative z-10">
                {children}
            </div>
        </main>
        {footer}
      </div>
    </div>
  );
}
