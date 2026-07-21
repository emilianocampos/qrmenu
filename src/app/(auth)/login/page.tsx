import { login } from "@/actions/auth";
import Link from "next/link";
import { Store, QrCode } from "lucide-react";
import { ToastHelper } from "@/components/ui/ToastHelper";

export default async function LoginPage(props: { searchParams: Promise<{ message?: string; success?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <QrCode className="w-6 h-6 text-indigo-400" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">Bienvenido de nuevo</h2>
      <p className="text-gray-400 text-center mb-8">Ingresa a tu panel de administración</p>

      <form action={login} className="flex flex-col gap-4">
        {searchParams?.message && !searchParams?.success && (
          <p className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
            {searchParams.message}
          </p>
        )}
        {searchParams?.message && searchParams?.success && (
          <ToastHelper message={searchParams.message} type="success" />
        )}

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
          />
        </div>

        <button
          className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          type="submit"
        >
          Iniciar Sesión
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Regístrate gratis
        </Link>
      </div>
    </div>
  );
}
