'use client';

import React from 'react';
import Link from 'next/link';
import { Cake, MessageCircle, Gift, Phone, Calendar, Sparkles, ArrowRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { CustomerLoyaltyData } from '@/actions/loyalty';
import {
  UpcomingBirthdayItem,
  buildBirthdayMessage,
  buildWhatsAppUrl,
  DEFAULT_BIRTHDAY_BENEFIT,
  DEFAULT_BIRTHDAY_WA_MESSAGE,
} from '@/lib/loyalty-utils';

interface UpcomingBirthdaysCardProps {
  birthdays: UpcomingBirthdayItem<CustomerLoyaltyData>[];
  businessName: string;
  businessSlug: string;
  birthdayBenefit?: string;
  birthdayMessageTemplate?: string;
  showConfigLink?: boolean;
}

export function UpcomingBirthdaysCard({
  birthdays,
  businessName,
  businessSlug,
  birthdayBenefit,
  birthdayMessageTemplate,
  showConfigLink = false,
}: UpcomingBirthdaysCardProps) {
  const effectiveBenefit = birthdayBenefit?.trim() || DEFAULT_BIRTHDAY_BENEFIT;
  const effectiveTemplate = birthdayMessageTemplate?.trim() || DEFAULT_BIRTHDAY_WA_MESSAGE;

  const handleSendBirthdayWhatsApp = (item: UpcomingBirthdayItem<CustomerLoyaltyData>) => {
    const sub = item.subscriber;
    if (!sub.customer_phone) {
      toast.warning('Este cliente no tiene un número de teléfono / WhatsApp registrado.');
      return;
    }

    const msg = buildBirthdayMessage(effectiveTemplate, {
      clientName: sub.customer_name?.trim() || 'Cliente',
      businessName: businessName || businessSlug,
      benefit: effectiveBenefit,
      birthdayDate: item.formattedDate,
    });

    const url = buildWhatsAppUrl(sub.customer_phone, msg);
    window.open(url, '_blank');
  };

  const todayCount = birthdays.filter(b => b.daysUntil === 0).length;

  return (
    <div className="bg-gradient-to-br from-pink-500/[0.07] via-[#121212] to-amber-500/[0.06] border border-pink-500/25 rounded-3xl p-5 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Próximos Cumpleaños (próximos 7 días)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {birthdays.length}
              </span>
              {todayCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  🎉 {todayCount} hoy
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Recordatorio semanal de clientes registrados en fidelización para enviarles su beneficio por WhatsApp.
            </p>
          </div>
        </div>

        {showConfigLink && (
          <Link
            href="/fidelidad#cumpleanos"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-pink-300 hover:text-pink-200 border border-pink-500/20 transition-all shrink-0 self-start sm:self-center"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Configurar beneficio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Beneficio activo */}
      <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center gap-2 text-xs">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-gray-400 font-medium">Beneficio configurado:</span>
        <span className="text-white font-semibold">{effectiveBenefit}</span>
      </div>

      {birthdays.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
          <Cake className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-400">
            No hay clientes que cumplan años en los próximos 7 días.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Cuando un cliente registrado en fidelidad esté a una semana de su cumpleaños, aparecerá aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {birthdays.map(item => {
            const sub = item.subscriber;
            const isToday = item.daysUntil === 0;
            const isTomorrow = item.daysUntil === 1;

            return (
              <div
                key={sub.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isToday
                    ? 'bg-pink-500/10 border-pink-500/40 shadow-md shadow-pink-500/10'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">
                      {sub.customer_name?.trim() || sub.customer_email}
                    </span>

                    {isToday ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-pink-500 text-white shadow-sm animate-pulse">
                        🎉 ¡CUMPLE HOY!
                      </span>
                    ) : isTomorrow ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🎂 Mañana
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        En {item.daysUntil} días
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 text-pink-300 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.formattedDate}
                      {item.turningAge ? ` (${item.turningAge} años)` : ''}
                    </span>

                    {sub.customer_dni && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-300">
                        <CreditCard className="w-3 h-3 text-gray-500" />
                        DNI {sub.customer_dni}
                      </span>
                    )}

                    {sub.customer_phone && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                        <Phone className="w-3 h-3" />
                        {sub.customer_phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSendBirthdayWhatsApp(item)}
                    disabled={!sub.customer_phone}
                    className="w-full sm:w-auto px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-gray-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
                    title={
                      sub.customer_phone
                        ? 'Enviar saludo y beneficio de cumpleaños por WhatsApp'
                        : 'El cliente no tiene WhatsApp registrado'
                    }
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
