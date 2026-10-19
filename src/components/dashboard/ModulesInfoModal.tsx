'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  X,
  Search,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  UtensilsCrossed,
  Award,
  Box,
  Sparkles,
  Palette,
  QrCode,
  Settings,
  Store,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Info
} from 'lucide-react';

export interface ModuleInfoItem {
  id: string;
  name: string;
  category: 'operacion' | 'menu' | 'salon' | 'diseno' | 'ajustes';
  categoryLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  borderColor: string;
  whatItContains: string[];
  whatItIsFor: string;
  highlightBadge?: string;
  isExternal?: boolean;
}

export const MODULES_INFO: ModuleInfoItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard / Métricas',
    category: 'operacion',
    categoryLabel: 'Operación & Ventas',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-indigo-400',
    bgLight: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    highlightBadge: 'Panel Principal',
    whatItContains: [
      'Resumen de visitas y aperturas de la carta en tiempo real.',
      'Cantidad de pedidos generados en el día.',
      'Platos más vistos y más populares entre tus clientes.',
      'Accesos directos a las tareas más frecuentes de tu negocio.'
    ],
    whatItIsFor: 'Permite tener una visión panorámica instantánea de la actividad de tu local, saber qué productos rinden mejor y tomar decisiones comerciales con métricas reales.'
  },
  {
    id: 'pedidos',
    name: 'Gestión de Pedidos',
    category: 'operacion',
    categoryLabel: 'Operación & Ventas',
    href: '/orders',
    icon: ShoppingBag,
    color: 'text-orange-400',
    bgLight: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    highlightBadge: 'Comandera en Vivo',
    whatItContains: [
      'Tablero de comandas estilo Kanban y modo lista en tiempo real.',
      'Estados del pedido: Pendiente, En preparación, Listo, Entregado y Pagado.',
      'Detalle de mesa, platos solicitados, aclaraciones del cliente y mozo asignado.',
      'Filtros por estado de pago y alertas sonoras de nuevas comandas.'
    ],
    whatItIsFor: 'Organiza la cocina, la barra y el salón para despachar los pedidos en orden, avisar a los mozos cuando los platos están listos y registrar cobros en vivo.'
  },
  {
    id: 'productos',
    name: 'Catálogo de Productos',
    category: 'menu',
    categoryLabel: 'Carta & Menú',
    href: '/productos',
    icon: Package,
    color: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    highlightBadge: 'Platos & Precios',
    whatItContains: [
      'Listado completo de platos, bebidas, guarniciones y postres.',
      'Editor de precios, fotos en alta calidad y descripciones atractivas.',
      'Interruptor de disponibilidad: pausar platos agotados al instante.',
      'Etiquetas de "Destacado" y vinculación a modelos 3D.'
    ],
    whatItIsFor: 'Es la despensa digital donde creas nuevos platos, actualizas precios sin necesidad de reimprimir papel y controlas qué ítems están disponibles en la carta.'
  },
  {
    id: 'categorias',
    name: 'Categorías del Menú',
    category: 'menu',
    categoryLabel: 'Carta & Menú',
    href: '/categorias',
    icon: Tags,
    color: 'text-violet-400',
    bgLight: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    whatItContains: [
      'Secciones de la carta: Entradas, Carnes, Pastas, Tragos, Cafetería, etc.',
      'Asignación de íconos temáticos para cada rubro.',
      'Reordenamiento por orden de prioridad para que se muestren primero las especialidades.',
      'Control de visibilidad de categorías completas.'
    ],
    whatItIsFor: 'Estructura el menú de forma clara para que el cliente navegue fácilmente y encuentre lo que busca en segundos desde su celular.'
  },
  {
    id: 'mesas',
    name: 'Mesas & Cartelería QR',
    category: 'salon',
    categoryLabel: 'Salón & Cartelería',
    href: '/mesas',
    icon: UtensilsCrossed,
    color: 'text-amber-400',
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    highlightBadge: 'Soportes Imprimibles',
    whatItContains: [
      'Gestión de mesas del salón, barra, terraza o patio.',
      'Generación de códigos QR individuales con número de mesa pre-asignado.',
      'Diseñador de carteles de mesa listos para imprimir en PDF de alta calidad.',
      'Monitoreo del estado de cada mesa y mozos a cargo.'
    ],
    whatItIsFor: 'Permite que cada mesa tenga su propio código QR para que cuando el cliente lo escanee, el sistema identifique su mesa automáticamente sin errores.'
  },
  {
    id: 'fidelidad',
    name: 'Club de Fidelización',
    category: 'operacion',
    categoryLabel: 'Operación & Ventas',
    href: '/fidelidad',
    icon: Award,
    color: 'text-amber-400',
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    whatItContains: [
      'Reglas de acumulación de puntos por cada visita o consumo.',
      'Catálogo de premios canjeables (ej: trago de bienvenida, postre, descuentos).',
      'Historial de puntos y clientes frecuentes registrados por número de teléfono.',
      'Niveles de clientes (Bronce, Plata, Oro).'
    ],
    whatItIsFor: 'Fideliza y premia a tus clientes más fieles, motivándolos a regresar con mayor frecuencia para acumular puntos y canjear recompensas.'
  },
  {
    id: 'modelos',
    name: 'Platos 3D & Realidad Aumentada',
    category: 'menu',
    categoryLabel: 'Carta & Menú',
    href: '/models',
    icon: Box,
    color: 'text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    highlightBadge: 'Efecto WOW',
    whatItContains: [
      'Visor interactivo de modelos 3D rotables en 360 grados.',
      'Tecnología de Realidad Aumentada (AR) para ver el plato sobre la mesa.',
      'Asociación directa del modelo 3D con productos del menú.',
      'Historial de renderizado y estados de conversión.'
    ],
    whatItIsFor: 'Sorprende a los comensales permitiéndoles proyectar el plato en tamaño real sobre su mesa usando la cámara del celular antes de pedir.'
  },
  {
    id: 'importar',
    name: 'Importar Carta con IA',
    category: 'menu',
    categoryLabel: 'Carta & Menú',
    href: '/importar',
    icon: Sparkles,
    color: 'text-cyan-400',
    bgLight: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    highlightBadge: 'Inteligencia Artificial',
    whatItContains: [
      'Escáner de imágenes de cartas físicas, menús de pizarra o pizarras.',
      'Lector de archivos PDF y listas de precios.',
      'Extracción automática de títulos, precios, ingredientes y categorías.',
      'Previsualización y confirmación en 1 click para importar todo el menú.'
    ],
    whatItIsFor: 'Te ahorra horas de carga manual al digitalizar tu menú completo de forma automática a partir de una foto o archivo existente.'
  },
  {
    id: 'personalizacion',
    name: 'Personalización & Diseño',
    category: 'diseno',
    categoryLabel: 'Diseño & Marca',
    href: '/personalizacion',
    icon: Palette,
    color: 'text-pink-400',
    bgLight: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    whatItContains: [
      'Paleta de colores: Color primario de marca, fondos y contrastes.',
      'Tipografías premium seleccionables de Google Fonts.',
      'Carga de Logo, foto de portada (Banner) y fotos de perfil.',
      'Estilos de cartas: Diseño moderno o estilo vintage con texturas.',
      'Previsualizador en vivo simulando pantalla de smartphone.'
    ],
    whatItIsFor: 'Adapta la apariencia visual de la carta a la estética corporativa de tu negocio para que luzca profesional, cuidada y 100% propia.'
  },
  {
    id: 'qr',
    name: 'Código QR Maestro',
    category: 'salon',
    categoryLabel: 'Salón & Cartelería',
    href: '/qr',
    icon: QrCode,
    color: 'text-amber-400',
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    whatItContains: [
      'Código QR general enlazado a la dirección principal de tu carta digital.',
      'Descarga en alta resolución para imprenta (formatos vectoriales y PNG).',
      'Enlace web directo copiable para pegar en biografía de Instagram o WhatsApp.',
      'Botones para compartir rápidamente en redes sociales.'
    ],
    whatItIsFor: 'Para imprimir el QR principal en folletos, afiches de vidriera, servilleteros o compartir la carta digital por redes y chat con los clientes.'
  },
  {
    id: 'configuracion',
    name: 'Configuración del Negocio',
    category: 'ajustes',
    categoryLabel: 'Ajustes del Sistema',
    href: '/configuracion',
    icon: Settings,
    color: 'text-gray-400',
    bgLight: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    highlightBadge: 'Alertas & Mozos',
    whatItContains: [
      'Datos del local: Nombre del negocio, slug web y credenciales de acceso.',
      'Switches: Habilitar o deshabilitar "Pedidos desde la mesa" y "Mis Pedidos".',
      'Configuración de sonido: 5 tonos y barra de duración de 1 a 10 segundos.',
      'Avisos de campana de Google Chrome en segundo plano.',
      'Nómina de mozos para asignación de mesas.',
      'Integración con cuenta de cobro de Mercado Pago.'
    ],
    whatItIsFor: 'Es el centro de control operativo donde configuras cómo funciona tu local, qué permisos tienen los clientes y cómo te notifican las alertas.'
  },
  {
    id: 'carta-publica',
    name: 'Carta Digital Pública (Vista Cliente)',
    category: 'menu',
    categoryLabel: 'Carta & Menú',
    href: '/c/', // Se completa con slug del negocio
    icon: Store,
    color: 'text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    highlightBadge: 'Experiencia Móvil',
    isExternal: true,
    whatItContains: [
      'La experiencia que ve el comensal al escanear el QR desde su smartphone.',
      'Navegación fluida por categorías, fotos en alta resolución y precios.',
      'Botonera interactiva de mesa: "Llamar al mozo" y "Pedir la cuenta".',
      'Selección de medio de pago (Efectivo con vuelto, Tarjeta/Posnet, Mercado Pago/QR).',
      'Carrito de pedidos y seguimiento en vivo si los pedidos están activados.'
    ],
    whatItIsFor: 'Para auditar y experimentar en primera persona cómo ven tus clientes el menú, probar los llamados de mozo y verificar que todo funcione perfecto.'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Todos los Módulos' },
  { id: 'operacion', label: 'Operación & Ventas' },
  { id: 'menu', label: 'Carta & Menú' },
  { id: 'salon', label: 'Salón & Cartelería' },
  { id: 'diseno', label: 'Diseño & Marca' },
  { id: 'ajustes', label: 'Ajustes del Sistema' },
];

interface ModulesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessSlug?: string;
}

export function ModulesInfoModal({ isOpen, onClose, businessSlug }: ModulesInfoModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const filteredModules = MODULES_INFO.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesCategory;

    const matchesName = item.name.toLowerCase().includes(term);
    const matchesWhatItIsFor = item.whatItIsFor.toLowerCase().includes(term);
    const matchesContains = item.whatItContains.some(c => c.toLowerCase().includes(term));
    return matchesCategory && (matchesName || matchesWhatItIsFor || matchesContains);
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#111111] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Barra superior con acento degradado */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#141414] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Guía del Menú & Módulos
                  </span>
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                    {MODULES_INFO.length} páginas disponibles
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                  ¿Qué contiene y para qué sirve cada módulo?
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Explora las funciones de cada pantalla para sacarle el máximo provecho a tu carta digital.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Cerrar guía"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Buscador & Filtros de Categorías */}
          <div className="mt-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por módulo, función o palabra clave (ej: cocina, mozo, precios, 3D, mesas...)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Pills de Categoría */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Módulos (Cuerpo scrolleable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-[#0c0c0c]">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <Info className="w-10 h-10 text-gray-500 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-gray-300">No encontramos módulos que coincidan con tu búsqueda</p>
              <p className="text-xs text-gray-500 mt-1">Prueba con otra palabra clave o selecciona otra categoría.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-3 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10"
              >
                Ver todos los módulos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModules.map((item) => {
                const Icon = item.icon;
                const targetHref = item.id === 'carta-publica' && businessSlug ? `/c/${businessSlug}` : item.href;

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${item.bgLight} border ${item.borderColor} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-extrabold text-white truncate group-hover:text-indigo-300 transition-colors">
                              {item.name}
                            </h3>
                            <span className="text-[11px] text-gray-400 font-mono">
                              {item.href}
                            </span>
                          </div>
                        </div>

                        {item.highlightBadge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/10 text-gray-300 border border-white/10 shrink-0">
                            {item.highlightBadge}
                          </span>
                        )}
                      </div>

                      {/* ¿Para qué sirve? */}
                      <div className="mb-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1">
                          <span>💡</span> ¿Para qué sirve?
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {item.whatItIsFor}
                        </p>
                      </div>

                      {/* ¿Qué contiene? */}
                      <div className="space-y-1.5 mb-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                          ¿Qué contiene?
                        </p>
                        <ul className="space-y-1 text-xs text-gray-400">
                          {item.whatItContains.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0 mt-0.5" />
                              <span className="leading-snug">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Botón de Navegación Directa al Módulo */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">
                        {item.categoryLabel}
                      </span>

                      {item.isExternal ? (
                        <a
                          href={targetHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={onClose}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 border border-white/10 group-hover:border-indigo-500/40"
                        >
                          <span>Abrir en nueva pestaña</span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                        </a>
                      ) : (
                        <Link
                          href={targetHref}
                          onClick={onClose}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95"
                        >
                          <span>Ir al módulo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141414] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Tip: Podés consultar esta guía en cualquier momento haciendo clic en el botón <strong>(?) Info</strong>.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10 cursor-pointer"
          >
            Cerrar Guía
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * Botón compacto de (?) Info listo para incrustar en barras superiores o menús
 */
export function InfoButton({ 
  onClick, 
  variant = 'compact' 
}: { 
  onClick: () => void; 
  variant?: 'compact' | 'full' 
}) {
  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer group"
        title="Guía de información de módulos"
      >
        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
          ?
        </div>
        <span className="flex-1 text-left">(Info) Guía de Módulos</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all shadow-lg hover:border-indigo-500/40 cursor-pointer group"
      title="Ver qué contiene y para qué sirve cada página del menú"
    >
      <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
        ?
      </div>
      <span>(Info)</span>
    </button>
  );
}
