import { signup } from "@/actions/auth";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md my-8">
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <QrCode className="absolute inset-0 m-auto w-12 h-12 text-indigo-500/30 rotate-45" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mambaqr.png" alt="MambaQR" className="w-24 h-24 object-contain z-10 relative drop-shadow-md" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-2">Crea tu Carta Digital</h2>
      <p className="text-gray-400 text-center mb-8">Completa tus datos para comenzar</p>

      <RegisterForm signupAction={signup} serverError={searchParams?.message} />

      <div className="mt-8 text-center text-sm text-gray-400">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
