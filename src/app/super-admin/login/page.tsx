'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { loginSuperAdmin } from '@/actions/super-admin/auth';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginSuperAdmin(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/super-admin/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">Super Admin</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">Acceso restringido</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email de administrador</label>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@ejemplo.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña maestra</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
