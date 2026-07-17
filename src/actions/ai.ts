'use server';

// 1. Importar el cliente de Supabase para el servidor.
// Aquí traemos la función que nos permite interactuar con la base de datos de Supabase desde un entorno seguro (el servidor).
import { createClient } from '@/lib/supabase/server';

// 2. Definir la interfaz TypeScript para las categorías.
// Esta interfaz asegura que los datos devueltos por la IA tengan siempre la misma estructura.
interface AICategory {
  name: string;
  icon?: string;
  products: {
    name: string;
    description: string;
    price: number;
  }[];
}

// ============================================================================
// Función: importMenuAI
// Qué hace: Analiza una imagen o archivo de un menú utilizando la API de Gemini (Inteligencia Artificial) y extrae las categorías y productos en formato JSON.
// Por qué existe: Para automatizar y facilitar la carga de productos de un restaurante a partir de una simple foto de un menú físico.
// Quién la llama: Es llamada desde un Client Component en el dashboard del usuario tras subir una imagen (por ejemplo, desde un asistente de creación).
// Qué parámetros recibe:
//   - businessId (string): El identificador único del negocio.
//   - fileUrl (string): La URL del archivo/imagen del menú que se va a procesar.
//   - mimeType (string): El tipo MIME del archivo (ej. 'image/jpeg') para saber cómo procesarlo.
// Qué devuelve: Retorna un objeto con la propiedad `data` (conteniendo las categorías procesadas) o `error` (en caso de fallo).
// Qué tabla de Supabase utiliza: Autenticación (para verificar que el usuario esté logueado).
// Qué consulta SQL equivalente ejecutaría:
//   SELECT * FROM auth.users WHERE id = 'token_del_usuario';
// Qué ocurre si falla: El bloque catch captura el error y devuelve un objeto con el mensaje de error ({ error: 'mensaje' }).
// Qué conceptos de Next.js intervienen: Server Actions ('use server').
// Qué conceptos de TypeScript aparecen: Interfaces (AICategory), tipado de parámetros, Record<string, unknown>.
// Qué conceptos de JavaScript aparecen: Async/Await, try/catch, variables de entorno (process.env), Buffer (Node.js), fetch, RegEx, JSON.parse.
// Qué buenas prácticas se están utilizando:
//   - Early return (retorno temprano) si el usuario no está autenticado.
//   - Manejo de variables de entorno seguras en el servidor.
//   - Uso de un bloque try/catch general para evitar crasheos del servidor.
//   - Fallback (datos de prueba) para cuando la API Key no está configurada, permitiendo continuar el desarrollo.
// ============================================================================
export async function importMenuAI(businessId: string, fileUrl: string, mimeType: string) {
  try {
    // 3. Crear cliente de Supabase y validar permisos.
    // Verificamos que quien está ejecutando la acción sea un usuario autenticado real.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    // 4. Obtener la clave de la API.
    // Buscamos la llave secreta para conectarnos a Google Gemini desde las variables de entorno del servidor.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // 5. Verificar si existe la clave de la API.
    // Si no tenemos configurada la clave en nuestro archivo .env, retornamos datos de prueba (mock) en lugar de fallar.
    if (!GEMINI_API_KEY) {
      return { error: 'La API Key de Gemini no está configurada.' };
    }

    // 6. Preparar los datos del archivo para la IA.
    // Si el archivo es una imagen, lo descargamos (fetch), lo convertimos a formato binario (ArrayBuffer) 
    // y luego a texto codificado en Base64 para poder enviarlo a la API de Gemini.
    const isImage = mimeType?.startsWith('image/');
    let inlineData: Record<string, unknown> | null = null;

    if (isImage) {
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      inlineData = {
        mimeType: mimeType,
        data: base64Data,
      };
    }

    // 7. Construir el cuerpo de la petición (Payload).
    // Aquí definimos el prompt estricto (instrucciones) y adjuntamos la imagen (si la hay) para la IA.
    const parts: any[] = [];
    if (inlineData) {
      parts.push({ inlineData });
    }
    parts.push({
      text: `Analizá esta carta de restaurante y extraé toda la información en formato JSON.
              
Devolvé ÚNICAMENTE un JSON válido con esta estructura (sin markdown, sin explicaciones):
{
  "categories": [
    {
      "name": "Nombre de la categoría",
      "icon": "emoji representativo",
      "products": [
        {
          "name": "Nombre del producto",
          "description": "Descripción breve",
          "price": 0.00
        }
      ]
    }
  ]
}

Reglas:
- Si hay categorías, agrupá los productos en ellas
- Si no hay categorías explícitas, creá categorías lógicas
- Los precios deben ser números (float), sin símbolo de moneda
- Si no hay precio visible, usá 0
- Los emojis de íconos deben ser representativos del tipo de comida
- La descripción debe ser corta (máximo 80 caracteres)
- Respondé siempre en español`
    });

    // 8. Llamar a la API de Inteligencia Artificial (Gemini).
    // Realizamos una petición segura hacia Google con la clave y el cuerpo creado.
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
    });

    // 10. Extraer y procesar la respuesta textual de Gemini.
    const rawText = response.text || '';

    // 11. Limpiar y validar el JSON devuelto.
    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: 'La IA no devolvió un JSON válido' };
    }

    // 12. Retornar el resultado final.
    const parsed = JSON.parse(jsonMatch[0]);
    return { data: parsed };
  } catch (err: any) {
    // 13. Manejo de errores fatales.
    // Si algo falla en todo el proceso (ej. red caída, archivo corrupto), se captura aquí sin colgar el servidor.
    console.error('importMenuAI error:', err);
    return { error: err.message || 'Error interno del servidor' };
  }
}
// ============================================================================
// RESUMEN DE LA FUNCIÓN
// ============================================================================
// • Objetivo: Automatizar la creación de menús extrayendo productos y precios de imágenes utilizando la IA de Gemini.
// • Flujo paso a paso: Verifica el usuario -> Revisa si hay API Key -> Descarga la imagen y la convierte a base64 -> Envía la imagen y un prompt estricto a Gemini -> Extrae el JSON devuelto de la respuesta -> Lo devuelve al cliente.
// • Datos que entran: ID del negocio, URL pública de la imagen subida, tipo MIME de la imagen.
// • Datos que salen: Un objeto con un array estructurado de categorías y productos listos para ser guardados.
// • Errores posibles: Usuario no autenticado, falta de API Key (retorna mock), falla de red de Google, la IA devuelve texto plano en lugar de un JSON válido.
// • Qué aprender de esta función: Cómo estructurar un Server Action en Next.js, cómo procesar archivos binarios en el servidor (Buffer), el manejo preventivo de fallos al integrarse con APIs externas de IA (uso de Regex y mocks), y cómo diseñar un prompt de sistema robusto pidiendo formato JSON estricto.
