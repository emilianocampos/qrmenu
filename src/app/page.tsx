import Link from "next/link";
import { ArrowRight, QrCode, Sparkles, Palette, Utensils, Bell, Gift, Box, Layers } from "lucide-react";
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
      <main className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Experiencia gastronómica interactiva y moderna</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Crea tu Menú Digital <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              con Inteligencia Artificial
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transforma tu carta en un motor de pedidos, fidelización y ventas. Conectá la mesa con la cocina al instante y gestioná todo desde un único lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
            >
              Comenzar gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="max-w-7xl mx-auto mt-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Todo lo que tu restaurante necesita
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Funcionalidades pensadas exclusivamente para acelerar la rotación de mesas, reducir costos y enamorar a tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              badge="Inteligencia Artificial"
              badgeColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              icon={<Sparkles className="w-6 h-6 text-indigo-400" />}
              title="Carga con IA (Foto, PDF o Excel)"
              description="Olvídate de cargar plato por plato a mano. Subí una foto de tu carta en papel, un PDF o una planilla de Excel y nuestra IA extrae títulos, ingredientes y precios en segundos."
            />

            <FeatureCard
              badge="Autogestión"
              badgeColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
              icon={<Utensils className="w-6 h-6 text-cyan-400" />}
              title="Pedidos desde la Mesa"
              description="Tus comensales exploran la carta, eligen variantes, agregan observaciones y envían su orden en tiempo real directo a cocina, con seguimiento en vivo del estado del plato."
            />

            <FeatureCard
              badge="Atención al Cliente"
              badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
              icon={<Bell className="w-6 h-6 text-amber-400" />}
              title="Llamada al Mozo y Pedir Cuenta"
              description="Un botón accesible en la carta para solicitar asistencia a la mesa o pedir la adición, emitiendo alertas sonoras instantáneas al personal de salón y administración."
            />

            <FeatureCard
              badge="Identidad de Marca"
              badgeColor="bg-pink-500/10 text-pink-400 border-pink-500/20"
              icon={<Palette className="w-6 h-6 text-pink-400" />}
              title="100% Diseño Personalizable"
              description="Adaptá la experiencia a tu estética: paleta de colores personalizada, fuentes tipográficas, logos, imágenes de portada y estilos de carta (Grid moderno, Lista ágil y modo Vintage)."
            />

            <FeatureCard
              badge="Fidelización & Ventas"
              badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<Gift className="w-6 h-6 text-emerald-400" />}
              title="Fidelidad, Promos y Google Reviews"
              description="Pasaporte de sellos digitales para premiar visitas frecuentes, pop-ups de promociones especiales y redirección inteligente para disparar tus reseñas 5 estrellas en Google Maps."
            />

            <FeatureCard
              badge="Experiencia Inmersiva"
              badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<Box className="w-6 h-6 text-purple-400" />}
              title="Realidad Aumentada (Modelos 3D)"
              description="Permití que tus comensales proyecten modelos 3D realistas de tus platos y tragos directamente sobre su mesa con la cámara del celular antes de ordenar."
            />

            <div className="md:col-span-2 lg:col-span-3">
              <FeatureCard
                badge="Gestión Integrada"
                badgeColor="bg-sky-500/10 text-sky-400 border-sky-500/20"
                icon={<Layers className="w-6 h-6 text-sky-400" />}
                title="Integración con Fudo y MaxiREST"
                description="Conectá tu carta digital con los software gastronómicos líderes del sector para sincronizar automáticamente el menú, enviar comandas directas y centralizar la facturación de tu negocio."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-full group hover:-translate-y-1 shadow-lg shadow-black/20">
      <div>
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {badge && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeColor || 'bg-white/5 text-gray-300 border-white/10'}`}>
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
