/**
 * soundPlayer.ts
 * Motor de audio profesional para alertas de pedidos, llamados de mozo y cuentas.
 * Permite seleccionar entre múltiples tonos y configurar la duración e intensidad de 1 a 10 segundos.
 */

export type NotificationToneId = 
  | 'chime_classic' 
  | 'restaurant_bell' 
  | 'kitchen_urgent' 
  | 'service_dingdong' 
  | 'digital_radar';

export interface SoundOption {
  id: NotificationToneId;
  name: string;
  description: string;
  badge: string;
  iconName: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'chime_classic',
    name: 'Campana Clásica (Google Chime)',
    description: 'Timbre melódico suave, claro y profesional.',
    badge: 'Estándar',
    iconName: 'Bell',
  },
  {
    id: 'restaurant_bell',
    name: 'Timbre Continuo de Restaurante',
    description: 'Campana de mostrador tradicional con repique sostenido.',
    badge: 'Tradicional',
    iconName: 'BellRing',
  },
  {
    id: 'kitchen_urgent',
    name: 'Alerta Intensa de Cocina / Salón',
    description: 'Tono doble penetrante y de alta intensidad para ambientes ruidosos.',
    badge: 'Alta Atención',
    iconName: 'Volume2',
  },
  {
    id: 'service_dingdong',
    name: 'Ding-Dong Doble de Servicio',
    description: 'Doble campana acústica tradicional de dos tiempos.',
    badge: 'Elegante',
    iconName: 'Sparkles',
  },
  {
    id: 'digital_radar',
    name: 'Radar / Pulso Moderno',
    description: 'Pulsos electrónicos rítmicos de frecuencia ascendente.',
    badge: 'Moderno',
    iconName: 'Radio',
  },
];

// Estado global de audio para poder detener el sonido en cualquier momento
let activeStopCallbacks: Array<() => void> = [];
let activeIntervals: Array<NodeJS.Timeout | number> = [];
let activeTimeouts: Array<NodeJS.Timeout | number> = [];

/**
 * Detiene inmediatamente cualquier sonido o vibración que esté sonando.
 */
export function stopNotificationSound() {
  activeStopCallbacks.forEach(cb => {
    try { cb(); } catch {}
  });
  activeStopCallbacks = [];

  activeIntervals.forEach(id => clearInterval(id as any));
  activeIntervals = [];

  activeTimeouts.forEach(id => clearTimeout(id as any));
  activeTimeouts = [];

  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(0); } catch {}
  }
}

/**
 * Obtiene el contexto de audio del navegador de forma segura
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Sintetizador: Campana Clásica (Acorde armónico A5 - E6)
 */
function playToneClassic(ctx: AudioContext, gainNode: GainNode) {
  const now = ctx.currentTime;
  const freqs = [880, 1320, 1760]; // A5, E6, A6

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    const start = now + idx * 0.08;
    noteGain.gain.setValueAtTime(0.35 / (idx + 1), start);
    noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);

    osc.connect(noteGain);
    noteGain.connect(gainNode);

    osc.start(start);
    osc.stop(start + 0.7);
  });
}

/**
 * Sintetizador: Timbre Metálico de Mostrador
 */
function playToneRestaurantBell(ctx: AudioContext, gainNode: GainNode) {
  const now = ctx.currentTime;
  // Frecuencias metálicas con armónicos inarmónicos típicos de campana de bronce
  const freqs = [1568, 2093, 2793, 3136];

  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(f, now);

    noteGain.gain.setValueAtTime(0.25 / (i + 1), now);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(noteGain);
    noteGain.connect(gainNode);

    osc.start(now);
    osc.stop(now + 0.5);
  });
}

/**
 * Sintetizador: Alerta Intensa de Cocina (Dual-frequency penetrante)
 */
function playToneKitchenUrgent(ctx: AudioContext, gainNode: GainNode) {
  const now = ctx.currentTime;
  const freqs = [980, 1470];

  freqs.forEach(f => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, now);

    noteGain.gain.setValueAtTime(0.2, now);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(noteGain);
    noteGain.connect(gainNode);

    osc.start(now);
    osc.stop(now + 0.3);
  });
}

/**
 * Sintetizador: Ding-Dong Melódico de Servicio
 */
function playToneServiceDingDong(ctx: AudioContext, gainNode: GainNode) {
  const now = ctx.currentTime;
  
  // "Ding" (C6 - 1046 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1046.5, now);
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc1.connect(gain1);
  gain1.connect(gainNode);
  osc1.start(now);
  osc1.stop(now + 0.55);

  // "Dong" (G5 - 783.99 Hz) 250ms después
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(783.99, now + 0.25);
  gain2.gain.setValueAtTime(0.4, now + 0.25);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  osc2.connect(gain2);
  gain2.connect(gainNode);
  osc2.start(now + 0.25);
  osc2.stop(now + 0.95);
}

/**
 * Sintetizador: Radar / Pulso Digital
 */
function playToneDigitalRadar(ctx: AudioContext, gainNode: GainNode) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(550, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.22);

  noteGain.gain.setValueAtTime(0.3, now);
  noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(noteGain);
  noteGain.connect(gainNode);

  osc.start(now);
  osc.stop(now + 0.28);
}

/**
 * Reproduce una nota individual según el tono seleccionado
 */
function triggerSingleNote(tone: NotificationToneId, ctx: AudioContext, masterGain: GainNode) {
  switch (tone) {
    case 'restaurant_bell':
      playToneRestaurantBell(ctx, masterGain);
      break;
    case 'kitchen_urgent':
      playToneKitchenUrgent(ctx, masterGain);
      break;
    case 'service_dingdong':
      playToneServiceDingDong(ctx, masterGain);
      break;
    case 'digital_radar':
      playToneDigitalRadar(ctx, masterGain);
      break;
    case 'chime_classic':
    default:
      playToneClassic(ctx, masterGain);
      break;
  }
}

/**
 * Intervalo de repetición en milisegundos para cada tono
 */
function getToneIntervalMs(tone: NotificationToneId): number {
  switch (tone) {
    case 'restaurant_bell': return 450;
    case 'kitchen_urgent': return 400;
    case 'service_dingdong': return 1100;
    case 'digital_radar': return 550;
    case 'chime_classic':
    default: return 900;
  }
}

export interface PlayNotificationSoundOptions {
  tone?: NotificationToneId | string;
  durationSeconds?: number;
  vibrate?: boolean;
  volume?: number;
}

/**
 * Reproduce el sonido de notificación configurado con duración de 1 a 10 segundos
 */
export function playNotificationSound({
  tone = 'chime_classic',
  durationSeconds = 5,
  vibrate = true,
  volume = 0.8,
}: PlayNotificationSoundOptions = {}) {
  // Detener cualquier sonido previo
  stopNotificationSound();

  const validTone = (['chime_classic', 'restaurant_bell', 'kitchen_urgent', 'service_dingdong', 'digital_radar'].includes(tone)
    ? tone 
    : 'chime_classic') as NotificationToneId;

  // Clampear duración de 1 a 10 segundos
  const clampedDuration = Math.max(1, Math.min(10, Math.round(durationSeconds)));
  const totalMs = clampedDuration * 1000;

  // 1. Manejo de Vibración para tablet / celular si está habilitado
  if (vibrate && typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Generar patrón de vibración que cubra exactamente totalMs
      const pattern: number[] = [];
      let elapsed = 0;
      while (elapsed < totalMs) {
        pattern.push(250); // Vibrar 250ms
        pattern.push(150); // Pausa 150ms
        elapsed += 400;
      }
      navigator.vibrate(pattern);
    } catch {}
  }

  // 2. Intentar reproducir con Web Audio API sintetizado para exactitud y cero latencia
  const ctx = getAudioContext();
  if (ctx) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Reproducir primera vez de inmediato
    triggerSingleNote(validTone, ctx, masterGain);

    const intervalMs = getToneIntervalMs(validTone);

    // Si la duración es mayor al intervalo de una sola nota, repetir periódicamente hasta agotar totalMs
    if (totalMs > intervalMs) {
      const intervalId = setInterval(() => {
        if (ctx.state === 'running') {
          triggerSingleNote(validTone, ctx, masterGain);
        }
      }, intervalMs);
      activeIntervals.push(intervalId);
    }

    // Programar detención exacta al cumplirse los N segundos
    const timeoutId = setTimeout(() => {
      stopNotificationSound();
    }, totalMs);
    activeTimeouts.push(timeoutId);

    activeStopCallbacks.push(() => {
      try {
        masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        setTimeout(() => {
          ctx.close().catch(() => {});
        }, 150);
      } catch {}
    });

    return;
  }

  // 3. Fallback con archivo de audio estándar si Web Audio no estuviera disponible
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = volume;
    audio.play().catch(() => {});

    if (totalMs > 1500) {
      const loopInterval = setInterval(() => {
        try {
          const replayAudio = new Audio('/sounds/notification.mp3');
          replayAudio.volume = volume;
          replayAudio.play().catch(() => {});
        } catch {}
      }, 1200);
      activeIntervals.push(loopInterval);
    }

    const stopTimeout = setTimeout(() => {
      stopNotificationSound();
    }, totalMs);
    activeTimeouts.push(stopTimeout);
  } catch {}
}

/**
 * Obtiene la configuración de sonido guardada en el dispositivo
 */
export function getStoredSoundSettings(): { tone: NotificationToneId; duration: number } {
  if (typeof window === 'undefined') {
    return { tone: 'chime_classic', duration: 5 };
  }
  try {
    const tone = (localStorage.getItem('mamba_sound_tone') || 'chime_classic') as NotificationToneId;
    const rawDur = localStorage.getItem('mamba_sound_duration');
    const duration = rawDur ? parseInt(rawDur, 10) : 5;
    return {
      tone: ['chime_classic', 'restaurant_bell', 'kitchen_urgent', 'service_dingdong', 'digital_radar'].includes(tone)
        ? tone 
        : 'chime_classic',
      duration: Math.max(1, Math.min(10, isNaN(duration) ? 5 : duration)),
    };
  } catch {
    return { tone: 'chime_classic', duration: 5 };
  }
}

/**
 * Guarda la configuración de sonido en localStorage para acceso inmediato del navegador
 */
export function saveStoredSoundSettings(tone: string, duration: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('mamba_sound_tone', tone);
    localStorage.setItem('mamba_sound_duration', String(duration));
  } catch {}
}
