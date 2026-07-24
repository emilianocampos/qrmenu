import React from 'react';
import { getBusinesses } from '@/actions/super-admin/get-businesses';
import { StatsCards } from '@/components/super-admin/StatsCards';
import { BusinessTable } from '@/components/super-admin/BusinessTable';
import { Shield, LayoutDashboard, Store, LogOut } from 'lucide-react';
import { logoutSuperAdmin } from '@/actions/super-admin/auth';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
  const { businesses } = await getBusinesses();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#111827] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Super Admin</h1>
            <p className="text-xs text-gray-400">Panel de Control</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="px-4 py-3 rounded-xl bg-white/5 text-gray-400 flex items-center gap-3 cursor-not-allowed opacity-50">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center gap-3">
            <Store className="w-5 h-5" />
            <span className="font-medium">Negocios</span>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutSuperAdmin}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Negocios</h2>
            <p className="text-gray-400 mt-1">Administra el acceso a la plataforma para todos los clientes.</p>
          </div>
          
          <form action={logoutSuperAdmin} className="md:hidden">
            <button type="submit" className="text-red-400 p-2 bg-white/5 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </header>

        <StatsCards businesses={businesses || []} />
        <BusinessTable businesses={businesses || []} />
      </main>
    </div>
  );
}
