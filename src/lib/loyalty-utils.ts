export const DEFAULT_LOYALTY_WA_MESSAGE = 
  '¡Hola {cliente}! 👋 Te escribimos de *{negocio}* para contarte que tenés disponible tu beneficio: *{beneficio}* 🎁. ¡Te esperamos para disfrutarlo!';

/**
 * Normaliza cualquier número de teléfono (local argentino o internacional)
 * al formato requerido por la API de WhatsApp (ej: 5491123456789).
 */
export function formatPhoneForWhatsApp(rawPhone: string): string {
  let digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';

  // Si empieza con 00 internacional, quitarlo
  if (digits.startsWith('00')) digits = digits.slice(2);

  // Si ya tiene el código completo de Argentina (549...)
  if (digits.startsWith('549')) {
    return digits;
  }

  // Si empieza con 54 pero le falta el 9 de celular
  if (digits.startsWith('54')) {
    const withoutCountry = digits.slice(2);
    // Si viene 54 11..., convertir a 54 9 11...
    if (withoutCountry.startsWith('9')) {
      return `54${withoutCountry}`;
    }
    // Si tiene 15 (ej: 54 15...), quitar el 15
    const cleanNum = withoutCountry.startsWith('15') ? withoutCountry.slice(2) : withoutCountry;
    return `549${cleanNum}`;
  }

  // Si empieza con 0 (ej: 011..., 0341...)
  if (digits.startsWith('0')) {
    let withoutZero = digits.slice(1);
    if (withoutZero.startsWith('15')) {
      withoutZero = withoutZero.slice(2);
    }
    return `549${withoutZero}`;
  }

  // Si empieza con 15 (ej: 1544445555)
  if (digits.startsWith('15') && digits.length === 10) {
    return `54911${digits.slice(2)}`;
  }

  // Si tiene 10 dígitos (ej: 1123456789 o 3412345678)
  if (digits.length === 10) {
    return `549${digits}`;
  }

  // Si tiene 8 dígitos (ej: 44445555), asumimos CABA/AMBA 11
  if (digits.length === 8) {
    return `54911${digits}`;
  }

  // Si tiene código de país internacional diferente (>10 dígitos)
  if (digits.length > 10) {
    return digits;
  }

  return `549${digits}`;
}

/**
 * Genera la URL para abrir WhatsApp con un mensaje predeterminado codificado.
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
}

/**
 * Compara dos números de teléfono de forma tolerante (mismo número con o sin prefijos internacionales, 15, 0, etc.)
 */
export function arePhonesMatching(phone1: string, phone2: string): boolean {
  const d1 = (phone1 || '').replace(/\D/g, '');
  const d2 = (phone2 || '').replace(/\D/g, '');
  if (!d1 || !d2) return false;
  if (d1 === d2) return true;
  // Comparar los últimos 8 o 9 dígitos
  const last8_1 = d1.slice(-8);
  const last8_2 = d2.slice(-8);
  return last8_1.length >= 7 && last8_1 === last8_2;
}

