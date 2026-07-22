'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  Sparkles,
  Palette,
  BarChart3,
  Settings,
  LogOut,
  QrCode,
  Store,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { Business } from '@/types';

interface SidebarProps {
  business: Business | null;
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-indigo-400', exact: true },
  { href: '/productos', icon: Package, label: 'Productos', color: 'text-blue-400' },
  { href: '/categorias', icon: Tags, label: 'Categorías', color: 'text-violet-400' },
  { divider: true },
  { href: '/importar', icon: Sparkles, label: 'Importar Carta', color: 'text-cyan-400' },
  { href: '/personalizacion', icon: Palette, label: 'Personalización', color: 'text-pink-400' },
  { href: '/estadisticas', icon: BarChart3, label: 'Estadísticas', color: 'text-emerald-400' },
  { divider: true },
  { href: '/qr', icon: QrCode, label: 'QR', color: 'text-amber-400' },
  { href: '/configuracion', icon: Settings, label: 'Configuración', color: 'text-gray-400' },
];

type NavItem = {
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  color?: string;
  divider?: boolean;
};

function NavItem({ href, icon: Icon, label, color, active, onClick }: NavItem & { active?: boolean, onClick?: () => void }) {
  if (!href || !Icon) return null;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
        ${active
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${color} ${!active ? 'opacity-70 group-hover:opacity-100' : ''}`} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="w-3 h-3 text-white/40" />}
    </Link>
  );
}

export function Sidebar({ business }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-white/8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <QrCode className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-none">Carta QR</p>
          {business && (
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[130px]">{business.name}</p>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {business ? (
          navItems.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} className="my-2 border-t border-white/5" />;
            }
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href!);

            return (
              <NavItem
                key={item.href}
                {...item}
                active={isActive}
                onClick={() => setMobileOpen(false)}
              />
            );
          })
        ) : (
          <NavItem
            href="/"
            icon={Store}
            label="Crear mi Carta"
            color="text-indigo-400"
            active
            onClick={() => setMobileOpen(false)}
          />
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/8">
        {business && (
          <a
            href={`/c/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400
                       hover:text-white hover:bg-white/5 transition-all mb-1 group"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
            </div>
            <span className="flex-1 truncate">Ver carta pública</span>
          </a>
        )}
        <form action={logout}>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400
                              hover:text-white hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white/10 border border-white/10
                   flex items-center justify-center text-white hover:bg-white/15 transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`md:hidden fixed left-0 top-0 h-full w-64 bg-[#0d0d0d] border-r border-white/8 z-40
                          transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-white/8 bg-[#0d0d0d] sticky top-0 h-screen flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
