'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface LoyaltySettings {
  loyalty_enabled: boolean;
  loyalty_stamps_required: number;
  loyalty_reward_title: string;
  loyalty_reward_description: string;
}

export interface CustomerLoyaltyData {
  id: string;
  business_id: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  stamps_count: number;
  total_stamps_earned: number;
  rewards_redeemed: number;
  hasStampedToday?: boolean;
  created_at: string;
  updated_at: string;
}

export async function getLoyaltySettings(businessId: string): Promise<LoyaltySettings> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('businesses')
      .select('loyalty_enabled, loyalty_stamps_required, loyalty_reward_title, loyalty_reward_description')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return {
        loyalty_enabled: false,
        loyalty_stamps_required: 5,
        loyalty_reward_title: '¡Premio de Fidelidad!',
        loyalty_reward_description: 'Consigue tus sellos consumiendo en días distintos para desbloquear tu beneficio.',
      };
    }

    return {
      loyalty_enabled: data.loyalty_enabled ?? false,
      loyalty_stamps_required: data.loyalty_stamps_required || 5,
      loyalty_reward_title: data.loyalty_reward_title || '¡Premio de Fidelidad!',
      loyalty_reward_description: data.loyalty_reward_description || 'Consigue tus sellos consumiendo en días distintos para desbloquear tu beneficio.',
    };
  } catch (err) {
    console.error('Error fetching loyalty settings:', err);
    return {
      loyalty_enabled: false,
      loyalty_stamps_required: 5,
      loyalty_reward_title: '¡Premio de Fidelidad!',
      loyalty_reward_description: 'Consigue tus sellos consumiendo en días distintos para desbloquear tu beneficio.',
    };
  }
}

export async function updateLoyaltySettings(businessId: string, settings: Partial<LoyaltySettings>) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('businesses')
      .update({
        loyalty_enabled: settings.loyalty_enabled,
        loyalty_stamps_required: settings.loyalty_stamps_required,
        loyalty_reward_title: settings.loyalty_reward_title,
        loyalty_reward_description: settings.loyalty_reward_description,
      })
      .eq('id', businessId);

    if (error) throw error;

    revalidatePath('/fidelidad');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating loyalty settings:', err);
    return { error: err.message || 'Error al actualizar la configuración de fidelidad' };
  }
}

export async function subscribeOrGetLoyaltyCard(businessId: string, email: string, name?: string, phone?: string) {
  try {
    const supabase = await createClient();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { error: 'Ingresa un email válido' };
    }

    // 1. Buscar o insertar en customer_loyalty
    let { data: loyalty, error: fetchError } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('business_id', businessId)
      .eq('customer_email', cleanEmail)
      .maybeSingle();

    if (!loyalty) {
      const { data: newLoyalty, error: insertError } = await supabase
        .from('customer_loyalty')
        .insert({
          business_id: businessId,
          customer_email: cleanEmail,
          customer_name: name?.trim() || null,
          customer_phone: phone?.trim() || null,
          stamps_count: 0,
          total_stamps_earned: 0,
          rewards_redeemed: 0,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;
      loyalty = newLoyalty;
    } else if (name || phone) {
      // Actualizar datos de contacto si se enviaron
      const { data: updated } = await supabase
        .from('customer_loyalty')
        .update({
          customer_name: name?.trim() || loyalty.customer_name,
          customer_phone: phone?.trim() || loyalty.customer_phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', loyalty.id)
        .select('*')
        .single();

      if (updated) loyalty = updated;
    }

    // 2. Verificar si ya sumó sello hoy
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStamp } = await supabase
      .from('loyalty_stamps_log')
      .select('id')
      .eq('loyalty_id', loyalty.id)
      .eq('stamp_date', today)
      .maybeSingle();

    return {
      success: true,
      card: {
        ...loyalty,
        hasStampedToday: !!todayStamp,
      } as CustomerLoyaltyData,
    };
  } catch (err: any) {
    console.error('Error in subscribeOrGetLoyaltyCard:', err);
    return { error: err.message || 'Error al procesar la tarjeta de fidelidad' };
  }
}

export async function addDailyStamp(businessId: string, email: string) {
  try {
    const supabase = await createClient();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { error: 'Email inválido' };
    }

    // 1. Obtener o crear tarjeta
    const cardRes = await subscribeOrGetLoyaltyCard(businessId, cleanEmail);
    if (cardRes.error || !cardRes.card) {
      return { error: cardRes.error || 'No se pudo obtener la tarjeta' };
    }

    const loyalty = cardRes.card;
    const today = new Date().toISOString().split('T')[0];

    // 2. Intentar registrar el sello de hoy
    const { error: logError } = await supabase
      .from('loyalty_stamps_log')
      .insert({
        business_id: businessId,
        loyalty_id: loyalty.id,
        stamp_date: today,
      });

    if (logError) {
      // Si dio error por duplicado (código 23505 en Postgres), significa que ya sumó sello hoy
      if (logError.code === '23505' || logError.message?.includes('unique_loyalty_stamp_per_day')) {
        return {
          success: false,
          alreadyStampedToday: true,
          card: loyalty,
          message: '¡Ya sumaste tu sello de hoy! Vuelve mañana para sumar otro.',
        };
      }
      throw logError;
    }

    // 3. Incrementar contadores en customer_loyalty
    const newStampsCount = loyalty.stamps_count + 1;
    const newTotalEarned = loyalty.total_stamps_earned + 1;

    const { data: updatedCard, error: updateError } = await supabase
      .from('customer_loyalty')
      .update({
        stamps_count: newStampsCount,
        total_stamps_earned: newTotalEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loyalty.id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    return {
      success: true,
      alreadyStampedToday: false,
      card: {
        ...updatedCard,
        hasStampedToday: true,
      } as CustomerLoyaltyData,
      message: '🎉 ¡Excelente! Sumaste 1 sello por tu visita de hoy.',
    };
  } catch (err: any) {
    console.error('Error adding daily stamp:', err);
    return { error: err.message || 'Error al agregar sello' };
  }
}

export async function redeemReward(loyaltyId: string, businessId: string) {
  try {
    const supabase = await createClient();

    const settings = await getLoyaltySettings(businessId);
    const required = settings.loyalty_stamps_required;

    const { data: loyalty, error: fetchErr } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('id', loyaltyId)
      .single();

    if (fetchErr || !loyalty) {
      return { error: 'No se encontró la tarjeta de cliente' };
    }

    if (loyalty.stamps_count < required) {
      return { error: `Necesitas ${required} sellos para canjear este premio.` };
    }

    const newStampsCount = loyalty.stamps_count - required;
    const newRewardsRedeemed = (loyalty.rewards_redeemed || 0) + 1;

    const { data: updated, error: updateErr } = await supabase
      .from('customer_loyalty')
      .update({
        stamps_count: newStampsCount,
        rewards_redeemed: newRewardsRedeemed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loyaltyId)
      .select('*')
      .single();

    if (updateErr) throw updateErr;

    revalidatePath('/fidelidad');
    return {
      success: true,
      card: updated as CustomerLoyaltyData,
      message: '🎁 ¡Premio marcado como CANJEADO con éxito!',
    };
  } catch (err: any) {
    console.error('Error redeeming reward:', err);
    return { error: err.message || 'Error al canjear el premio' };
  }
}

export async function getLoyaltySubscribers(businessId: string): Promise<CustomerLoyaltyData[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('business_id', businessId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching loyalty subscribers:', err);
    return [];
  }
}

export async function manualAddStamp(loyaltyId: string, businessId: string) {
  try {
    const supabase = await createClient();

    const { data: loyalty, error: fetchErr } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('id', loyaltyId)
      .single();

    if (fetchErr || !loyalty) throw new Error('Tarjeta no encontrada');

    const newStamps = loyalty.stamps_count + 1;
    const newTotal = loyalty.total_stamps_earned + 1;

    const { error: updateErr } = await supabase
      .from('customer_loyalty')
      .update({
        stamps_count: newStamps,
        total_stamps_earned: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loyaltyId);

    if (updateErr) throw updateErr;

    revalidatePath('/fidelidad');
    return { success: true };
  } catch (err: any) {
    console.error('Error in manualAddStamp:', err);
    return { error: err.message || 'Error al otorgar sello' };
  }
}
