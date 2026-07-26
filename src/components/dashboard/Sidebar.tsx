'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
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
  { id: 'tour-dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-indigo-400', exact: true },
  { id: 'tour-productos', href: '/productos', icon: Package, label: 'Productos', color: 'text-blue-400' },
  { id: 'tour-categorias', href: '/categorias', icon: Tags, label: 'Categorías', color: 'text-violet-400' },
  { divider: true },
  { id: 'tour-importar', href: '/importar', icon: Sparkles, label: 'Importar Carta', color: 'text-cyan-400' },
  { id: 'tour-personalizacion', href: '/personalizacion', icon: Palette, label: 'Personalización', color: 'text-pink-400' },
  { divider: true },
  { id: 'tour-qr', href: '/qr', icon: QrCode, label: 'QR', color: 'text-amber-400' },
  { id: 'tour-configuracion', href: '/configuracion', icon: Settings, label: 'Configuración', color: 'text-gray-400' },
];

type NavItem = {
  id?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  color?: string;
  divider?: boolean;
};

function NavItem({ id, href, icon: Icon, label, color, active, onClick }: NavItem & { active?: boolean, onClick?: () => void }) {
  if (!href || !Icon) return null;
  return (
    <Link
      id={id}
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

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour && business) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setMobileOpen(true);
      }

      const timer = setTimeout(() => {
        const tourDriver = driver({
          showProgress: true,
          nextBtnText: 'Siguiente',
          prevBtnText: 'Anterior',
          doneBtnText: 'Terminar tutorial',
          allowClose: false,
          popoverClass: 'driverjs-theme',
          onDestroyStarted: () => {
            tourDriver.destroy();
            localStorage.setItem('hasSeenDashboardTour', 'true');
            if (isMobile) setMobileOpen(false);
          }
        });

        tourDriver.setSteps([
          { element: '#tour-dashboard', popover: { title: 'Dashboard', description: 'Aquí puedes ver las estadísticas generales y el rendimiento de tu carta digital.', side: 'right' } },
          { element: '#tour-productos', popover: { title: 'Productos', description: 'Añade, edita y organiza todos los platos y bebidas de tu menú.', side: 'right' } },
          { element: '#tour-categorias', popover: { title: 'Categorías', description: 'Agrupa tus productos en categorías como "Bebidas", "Postres", etc.', side: 'right' } },
          { element: '#tour-importar', popover: { title: 'Importar Carta', description: 'Sube una foto o PDF de tu menú físico y nuestra Inteligencia Artificial lo convertirá en digital al instante.', side: 'right' } },
          { element: '#tour-personalizacion', popover: { title: 'Personalización', description: 'Cambia colores, tipografías y el diseño general para que coincida con la identidad de tu marca.', side: 'right' } },
          { element: '#tour-qr', popover: { title: 'Tu Código QR', description: 'Descarga tu código QR listo para imprimir y colocar en las mesas o mostrador.', side: 'right' } },
          { element: '#tour-configuracion', popover: { title: 'Configuración', description: 'Modifica el nombre de tu negocio, tu dirección de enlace (URL) y los datos de tu cuenta.', side: 'right' } }
        ]);

        tourDriver.drive();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [business]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center gap-5 border-b border-white/8">
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0 mx-2">
          <QrCode className="absolute inset-0 m-auto w-10 h-10 text-indigo-500/30 rotate-45" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mambaqr.png" alt="MambaQR" className="w-20 h-20 object-contain drop-shadow-md z-10 relative" />
        </div>
        <div>
          <p className="font-bold text-xl text-white leading-none">MambaQR</p>
          {business && (
            <p className="text-sm text-gray-500 mt-1 truncate max-w-[130px]">{business.name}</p>
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
        id="hamburger-menu-btn"
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
