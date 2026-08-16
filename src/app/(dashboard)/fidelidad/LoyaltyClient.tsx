'use client';

import React, { useState } from 'react';
import {
  LoyaltySettings,
  CustomerLoyaltyData,
  updateLoyaltySettings,
  redeemReward,
  manualAddStamp,
} from '@/actions/loyalty';
import {
  Award,
  Gift,
  Plus,
  Search,
  CheckCircle2,
  Settings,
  Users,
  Sparkles,
  RefreshCw,
  Mail,
  Phone,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface LoyaltyClientProps {
  businessId: string;
  businessSlug: string;
  initialSettings: LoyaltySettings;
  initialSubscribers: CustomerLoyaltyData[];
}

export function LoyaltyClient({
  businessId,
  businessSlug,
  initialSettings,
  initialSubscribers,
}: LoyaltyClientProps) {
  const [settings, setSettings] = useState<LoyaltySettings>(initialSettings);
  const [subscribers, setSubscribers] = useState<CustomerLoyaltyData[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const res = await updateLoyaltySettings(businessId, settings);
      if (res.error) throw new Error(res.error);

      toast.success('¡Configuración de fidelización guardada con éxito!');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la configuración');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleManualAddStamp = async (sub: CustomerLoyaltyData) => {
    setActionLoadingId(sub.id);
    try {
      const res = await manualAddStamp(sub.id, businessId);
      if (res.error) throw new Error(res.error);

      setSubscribers(prev =>
        prev.map(item =>
          item.id === sub.id
            ? {
                ...item,
                stamps_count: item.stamps_count + 1,
                total_stamps_earned: item.total_stamps_earned + 1,
              }
            : item
        )
      );

      toast.success(`Sello otorgado a ${sub.customer_email}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar sello');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRedeemReward = async (sub: CustomerLoyaltyData) => {
    if (!confirm(`¿Confirmas el canje del premio para ${sub.customer_email}?`)) return;

    setActionLoadingId(sub.id);
    try {
      const res = await redeemReward(sub.id, businessId);
      if (res.error) throw new Error(res.error);

      if (res.card) {
        setSubscribers(prev =>
          prev.map(item => (item.id === sub.id ? (res.card as CustomerLoyaltyData) : item))
        );
      }

      toast.success(res.message || '¡Premio canjeado con éxito!', { icon: '🎁' });
    } catch (err: any) {
      toast.error(err.message || 'Error al canjear el premio');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      sub.customer_email.toLowerCase().includes(query) ||
      (sub.customer_name && sub.customer_name.toLowerCase().includes(query)) ||
      (sub.customer_phone && sub.customer_phone.includes(query))
    );
  });

  const totalRewardsUnlocked = subscribers.filter(
    s => s.stamps_count >= settings.loyalty_stamps_required
  ).length;

  const totalRewardsRedeemedCount = subscribers.reduce(
    (acc, s) => acc + (s.rewards_redeemed || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-400" />
            Fidelización & Tarjeta de Sellos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Premia a tus clientes frecuentes con sellos digitales por cada día que consuman en tu local.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Clientes Suscritos</p>
            <h3 className="text-2xl font-black text-white">{subscribers.length}</h3>
          </div>
        </div>

        <div className="p-5 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Premios Listos para Canjear</p>
            <h3 className="text-2xl font-black text-emerald-400">{totalRewardsUnlocked}</h3>
          </div>
        </div>

        <div className="p-5 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Premios Canjeados</p>
            <h3 className="text-2xl font-black text-white">{totalRewardsRedeemedCount}</h3>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Configuración del Programa</h2>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loyalty_enabled}
              onChange={e => setSettings({ ...settings, loyalty_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-3 text-sm font-semibold text-white">
              {settings.loyalty_enabled ? 'Programa Activo' : 'Programa Desactivado'}
            </span>
          </label>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Sellos Requeridos para el Premio
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.loyalty_stamps_required}
                onChange={e => setSettings({ ...settings, loyalty_stamps_required: parseInt(e.target.value) || 5 })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad de días/sellos que el cliente debe acumular para ganar la recompensa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Título del Premio / Beneficio
              </label>
              <input
                type="text"
                value={settings.loyalty_reward_title}
                onChange={e => setSettings({ ...settings, loyalty_reward_title: e.target.value })}
                placeholder="ej. ¡Café + Medialuna Gratis!"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre del beneficio que se le muestra al cliente en su tarjeta.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Descripción y Condiciones del Premio
            </label>
            <textarea
              rows={2}
              value={settings.loyalty_reward_description}
              onChange={e => setSettings({ ...settings, loyalty_reward_description: e.target.value })}
              placeholder="ej. Válido consumiendo en el local. Muestra esta tarjeta al mozo."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>

      {/* Subscribers Table */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Clientes Suscritos ({filteredSubscribers.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por email o nombre..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Users className="w-12 h-12 mx-auto text-gray-600" />
            <p className="font-semibold text-gray-400">No se encontraron suscriptores</p>
            <p className="text-xs">Los clientes se registrarán al usar la tarjeta de sellos en el menú público.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-400 border-b border-white/10 bg-white/5">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Cliente</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Sellos Activos</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Histórico Totales</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Premios Canjeados</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Estado Premio</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubscribers.map(sub => {
                  const isReadyToRedeem = sub.stamps_count >= settings.loyalty_stamps_required;
                  const isLoading = actionLoadingId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{sub.customer_email}</span>
                        </div>
                        {sub.customer_name && (
                          <p className="text-xs text-gray-400 mt-0.5">{sub.customer_name}</p>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {sub.stamps_count} / {settings.loyalty_stamps_required}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-gray-300">
                        {sub.total_stamps_earned}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-gray-300">
                        {sub.rewards_redeemed || 0}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isReadyToRedeem ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                            <Gift className="w-3.5 h-3.5" /> Ready!
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">
                            En progreso ({sub.stamps_count}/{settings.loyalty_stamps_required})
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleManualAddStamp(sub)}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-white/10"
                            title="Sumar 1 sello manualmente"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                            <span>+1 Sello</span>
                          </button>

                          {isReadyToRedeem && (
                            <button
                              onClick={() => handleRedeemReward(sub)}
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-emerald-600/20"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Canjear</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
