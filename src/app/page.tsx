import Link from "next/link";
import { ArrowRight, QrCode, Store, Sparkles, Palette } from "lucide-react";
import { HomeNavbar } from "@/components/ui/HomeNavbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-indigo-500/30 relative">
      {/* Background Watermark */}
      <div className="fixed inset-0 flex items-start pt-32 md:pt-0 md:items-center justify-center pointer-events-none z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mambaqr.png" alt="" className="w-[600px] opacity-[0.15] object-contain" />
      </div>

      <HomeNavbar />

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Experiencia de 5 estrellas en cada mesa</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Crea tu Menú Digital <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              con Inteligencia Artificial
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Convierte tu carta física en un menú QR al instante. Nuestra IA extrae tus platos y precios automáticamente para que no tengas que cargar nada a mano.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
            >
              Comenzar gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="max-w-6xl mx-auto mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-indigo-400" />}
            title="Administración con IA"
            description="Olvídate de la carga manual. Sube una foto de tu menú físico o un PDF y nuestra Inteligencia Artificial detectará categorías, productos y precios por ti en segundos."
          />
          <FeatureCard
            icon={<QrCode className="w-6 h-6 text-cyan-400" />}
            title="Experiencia de Usuario Premium"
            description="Tus clientes navegarán por un menú rápido, fluido y sin fricciones. Sin descargas molestas ni registros: escanean el QR y descubren tus platos al instante."
          />
          <FeatureCard
            icon={<Store className="w-6 h-6 text-emerald-400" />}
            title="Control Total en Tiempo Real"
            description="Mantén a tus comensales siempre informados. Oculta platos agotados o ajusta precios de manera instantánea, sin tener que imprimir nuevos códigos QR."
          />
          <FeatureCard
            icon={<Palette className="w-6 h-6 text-pink-400" />}
            title="Personalización a tu Medida"
            description="Adapta el diseño de tu carta a la identidad visual de tu marca desde el panel de control. Cambia colores, tipografías y el estilo en tiempo real."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
