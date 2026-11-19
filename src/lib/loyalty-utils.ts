export const DEFAULT_LOYALTY_WA_MESSAGE = 
  '¡Hola {cliente}! 👋 Te escribimos de *{negocio}* para contarte que tenés disponible tu beneficio: *{beneficio}* 🎁. ¡Te esperamos para disfrutarlo!';

export const DEFAULT_BIRTHDAY_BENEFIT =
  '¡20% OFF o Postre Gratis en tu semana de cumpleaños!';

export const DEFAULT_BIRTHDAY_WA_MESSAGE =
  '¡Hola {cliente}! 🎂🎉 En *{negocio}* sabemos que se acerca tu cumpleaños ({fecha_cumple}) y queremos festejarlo con vos. Tenés un regalo especial: *{beneficio}* 🎁. ¡Te esperamos para celebrar!';

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

/**
 * Normaliza un número de DNI dejando solo dígitos (ej: "38.456.789" -> "38456789").
 */
export function normalizeDni(rawDni: string): string {
  return (rawDni || '').replace(/\D/g, '');
}

/**
 * Compara dos DNIs normalizados.
 */
export function areDnisMatching(dni1: string, dni2: string): boolean {
  const d1 = normalizeDni(dni1);
  const d2 = normalizeDni(dni2);
  if (!d1 || !d2) return false;
  return d1 === d2;
}

const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Parsea YYYY-MM-DD sin problemas de zona horaria.
 */
function parseDateParts(dateStr: string | null | undefined): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const clean = String(dateStr).trim().split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

/**
 * Calcula cuántos días faltan para el próximo cumpleaños (0 = hoy, 1 = mañana, etc.).
 * Maneja correctamente cambios de año (diciembre -> enero) y años bisiestos (29 de febrero).
 */
export function getDaysUntilBirthday(birthdayStr: string | null | undefined, referenceDate?: Date): number | null {
  const parts = parseDateParts(birthdayStr);
  if (!parts) return null;

  const now = referenceDate ? new Date(referenceDate) : new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const makeBirthdayDate = (targetYear: number) => {
    const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
    const adjustedDay = parts.month === 2 && parts.day === 29 && !isLeap ? 28 : parts.day;
    return new Date(targetYear, parts.month - 1, adjustedDay);
  };

  let nextBirthday = makeBirthdayDate(today.getFullYear());
  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday = makeBirthdayDate(today.getFullYear() + 1);
  }

  const diffMs = nextBirthday.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formatea el día y mes del cumpleaños (ej: "24 de noviembre").
 */
export function formatBirthdayShort(birthdayStr: string | null | undefined): string {
  const parts = parseDateParts(birthdayStr);
  if (!parts) return '';
  return `${parts.day} de ${MONTH_NAMES_ES[parts.month - 1]}`;
}

/**
 * Formatea fecha completa DD/MM/YYYY para tablas.
 */
export function formatBirthdayNumeric(birthdayStr: string | null | undefined): string {
  const parts = parseDateParts(birthdayStr);
  if (!parts) return '';
  const dd = String(parts.day).padStart(2, '0');
  const mm = String(parts.month).padStart(2, '0');
  return `${dd}/${mm}/${parts.year}`;
}

/**
 * Calcula la edad que cumplirá en su próximo cumpleaños.
 */
export function getTurningAge(birthdayStr: string | null | undefined, referenceDate?: Date): number | null {
  const parts = parseDateParts(birthdayStr);
  if (!parts || parts.year < 1900) return null;
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYearBday = new Date(today.getFullYear(), parts.month - 1, parts.day);
  const targetYear = thisYearBday.getTime() < today.getTime() ? today.getFullYear() + 1 : today.getFullYear();
  const age = targetYear - parts.year;
  return age > 0 && age < 130 ? age : null;
}

export interface UpcomingBirthdayItem<T = any> {
  subscriber: T;
  daysUntil: number;
  formattedDate: string;
  turningAge: number | null;
}

/**
 * Filtra y ordena los suscriptores que cumplen años dentro de los próximos `daysAhead` días (por defecto 7 días = 1 semana).
 */
export function getUpcomingBirthdays<T extends { customer_birthday?: string | null }>(
  subscribers: T[],
  daysAhead = 7,
  referenceDate?: Date
): UpcomingBirthdayItem<T>[] {
  const list: UpcomingBirthdayItem<T>[] = [];
  for (const sub of subscribers) {
    const daysUntil = getDaysUntilBirthday(sub.customer_birthday, referenceDate);
    if (daysUntil !== null && daysUntil >= 0 && daysUntil <= daysAhead) {
      list.push({
        subscriber: sub,
        daysUntil,
        formattedDate: formatBirthdayShort(sub.customer_birthday),
        turningAge: getTurningAge(sub.customer_birthday, referenceDate),
      });
    }
  }
  return list.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Genera el mensaje final de cumpleaños reemplazando variables dinámicas.
 */
export function buildBirthdayMessage(
  template: string | null | undefined,
  params: {
    clientName: string;
    businessName: string;
    benefit: string;
    birthdayDate?: string;
  }
): string {
  const tpl = (template || '').trim() || DEFAULT_BIRTHDAY_WA_MESSAGE;
  return tpl
    .replace(/{cliente}/gi, params.clientName || 'Cliente')
    .replace(/{negocio}/gi, params.businessName || 'nuestro local')
    .replace(/{beneficio}/gi, params.benefit || DEFAULT_BIRTHDAY_BENEFIT)
    .replace(/{premio}/gi, params.benefit || DEFAULT_BIRTHDAY_BENEFIT)
    .replace(/{fecha_cumple}/gi, params.birthdayDate || 'pronto');
}


