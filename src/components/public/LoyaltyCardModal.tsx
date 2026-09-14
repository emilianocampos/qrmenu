'use client';

import React, { useState, useEffect } from 'react';
import { 
  subscribeOrGetLoyaltyCard, 
  loginLoyaltyCustomer, 
  CustomerLoyaltyData, 
  LoyaltySettings 
} from '@/actions/loyalty';
import { 
  Award, 
  CheckCircle2, 
  Gift, 
  Mail, 
  Sparkles, 
  Star, 
  User, 
  Phone, 
  X, 
  Lock, 
  LogOut, 
  Info,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface LoyaltyCardModalProps {
  businessId: string;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  settings: LoyaltySettings;
  primaryColor?: string;
}

export function LoyaltyCardModal({
  businessId,
  businessName,
  isOpen,
  onClose,
  settings,
  primaryColor = '#f97316',
}: LoyaltyCardModalProps) {
  // Modo de visualización si no tiene sesión activa: 'register' (Guardar mis datos) | 'login' (Ver mis sellos)
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  // Formulario "Guardar mis datos"
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Formulario "Ver mis sellos"
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // Estado del cliente autenticado / gestor de sellos
  const [cardData, setCardData] = useState<CustomerLoyaltyData | null>(null);
  const [loading, setLoading] = useState(false);

  const localEmailKey = `loyalty_email_${businessId}`;
  const localPhoneKey = `loyalty_phone_${businessId}`;

  // Cargar sesión persistente al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    const savedEmail = localStorage.getItem(localEmailKey);
    const savedPhone = localStorage.getItem(localPhoneKey);

    if (savedEmail && savedPhone) {
      setLoginEmail(savedEmail);
      setLoginPhone(savedPhone);
      // Intentar auto-login para abrir el gestor directamente
      autoLogin(savedEmail, savedPhone);
    } else if (savedEmail) {
      setLoginEmail(savedEmail);
      setActiveTab('login');
    }
  }, [isOpen, businessId]);

  const autoLogin = async (email: string, phone: string) => {
    setLoading(true);
    try {
      const res = await loginLoyaltyCustomer(businessId, email, phone);
      if (res.card) {
        setCardData(res.card);
      }
    } catch {
      // Si falla silenciosamente, muestra la pestaña de ingreso
      setActiveTab('login');
    } finally {
      setLoading(false);
    }
  };

  // 1. Guardar mis datos (Registro)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();

    if (!cleanEmail) return toast.error('Ingresa tu email');
    if (!cleanPhone) return toast.error('Ingresa tu número de WhatsApp / teléfono');

    setLoading(true);
    try {
      const res = await subscribeOrGetLoyaltyCard(businessId, cleanEmail, regName, cleanPhone);
      if (res.error) throw new Error(res.error);

      if (res.card) {
        setCardData(res.card);
        localStorage.setItem(localEmailKey, cleanEmail);
        localStorage.setItem(localPhoneKey, cleanPhone);
        toast.success('¡Datos guardados con éxito! Tu tarjeta de sellos está activa.', { icon: '🎉' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar tus datos');
    } finally {
      setLoading(false);
    }
  };

  // 2. Ver mis sellos (Autenticación con Email + Teléfono como contraseña)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPhone = loginPhone.trim();

    if (!cleanEmail) return toast.error('Ingresa tu email');
    if (!cleanPhone) return toast.error('Ingresa tu número de teléfono como contraseña');

    setLoading(true);
    try {
      const res = await loginLoyaltyCustomer(businessId, cleanEmail, cleanPhone);
      if (res.error) throw new Error(res.error);

      if (res.card) {
        setCardData(res.card);
        localStorage.setItem(localEmailKey, cleanEmail);
        localStorage.setItem(localPhoneKey, cleanPhone);
        toast.success('¡Bienvenido! Gestor de sellos abierto.', { icon: '🎟️' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Datos incorrectos. Verifica tu email y teléfono.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(localEmailKey);
    localStorage.removeItem(localPhoneKey);
    setCardData(null);
    setLoginPhone('');
    setActiveTab('login');
    toast.info('Sesión cerrada');
  };

  if (!isOpen) return null;

  const stampsRequired = settings.loyalty_stamps_required || 5;
  const currentStamps = cardData ? cardData.stamps_count : 0;
  const isRewardUnlocked = currentStamps >= stampsRequired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 z-10 animate-in zoom-in-95 border max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Botón Cerrar Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {!cardData ? (
          /* =========================================================================
             VISTA 1: SELECTOR DE ACCIONES (Guardar mis datos / Ver mis sellos)
             ========================================================================= */
          <div className="space-y-6">
            {/* Cabecera */}
            <div className="text-center space-y-2">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Award className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                Tarjeta de Sellos
              </h2>
              <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                Sumá sellos con tus visitas y compras para ganar grandes premios en {businessName}.
              </p>
            </div>

            {/* Selector de Pestañas con los dos botones solicitados */}
            <div 
              className="grid grid-cols-2 p-1 rounded-2xl border"
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: activeTab === 'register' ? primaryColor : 'transparent',
                  color: activeTab === 'register' ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: activeTab === 'register' ? `0 4px 12px ${primaryColor}40` : 'none',
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Guardar mis datos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: activeTab === 'login' ? primaryColor : 'transparent',
                  color: activeTab === 'login' ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: activeTab === 'login' ? `0 4px 12px ${primaryColor}40` : 'none',
                }}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ver mis sellos</span>
              </button>
            </div>

            {/* PESTAÑA A: GUARDAR MIS DATOS (Registro nuevo) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 pt-1 animate-in fade-in duration-200">
                <div className="text-xs pb-1" style={{ color: 'var(--text-muted)' }}>
                  Registrá tus datos una sola vez para empezar a sumar sellos automáticos.
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Tu Nombre (opcional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none border transition-all"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Tu Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none border transition-all"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    WhatsApp / Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="Ej: 11 2345-6789"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none border transition-all"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Tu número de teléfono será tu contraseña para ver tus sellos.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 font-bold text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 25px -5px ${primaryColor}50`,
                  }}
                >
                  {loading ? 'Guardando datos...' : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Guardar mis datos</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* PESTAÑA B: VER MIS SELLOS (Ingreso con Email + Teléfono como contraseña) */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 pt-1 animate-in fade-in duration-200">
                <div className="text-xs pb-1" style={{ color: 'var(--text-muted)' }}>
                  Ingresa tu correo y teléfono para acceder a tu gestor de sellos.
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Tu Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none border transition-all"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Contraseña (Número de teléfono) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      required
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      placeholder="Tu número de celular registrado"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none border transition-all"
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    El teléfono que usaste al registrar tus datos.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 font-bold text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 25px -5px ${primaryColor}50`,
                  }}
                >
                  {loading ? 'Verificando...' : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Ver mis sellos</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* =========================================================================
             VISTA 2: GESTOR DE SELLOS (Cliente Autenticado)
             ========================================================================= */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header del Gestor */}
            <div className="text-center space-y-1">
              <span 
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-flex items-center gap-1.5"
                style={{ 
                  backgroundColor: 'var(--bg-page)', 
                  borderColor: 'var(--border-color)', 
                  color: primaryColor 
                }}
              >
                <Award className="w-3 h-3" />
                Gestor de Sellos
              </span>
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {businessName}
              </h2>
              <div className="text-xs flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                {cardData.customer_name && (
                  <span className="font-semibold text-white">{cardData.customer_name} •</span>
                )}
                <span>{cardData.customer_email}</span>
              </div>
            </div>

            {/* Banner de Premio Desbloqueado */}
            {isRewardUnlocked && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-center space-y-2 animate-in zoom-in-95 duration-300 shadow-lg shadow-amber-500/10">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="font-black text-sm text-amber-500 uppercase tracking-wider">
                  🎁 ¡Premio Desbloqueado!
                </h3>
                <p className="font-black text-lg text-white">
                  {settings.loyalty_reward_title}
                </p>
                <p className="text-xs text-amber-200/90 max-w-xs mx-auto">
                  {(settings.loyalty_reward_description || '').split('\n---WA_MSG---\n')[0]?.trim() || 'Muestra esta pantalla al personal o mozo para reclamar tu beneficio.'}
                </p>
              </div>
            )}

            {/* Tarjeta Visual de Sellos */}
            <div 
              className="p-5 rounded-2xl border relative overflow-hidden" 
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Tus Sellos Acumulados
                </span>
                <span className="text-sm font-black" style={{ color: primaryColor }}>
                  {currentStamps} / {stampsRequired}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-white/5 rounded-full h-2 mb-4 overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (currentStamps / stampsRequired) * 100)}%`,
                    backgroundColor: primaryColor,
                  }}
                />
              </div>

              {/* Grilla de Sellos */}
              <div className="grid grid-cols-5 gap-2.5 my-2">
                {Array.from({ length: stampsRequired }).map((_, index) => {
                  const isStamped = index < currentStamps;
                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 border ${
                        isStamped 
                          ? 'scale-105 shadow-md' 
                          : 'border-dashed opacity-40'
                      }`}
                      style={{
                        backgroundColor: isStamped ? primaryColor : 'var(--bg-card)',
                        borderColor: isStamped ? primaryColor : 'var(--border-color)',
                        color: isStamped ? '#ffffff' : 'var(--text-muted)',
                        boxShadow: isStamped ? `0 4px 14px ${primaryColor}40` : 'none'
                      }}
                    >
                      {isStamped ? (
                        <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                          <Star className="w-4 h-4 fill-white text-white" />
                          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">SELLO</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Información sobre cómo se generan los sellos */}
              <div 
                className="mt-4 pt-3 border-t text-[11px] space-y-1.5" 
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              >
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>¿Cómo sumar sellos?</strong> El sello se genera automáticamente una vez que compras algo desde la app o el personal lo puede agregar desde el panel de administración.
                  </span>
                </div>

                {cardData.hasStampedToday && (
                  <div className="text-emerald-400 font-bold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sello de hoy acreditado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones de Cuenta */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 font-bold text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 15px -2px ${primaryColor}40`,
                }}
              >
                <span>Volver a la carta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
