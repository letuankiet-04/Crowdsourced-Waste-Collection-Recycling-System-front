export default function CD_Footer({ portalName = "Citizen Portal" }) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between text-sm text-gray-400">
        
        {/* Left */}
        <span>
          © {year} {portalName}. All rights reserved.
        </span>

        {/* Right */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="hover:text-gray-600 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-gray-600 transition-colors"
          >
            Help Center
          </a>
          <a
            href="#"
            className="hover:text-gray-600 transition-colors"
          >
            Terms of Service
          </a>
        </div>

      </div>
    </footer>
  );
}
