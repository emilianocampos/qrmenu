import Link from "next/link";
import { ArrowRight, QrCode, Store, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl tracking-tight">
            <QrCode className="w-6 h-6 text-indigo-400" />
            Carta QR
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/demo" className="text-gray-400 hover:text-white transition-colors hidden sm:block">
              Ver Demo
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link 
              href="/register" 
              className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>El futuro de los menús para restaurantes</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Cartas digitales <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              hermosas y al instante
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Crea el menú de tu cafetería o restaurante en minutos. 
            Tus clientes solo tendrán que escanear un código QR. 
            Sin descargar apps, sin registrarse.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
            >
              Comenzar gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/demo" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full font-medium transition-all"
            >
              <Store className="w-4 h-4" />
              Probar Demo
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="max-w-6xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<QrCode className="w-6 h-6 text-indigo-400" />}
            title="QR Permanente"
            description="Imprime tu código QR una sola vez. Cambia tus precios y productos cuando quieras sin tener que volver a imprimir."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-cyan-400" />}
            title="Importación con IA"
            description="¿Tienes un PDF o foto de tu menú? Súbelo y nuestra Inteligencia Artificial extraerá todos los productos mágicamente."
          />
          <FeatureCard 
            icon={<Store className="w-6 h-6 text-emerald-400" />}
            title="Diseño Premium"
            description="Personaliza colores, tipografías y logos. Ofrece a tus clientes una experiencia visual de alta calidad."
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
