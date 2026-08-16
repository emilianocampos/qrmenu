'use client';

import React, { useState, useEffect } from 'react';
import { subscribeOrGetLoyaltyCard, addDailyStamp, CustomerLoyaltyData, LoyaltySettings } from '@/actions/loyalty';
import { Award, CheckCircle2, Gift, Mail, Sparkles, Star, User, Phone, X, AlertCircle } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cardData, setCardData] = useState<CustomerLoyaltyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [stamping, setStamping] = useState(false);

  const localKey = `loyalty_email_${businessId}`;

  useEffect(() => {
    if (!isOpen) return;

    const savedEmail = localStorage.getItem(localKey);
    if (savedEmail) {
      setEmail(savedEmail);
      loadCard(savedEmail);
    }
  }, [isOpen, businessId]);

  const loadCard = async (targetEmail: string) => {
    setLoading(true);
    try {
      const res = await subscribeOrGetLoyaltyCard(businessId, targetEmail);
      if (res.error) throw new Error(res.error);
      if (res.card) {
        setCardData(res.card);
        localStorage.setItem(localKey, targetEmail);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar tu tarjeta de sellos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Ingresa tu email');

    setLoading(true);
    try {
      const res = await subscribeOrGetLoyaltyCard(businessId, email, name, phone);
      if (res.error) throw new Error(res.error);

      if (res.card) {
        setCardData(res.card);
        localStorage.setItem(localKey, email.trim().toLowerCase());
        toast.success('¡Tarjeta de sellos cargada con éxito!', { icon: '🎟️' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error al procesar tu registro');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDailyStamp = async () => {
    if (!email) return;
    setStamping(true);
    try {
      const res = await addDailyStamp(businessId, email);
      if (res.error) throw new Error(res.error);

      if (res.card) {
        setCardData(res.card);
      }

      if (res.alreadyStampedToday) {
        toast.info(res.message, { icon: '📅' });
      } else {
        toast.success(res.message, { icon: '🎉' });
        try {
          const audio = new Audio('/sounds/universfield-new-notification-036-485897.mp3');
          audio.play().catch(() => {});
        } catch {}
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al reclamar sello');
    } finally {
      setStamping(false);
    }
  };

  const handleSwitchEmail = () => {
    localStorage.removeItem(localKey);
    setCardData(null);
    setEmail('');
    setName('');
    setPhone('');
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

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 z-10 animate-in zoom-in-95 border max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {!cardData ? (
          /* Formulario de Suscripción */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                Tarjeta de Sellos
              </h2>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                Suscríbete con tu correo para acumular sellos por tus visitas y canjear grandes premios.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Tu Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Tu Nombre (opcional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre completo"
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
                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  WhatsApp / Celular (opcional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Para notificar tus premios"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none border transition-all"
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
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
                {loading ? 'Cargando...' : <><span>Ver Mi Tarjeta de Sellos</span> <Sparkles className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        ) : (
          /* Tarjeta Digital de Fidelización */
          <div className="space-y-6">
            {/* Business Header */}
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: primaryColor }}>
                Programa de Fidelidad
              </span>
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {businessName}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {cardData.customer_email}
              </p>
            </div>

            {/* Banner de Premio Unlocked */}
            {isRewardUnlocked && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-center space-y-2 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-amber-500 uppercase tracking-wide">
                  🎁 ¡Premio Desbloqueado!
                </h3>
                <p className="font-black text-lg text-white">
                  {settings.loyalty_reward_title}
                </p>
                <p className="text-xs text-amber-200/80 max-w-xs mx-auto">
                  {settings.loyalty_reward_description || 'Muestra esta pantalla al mozo o personal para reclamar tu beneficio.'}
                </p>
              </div>
            )}

            {/* Stamp Card Grid */}
            <div className="p-5 rounded-2xl border relative overflow-hidden" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Tus Sellos Acumulados
                </span>
                <span className="text-sm font-black" style={{ color: primaryColor }}>
                  {currentStamps} / {stampsRequired}
                </span>
              </div>

              {/* Grid of Stamp Circles */}
              <div className="grid grid-cols-5 gap-3 my-3">
                {Array.from({ length: stampsRequired }).map((_, index) => {
                  const isStamped = index < currentStamps;
                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-500 border ${
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
                          <Star className="w-5 h-5 fill-white text-white" />
                          <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">SELLO</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between items-center text-[11px]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <span>Máximo 1 sello por día</span>
                {cardData.hasStampedToday && (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sello de hoy sumado
                  </span>
                )}
              </div>
            </div>

            {/* Claim Daily Stamp Button */}
            <div className="space-y-3">
              <button
                onClick={handleClaimDailyStamp}
                disabled={stamping}
                className="w-full py-3.5 font-bold text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: cardData.hasStampedToday ? '#10b981' : primaryColor,
                  boxShadow: cardData.hasStampedToday ? '0 8px 20px rgba(16, 185, 129, 0.3)' : `0 8px 20px ${primaryColor}40`,
                }}
              >
                {stamping ? (
                  'Registrando...'
                ) : cardData.hasStampedToday ? (
                  <><CheckCircle2 className="w-4 h-4" /> ¡Sello de hoy registrado!</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Sumar Sello de Hoy</>
                )}
              </button>

              <button
                onClick={handleSwitchEmail}
                className="w-full text-center text-xs py-2 hover:underline cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                Cambiar de correo ({cardData.customer_email})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
