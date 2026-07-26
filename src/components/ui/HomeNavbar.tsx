import Link from "next/link";
import { QrCode } from "lucide-react";

export function HomeNavbar() {
  return (
    <nav className="fixed top-0 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 md:gap-6 font-semibold text-xl md:text-2xl tracking-tight hover:opacity-80 transition-opacity">
          <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center shrink-0">
            <QrCode className="absolute inset-0 m-auto w-8 h-8 md:w-12 md:h-12 text-indigo-500/30 rotate-45" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mambaqr.png" alt="MambaQR" className="w-16 h-16 md:w-24 md:h-24 object-contain z-10 relative drop-shadow-md" />
          </div>
          MambaQR
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="bg-white text-black px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:bg-gray-200 transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
