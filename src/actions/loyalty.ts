'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import {
  DEFAULT_LOYALTY_WA_MESSAGE,
  DEFAULT_BIRTHDAY_BENEFIT,
  DEFAULT_BIRTHDAY_WA_MESSAGE,
  arePhonesMatching,
  normalizeDni,
  areDnisMatching,
} from '@/lib/loyalty-utils';

export interface LoyaltySettings {
  loyalty_enabled: boolean;
  loyalty_stamps_required: number;
  loyalty_reward_title: string;
  loyalty_reward_description: string;
  loyalty_whatsapp_message?: string;
  loyalty_birthday_benefit?: string;
  loyalty_birthday_message?: string;
}

export interface CustomerLoyaltyData {
  id: string;
  business_id: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_dni?: string | null;
  customer_birthday?: string | null;
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
      .select('*')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return {
        loyalty_enabled: false,
        loyalty_stamps_required: 5,
        loyalty_reward_title: '¡Premio de Fidelidad!',
        loyalty_reward_description: 'Consigue tus sellos consumiendo en días distintos para desbloquear tu beneficio.',
        loyalty_whatsapp_message: DEFAULT_LOYALTY_WA_MESSAGE,
        loyalty_birthday_benefit: DEFAULT_BIRTHDAY_BENEFIT,
        loyalty_birthday_message: DEFAULT_BIRTHDAY_WA_MESSAGE,
      };
    }

    // Separar descripción del mensaje de WhatsApp si fue guardado con el delimitador
    const rawDesc = data.loyalty_reward_description || '';
    const [descPart, waPart] = rawDesc.split('\n---WA_MSG---\n');

    return {
      loyalty_enabled: data.loyalty_enabled ?? false,
      loyalty_stamps_required: data.loyalty_stamps_required || 5,
      loyalty_reward_title: data.loyalty_reward_title || '¡Premio de Fidelidad!',
      loyalty_reward_description: descPart?.trim() || 'Consigue tus sellos consumiendo en días distintos para desbloquear tu beneficio.',
      loyalty_whatsapp_message: waPart?.trim() || DEFAULT_LOYALTY_WA_MESSAGE,
      loyalty_birthday_benefit: data.loyalty_birthday_benefit?.trim() || DEFAULT_BIRTHDAY_BENEFIT,
      loyalty_birthday_message: data.loyalty_birthday_message?.trim() || DEFAULT_BIRTHDAY_WA_MESSAGE,
    };
  } catch (err) {
    console.error('Error fetching loyalty settings:', err);
    return {
      loyalty_enabled: false,
      loyalty_stamps_required: 5,
      loyalty_reward_title: '¡Premio de Fidelidad!',
      loyalty_reward_description: 'Consigue tus sellos consumiendo en días distintos para desbloquear tu beneficio.',
      loyalty_whatsapp_message: DEFAULT_LOYALTY_WA_MESSAGE,
      loyalty_birthday_benefit: DEFAULT_BIRTHDAY_BENEFIT,
      loyalty_birthday_message: DEFAULT_BIRTHDAY_WA_MESSAGE,
    };
  }
}

export async function updateLoyaltySettings(businessId: string, settings: Partial<LoyaltySettings>) {
  try {
    const supabase = await createClient();

    // Empaquetar la descripción y el mensaje de WhatsApp de forma transparente
    const cleanDesc = (settings.loyalty_reward_description || '').trim();
    const cleanWaMsg = (settings.loyalty_whatsapp_message || DEFAULT_LOYALTY_WA_MESSAGE).trim();
    const fullDescription = `${cleanDesc}\n---WA_MSG---\n${cleanWaMsg}`;

    const updatePayload: Record<string, any> = {
      loyalty_enabled: settings.loyalty_enabled,
      loyalty_stamps_required: settings.loyalty_stamps_required,
      loyalty_reward_title: settings.loyalty_reward_title,
      loyalty_reward_description: fullDescription,
    };

    if (settings.loyalty_birthday_benefit !== undefined) {
      updatePayload.loyalty_birthday_benefit = settings.loyalty_birthday_benefit.trim();
    }
    if (settings.loyalty_birthday_message !== undefined) {
      updatePayload.loyalty_birthday_message = settings.loyalty_birthday_message.trim();
    }

    const { error } = await supabase
      .from('businesses')
      .update(updatePayload)
      .eq('id', businessId);

    if (error) throw error;

    revalidatePath('/fidelidad');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating loyalty settings:', err);
    return { error: err.message || 'Error al actualizar la configuración de fidelidad' };
  }
}

export async function subscribeOrGetLoyaltyCard(
  businessId: string,
  email: string,
  name?: string,
  phone?: string,
  dni?: string,
  birthday?: string
) {
  try {
    const supabase = await createClient();
    const cleanEmail = email.trim().toLowerCase();
    const cleanDni = dni ? normalizeDni(dni) : '';
    const cleanBirthday = birthday?.trim() || null;

    if (!cleanEmail) {
      return { error: 'Ingresa un email válido' };
    }

    if (dni !== undefined && cleanDni.length < 6) {
      return { error: 'Ingresa un número de DNI válido (al menos 6 dígitos).' };
    }

    // 1. Buscar o insertar en customer_loyalty
    let { data: loyalty, error: fetchError } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('business_id', businessId)
      .eq('customer_email', cleanEmail)
      .maybeSingle();

    if (!loyalty) {
      const insertPayload: Record<string, any> = {
        business_id: businessId,
        customer_email: cleanEmail,
        customer_name: name?.trim() || null,
        customer_phone: phone?.trim() || null,
        customer_dni: cleanDni || null,
        customer_birthday: cleanBirthday,
        stamps_count: 0,
        total_stamps_earned: 0,
        rewards_redeemed: 0,
      };

      const { data: newLoyalty, error: insertError } = await supabase
        .from('customer_loyalty')
        .insert(insertPayload)
        .select('*')
        .single();

      if (insertError) throw insertError;
      loyalty = newLoyalty;
    } else if (name || phone || cleanDni || cleanBirthday) {
      // Si la cuenta ya tiene un DNI distinto registrado, proteger contra sobreescritura no autorizada
      if (loyalty.customer_dni && cleanDni && !areDnisMatching(cleanDni, loyalty.customer_dni)) {
        return {
          error: 'Ya existe una cuenta con este email registrada con otro DNI. Ingresá en "Ver mis sellos" con tu DNI.',
        };
      }

      // Actualizar datos de contacto si se enviaron
      const { data: updated } = await supabase
        .from('customer_loyalty')
        .update({
          customer_name: name?.trim() || loyalty.customer_name,
          customer_phone: phone?.trim() || loyalty.customer_phone,
          customer_dni: cleanDni || loyalty.customer_dni,
          customer_birthday: cleanBirthday || loyalty.customer_birthday,
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

/**
 * Autentica al cliente con su email y número de DNI (como contraseña) para abrir el gestor de sellos.
 */
export async function loginLoyaltyCustomer(businessId: string, email: string, dni: string) {
  try {
    const supabase = await createClient();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanDni = normalizeDni(dni || '');

    if (!cleanEmail) {
      return { error: 'Ingresa tu correo electrónico.' };
    }
    if (!cleanDni || cleanDni.length < 6) {
      return { error: 'Ingresa tu número de DNI como contraseña.' };
    }

    const { data: loyalty, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('business_id', businessId)
      .eq('customer_email', cleanEmail)
      .maybeSingle();

    if (error) throw error;
    if (!loyalty) {
      return {
        error: 'No se encontró ninguna tarjeta registrada con este email. Por favor regístrate en "Guardar mis datos".'
      };
    }

    // Validar DNI como contraseña
    if (loyalty.customer_dni) {
      const match = areDnisMatching(cleanDni, loyalty.customer_dni);
      if (!match) {
        return {
          error: 'El número de DNI no coincide con el registrado para esta cuenta.'
        };
      }
    } else {
      // Si el cliente era antiguo y no tenía DNI guardado aún, lo vinculamos ahora
      await supabase
        .from('customer_loyalty')
        .update({ customer_dni: cleanDni, updated_at: new Date().toISOString() })
        .eq('id', loyalty.id);
      loyalty.customer_dni = cleanDni;
    }

    // Verificar si ya sumó sello hoy
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
    console.error('Error in loginLoyaltyCustomer:', err);
    return { error: err.message || 'Error al validar credenciales de fidelidad' };
  }
}

/**
 * Helper centralizado: suma +1 sello, verifica si llegó al límite configurado,
 * reinicia los sellos a 0 si alcanzó el premio y dispara notificación en tiempo real al panel admin.
 */
async function applyStampAndCheckLimit(
  supabase: any,
  businessId: string,
  loyalty: CustomerLoyaltyData
): Promise<{
  updatedCard: CustomerLoyaltyData;
  rewardReached: boolean;
  rewardTitle: string;
  required: number;
}> {
  const { data: biz } = await supabase
    .from('businesses')
    .select('loyalty_stamps_required, loyalty_reward_title')
    .eq('id', businessId)
    .maybeSingle();

  const required = Math.max(1, Number(biz?.loyalty_stamps_required) || 5);
  const rewardTitle = biz?.loyalty_reward_title?.trim() || '¡Premio de Fidelidad!';

  const incrementedStamps = (loyalty.stamps_count || 0) + 1;
  const newTotalEarned = (loyalty.total_stamps_earned || 0) + 1;
  const rewardReached = incrementedStamps >= required;

  const finalStampsCount = rewardReached ? 0 : incrementedStamps;
  const finalRewardsRedeemed = rewardReached
    ? (loyalty.rewards_redeemed || 0) + 1
    : (loyalty.rewards_redeemed || 0);

  const { data: updated, error: updateErr } = await supabase
    .from('customer_loyalty')
    .update({
      stamps_count: finalStampsCount,
      total_stamps_earned: newTotalEarned,
      rewards_redeemed: finalRewardsRedeemed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', loyalty.id)
    .select('*')
    .single();

  if (updateErr) throw updateErr;

  if (rewardReached) {
    const displayName = loyalty.customer_name?.trim() || loyalty.customer_email;
    const dniInfo = loyalty.customer_dni ? ` (DNI ${loyalty.customer_dni})` : '';

    await supabase.from('notifications').insert({
      business_id: businessId,
      type: 'loyalty_reward_reached',
      title: '🎁 ¡Premio de Fidelidad Alcanzado!',
      description: `${displayName}${dniInfo} completó ${required}/${required} sellos y ganó: ${rewardTitle}. Sus sellos se reiniciaron a 0.`,
      reference_id: loyalty.id,
      reference_type: 'customer_loyalty',
    });
  }

  return {
    updatedCard: updated as CustomerLoyaltyData,
    rewardReached,
    rewardTitle,
    required,
  };
}

/**
 * Acredita un sello automáticamente cuando el cliente realiza una compra desde la app.
 */
export async function awardStampFromOrder(businessId: string, phone?: string, email?: string) {
  try {
    let supabase: any;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    // 1. Verificar si el negocio tiene habilitado el programa de sellos
    const { data: biz } = await supabase
      .from('businesses')
      .select('loyalty_enabled')
      .eq('id', businessId)
      .maybeSingle();

    if (!biz || !biz.loyalty_enabled) {
      return { success: false, reason: 'disabled' };
    }

    let customerLoyalty: any = null;

    // 2. Buscar por email si está disponible
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const { data } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('business_id', businessId)
        .eq('customer_email', cleanEmail)
        .maybeSingle();
      if (data) customerLoyalty = data;
    }

    // 3. Si no se encontró por email, buscar por teléfono
    if (!customerLoyalty && phone && phone.trim()) {
      const cleanPhone = phone.trim();
      const { data: candidates } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('business_id', businessId)
        .not('customer_phone', 'is', null);

      if (candidates && candidates.length > 0) {
        customerLoyalty = candidates.find((c: any) => arePhonesMatching(cleanPhone, c.customer_phone || ''));
      }
    }

    // Si no está registrado en fidelidad, no sumamos
    if (!customerLoyalty) {
      return { success: false, reason: 'customer_not_found' };
    }

    // 4. Intentar registrar el sello del día
    const today = new Date().toISOString().split('T')[0];
    const { error: logError } = await supabase
      .from('loyalty_stamps_log')
      .insert({
        business_id: businessId,
        loyalty_id: customerLoyalty.id,
        stamp_date: today,
      });

    if (logError) {
      // Ya sumó sello hoy
      return { success: true, awarded: false, alreadyStampedToday: true };
    }

    // 5. Incrementar sellos, reiniciar si alcanzó el límite y notificar al admin
    const { updatedCard, rewardReached } = await applyStampAndCheckLimit(
      supabase,
      businessId,
      customerLoyalty
    );

    return {
      success: true,
      awarded: true,
      stampsCount: updatedCard.stamps_count,
      rewardReached,
    };
  } catch (err: any) {
    console.error('Error in awardStampFromOrder:', err);
    return { success: false, error: err.message };
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

    // 3. Incrementar sellos, reiniciar si alcanzó el límite y notificar
    const { updatedCard, rewardReached, rewardTitle } = await applyStampAndCheckLimit(
      supabase,
      businessId,
      loyalty
    );

    return {
      success: true,
      alreadyStampedToday: false,
      rewardReached,
      card: {
        ...updatedCard,
        hasStampedToday: true,
      } as CustomerLoyaltyData,
      message: rewardReached
        ? `🎁 ¡Felicitaciones! Completaste tu tarjeta y ganaste: ${rewardTitle}. Tus sellos se reiniciaron para volver a empezar.`
        : '🎉 ¡Excelente! Sumaste 1 sello por tu visita de hoy.',
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

    const { updatedCard, rewardReached, rewardTitle } = await applyStampAndCheckLimit(
      supabase,
      businessId,
      loyalty
    );

    revalidatePath('/fidelidad');
    return { success: true, card: updatedCard, rewardReached, rewardTitle };
  } catch (err: any) {
    console.error('Error in manualAddStamp:', err);
    return { error: err.message || 'Error al otorgar sello' };
  }
}

/**
 * Crea una solicitud de sello (pendiente de aprobación en caja) cuando el cliente escanea el QR fijo del local.
 */
export async function requestStampApproval(businessId: string, loyaltyId: string) {
  try {
    let supabase: any;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    // 1. Verificar tarjeta del cliente
    const { data: loyalty, error: fetchErr } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('id', loyaltyId)
      .eq('business_id', businessId)
      .single();

    if (fetchErr || !loyalty) {
      return { error: 'No se encontró tu tarjeta de fidelidad.' };
    }

    // 2. Verificar si ya sumó sello hoy
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStamp } = await supabase
      .from('loyalty_stamps_log')
      .select('id')
      .eq('loyalty_id', loyalty.id)
      .eq('stamp_date', today)
      .maybeSingle();

    if (todayStamp) {
      return {
        alreadyStampedToday: true,
        error: '¡Ya sumaste tu sello de hoy! Volvé mañana para sumar otro.',
      };
    }

    // 3. Evitar solicitudes duplicadas en los últimos 3 minutos
    const threeMinAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data: existingReq } = await supabase
      .from('loyalty_stamp_requests')
      .select('id, status, created_at')
      .eq('business_id', businessId)
      .eq('loyalty_id', loyalty.id)
      .eq('status', 'pending')
      .gte('created_at', threeMinAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingReq) {
      return { success: true, requestId: existingReq.id, reused: true };
    }

    // 4. Crear solicitud pendiente
    const { data: newReq, error: reqErr } = await supabase
      .from('loyalty_stamp_requests')
      .insert({
        business_id: businessId,
        loyalty_id: loyalty.id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (reqErr) throw reqErr;

    // 5. Disparar notificación en tiempo real al panel admin
    const displayName = loyalty.customer_name?.trim() || loyalty.customer_email;
    const dniInfo = loyalty.customer_dni ? ` (DNI ${loyalty.customer_dni})` : '';

    const { error: notifErr } = await supabase
      .from('notifications')
      .insert({
        business_id: businessId,
        type: 'stamp_request',
        title: '🎟️ Solicitud de Sello',
        description: `${displayName}${dniInfo} escaneó el QR y solicita sumar 1 sello.`,
        reference_id: newReq.id,
        reference_type: 'loyalty_stamp_request',
      });

    if (notifErr) {
      console.error('Error creating stamp notification:', notifErr);
    }

    return { success: true, requestId: newReq.id };
  } catch (err: any) {
    console.error('Error in requestStampApproval:', err);
    return { error: err.message || 'Error al enviar la solicitud de sello' };
  }
}

/**
 * Consulta el estado de una solicitud de sello desde la tarjeta del cliente.
 */
export async function getStampRequestStatus(requestId: string) {
  try {
    let supabase: any;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    const { data: req, error } = await supabase
      .from('loyalty_stamp_requests')
      .select('id, status, loyalty_id, created_at')
      .eq('id', requestId)
      .single();

    if (error || !req) {
      return { status: 'expired' as const };
    }

    // Si lleva más de 3 minutos pendiente, considerarla vencida
    const ageMs = Date.now() - new Date(req.created_at).getTime();
    if (req.status === 'pending' && ageMs > 3 * 60 * 1000) {
      await supabase
        .from('loyalty_stamp_requests')
        .update({ status: 'expired', resolved_at: new Date().toISOString() })
        .eq('id', requestId);
      return { status: 'expired' as const };
    }

    if (req.status === 'approved') {
      const { data: card } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('id', req.loyalty_id)
        .single();

      return {
        status: 'approved' as const,
        card: card ? ({ ...card, hasStampedToday: true } as CustomerLoyaltyData) : null,
      };
    }

    return { status: req.status as 'pending' | 'rejected' | 'expired' };
  } catch (err: any) {
    console.error('Error in getStampRequestStatus:', err);
    return { status: 'pending' as const };
  }
}

/**
 * Aprueba una solicitud de sello desde el panel admin, acreditando +1 sello al cliente.
 */
export async function approveStampRequest(
  requestId: string,
  businessId: string,
  notificationId?: string
) {
  try {
    let supabase: any;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    const { data: req, error: reqErr } = await supabase
      .from('loyalty_stamp_requests')
      .select('*')
      .eq('id', requestId)
      .eq('business_id', businessId)
      .single();

    if (reqErr || !req) {
      return { error: 'Solicitud no encontrada.' };
    }

    if (req.status === 'approved') {
      if (notificationId) {
        await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
      }
      return { success: true, alreadyApproved: true };
    }

    if (req.status === 'rejected') {
      return { error: 'Esta solicitud ya fue rechazada.' };
    }

    // 1. Obtener tarjeta del cliente
    const { data: loyalty, error: loyErr } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('id', req.loyalty_id)
      .single();

    if (loyErr || !loyalty) {
      return { error: 'Tarjeta de cliente no encontrada.' };
    }

    // 2. Registrar log diario (tolerando si ya existía)
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('loyalty_stamps_log')
      .insert({
        business_id: businessId,
        loyalty_id: loyalty.id,
        stamp_date: today,
      });

    // 3. Sumar +1 sello, reiniciar si llegó al límite y notificar
    const { rewardReached, rewardTitle } = await applyStampAndCheckLimit(
      supabase,
      businessId,
      loyalty
    );

    // 4. Marcar solicitud como aprobada
    await supabase
      .from('loyalty_stamp_requests')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', requestId);

    // 5. Marcar notificación como leída
    if (notificationId) {
      await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    } else {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('reference_id', requestId)
        .eq('business_id', businessId);
    }

    revalidatePath('/fidelidad');
    return { success: true, rewardReached, rewardTitle };
  } catch (err: any) {
    console.error('Error in approveStampRequest:', err);
    return { error: err.message || 'Error al aprobar el sello' };
  }
}

/**
 * Rechaza una solicitud de sello desde el panel admin.
 */
export async function rejectStampRequest(
  requestId: string,
  businessId: string,
  notificationId?: string
) {
  try {
    let supabase: any;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    await supabase
      .from('loyalty_stamp_requests')
      .update({ status: 'rejected', resolved_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('business_id', businessId);

    if (notificationId) {
      await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    } else {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('reference_id', requestId)
        .eq('business_id', businessId);
    }

    revalidatePath('/fidelidad');
    return { success: true };
  } catch (err: any) {
    console.error('Error in rejectStampRequest:', err);
    return { error: err.message || 'Error al rechazar la solicitud' };
  }
}

/**
 * CRUD Admin: Crear cliente de fidelización manualmente.
 */
export async function createLoyaltyCustomer(
  businessId: string,
  payload: {
    customer_email: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_dni?: string | null;
    customer_birthday?: string | null;
    stamps_count?: number;
  }
) {
  try {
    const supabase = await createClient();
    const cleanEmail = (payload.customer_email || '').trim().toLowerCase();
    const cleanDni = payload.customer_dni ? normalizeDni(payload.customer_dni) : null;
    const stamps = Math.max(0, Number(payload.stamps_count) || 0);

    if (!cleanEmail) {
      return { error: 'El email es obligatorio.' };
    }

    const { data: existing } = await supabase
      .from('customer_loyalty')
      .select('id')
      .eq('business_id', businessId)
      .eq('customer_email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return { error: 'Ya existe un cliente registrado con ese email.' };
    }

    const { data, error } = await supabase
      .from('customer_loyalty')
      .insert({
        business_id: businessId,
        customer_email: cleanEmail,
        customer_name: payload.customer_name?.trim() || null,
        customer_phone: payload.customer_phone?.trim() || null,
        customer_dni: cleanDni || null,
        customer_birthday: payload.customer_birthday?.trim() || null,
        stamps_count: stamps,
        total_stamps_earned: stamps,
        rewards_redeemed: 0,
      })
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/fidelidad');
    revalidatePath('/dashboard');
    return { success: true, card: data as CustomerLoyaltyData };
  } catch (err: any) {
    console.error('Error in createLoyaltyCustomer:', err);
    return { error: err.message || 'Error al crear el cliente' };
  }
}

/**
 * CRUD Admin: Actualizar datos, DNI, cumpleaños o cantidad de sellos de un cliente.
 */
export async function updateLoyaltyCustomer(
  loyaltyId: string,
  businessId: string,
  payload: {
    customer_email?: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_dni?: string | null;
    customer_birthday?: string | null;
    stamps_count?: number;
    rewards_redeemed?: number;
  }
) {
  try {
    const supabase = await createClient();
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.customer_email !== undefined) {
      const cleanEmail = payload.customer_email.trim().toLowerCase();
      if (!cleanEmail) return { error: 'El email no puede estar vacío.' };
      updateData.customer_email = cleanEmail;
    }
    if (payload.customer_name !== undefined) {
      updateData.customer_name = payload.customer_name?.trim() || null;
    }
    if (payload.customer_phone !== undefined) {
      updateData.customer_phone = payload.customer_phone?.trim() || null;
    }
    if (payload.customer_dni !== undefined) {
      updateData.customer_dni = payload.customer_dni ? normalizeDni(payload.customer_dni) : null;
    }
    if (payload.customer_birthday !== undefined) {
      updateData.customer_birthday = payload.customer_birthday?.trim() || null;
    }
    if (payload.stamps_count !== undefined) {
      updateData.stamps_count = Math.max(0, Number(payload.stamps_count) || 0);
    }
    if (payload.rewards_redeemed !== undefined) {
      updateData.rewards_redeemed = Math.max(0, Number(payload.rewards_redeemed) || 0);
    }

    const { data, error } = await supabase
      .from('customer_loyalty')
      .update(updateData)
      .eq('id', loyaltyId)
      .eq('business_id', businessId)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/fidelidad');
    revalidatePath('/dashboard');
    return { success: true, card: data as CustomerLoyaltyData };
  } catch (err: any) {
    console.error('Error in updateLoyaltyCustomer:', err);
    return { error: err.message || 'Error al actualizar el cliente' };
  }
}

/**
 * CRUD Admin: Eliminar cliente del programa de fidelización.
 */
export async function deleteLoyaltyCustomer(loyaltyId: string, businessId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('customer_loyalty')
      .delete()
      .eq('id', loyaltyId)
      .eq('business_id', businessId);

    if (error) throw error;

    revalidatePath('/fidelidad');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Error in deleteLoyaltyCustomer:', err);
    return { error: err.message || 'Error al eliminar el cliente' };
  }
}
