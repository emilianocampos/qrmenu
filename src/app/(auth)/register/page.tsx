import { signup } from "@/actions/auth";
import Link from "next/link";
import { Store } from "lucide-react";

export default async function RegisterPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md my-8">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Store className="w-6 h-6 text-indigo-400" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">Crea tu Carta Digital</h2>
      <p className="text-gray-400 text-center mb-8">Completa tus datos para comenzar</p>

      <form action={signup} className="flex flex-col gap-4">
        {searchParams?.message && (
          <p className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
            {searchParams.message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300" htmlFor="name">Tu Nombre</label>
          <input
            className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
            name="name"
            placeholder="Ej. Juan Pérez"
            required
            type="text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300" htmlFor="email">Email</label>
          <input
            className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
            name="email"
            placeholder="tu@correo.com"
            required
            type="email"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300" htmlFor="password">Contraseña</label>
          <input
            className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
            name="password"
            placeholder="••••••••"
            required
            type="password"
            minLength={6}
          />
        </div>

        <hr className="border-white/10 my-2" />
        <p className="text-sm font-medium text-indigo-300 mb-2">Datos del Negocio</p>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300" htmlFor="businessName">Nombre del Negocio</label>
          <input
            className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
            name="businessName"
            placeholder="Ej. Café Aurora"
            required
            type="text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300" htmlFor="slug">Enlace (URL) de tu carta</label>
          <div className="flex items-center">
            <span className="px-4 py-3 bg-black/40 border border-white/10 rounded-l-xl text-gray-500 text-sm border-r-0">carta.qr/</span>
            <input
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-r-xl focus:outline-none focus:border-indigo-500 transition-colors"
              name="slug"
              placeholder="cafe-aurora"
              pattern="^[a-z0-9-]+$"
              title="Solo minúsculas, números y guiones"
              required
              type="text"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300" htmlFor="colorPrimary">Color Principal</label>
            <input
              className="w-full h-12 p-1 bg-black/20 border border-white/10 rounded-xl focus:outline-none cursor-pointer"
              name="colorPrimary"
              defaultValue="#4f46e5"
              type="color"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300" htmlFor="colorSecondary">Color Secundario</label>
            <input
              className="w-full h-12 p-1 bg-black/20 border border-white/10 rounded-xl focus:outline-none cursor-pointer"
              name="colorSecondary"
              defaultValue="#ffffff"
              type="color"
            />
          </div>
        </div>

        <button
          className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          type="submit"
        >
          Crear Cuenta y Negocio
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
