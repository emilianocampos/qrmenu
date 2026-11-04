import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export interface AIProduct {
  name: string;
  description: string;
  price: number;
}

export interface AISubcategory {
  name: string;
  products: AIProduct[];
}

export interface AICategory {
  name: string;
  icon?: string;
  subcategories?: AISubcategory[];
  products?: AIProduct[];
}

export async function POST(req: NextRequest) {
  try {
    const { fileUrl, base64Data, fileName, mimeType } = await req.json();

    if (!fileUrl && !base64Data) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'La API Key de Gemini no está configurada.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Real Gemini Vision call
    const isImage = mimeType?.startsWith('image/');

    // Resolve base64 data
    let finalBase64 = base64Data;
    if (!finalBase64 && fileUrl) {
      finalBase64 = await fetchFileAsBase64(fileUrl);
    }

    const parts = [
      ...(isImage && finalBase64 ? [{
        inlineData: {
          mimeType: mimeType,
          data: finalBase64,
        },
      }] : []),
      {
        text: `Analizá esta carta o menú de restaurante y extraé toda la información estructurada en categorías, subcategorías y productos en formato JSON.
        
Devolvé ÚNICAMENTE un JSON válido con esta estructura (sin markdown, sin explicaciones, sin texto antes ni después):
{
  "categories": [
    {
      "name": "Nombre de la categoría principal (ej: MOSTRADOR, CAFETERÍA, BEBIDAS, POSTRES)",
      "icon": "emoji representativo",
      "subcategories": [
        {
          "name": "Nombre de la subcategoría (ej: COOKIES, PASTRY, LINGOTES, ECLAIRS, PORCIONES CLÁSICAS, LAMINADOS)",
          "products": [
            {
              "name": "Nombre del producto",
              "description": "Descripción, sabores o ingredientes si hay",
              "price": 0.00
            }
          ]
        }
      ],
      "products": []
    }
  ]
}

Reglas obligatorias:
- CATEGORÍAS Y SUBCATEGORÍAS:
  * Identificá la categoría principal (ej: "MOSTRADOR", "CAFETERÍA", "COCINA", etc.).
  * Si dentro de una categoría hay secciones secundarias, grupos o subtítulos (como "COOKIES", "PASTRY", "LINGOTES", "ECLAIRS", "PORCIONES CLÁSICAS", "LAMINADOS" dentro de "MOSTRADOR"), organizalos dentro de 'subcategories' con sus productos.
  * Si una categoría NO tiene divisiones secundarias, colocá los productos directamente en 'products' (o con subcategories vacía).
- PRECIOS:
  * Los precios deben ser números (float o int), sin símbolos de moneda ($) ni puntos de miles (ej: 4200, 6900, 11900, 10500, 3000).
  * Si no hay precio visible, usá 0.
- PRODUCTOS:
  * La descripción debe ser concisa (máximo 120 caracteres).
  * No inventes productos no presentes en la carta.
- FORMATO:
  * Emojis representativos en 'icon' (ej: 🧁 para pastelería, ☕ para café, 🍷 para vinos).
  * Respondé siempre en español.`
      },
    ];

    let response: any = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: parts,
        });
        break;
      } catch (genErr: any) {
        const isUnavailable =
          genErr?.message?.includes('503') ||
          genErr?.message?.includes('high demand') ||
          genErr?.message?.includes('UNAVAILABLE') ||
          genErr?.status === 503;

        if (isUnavailable && attempts < maxAttempts) {
          console.log(`Gemini ocupado (intento ${attempts}/${maxAttempts}), reintentando en ${attempts * 1500}ms...`);
          await new Promise(r => setTimeout(r, attempts * 1500));
        } else {
          throw genErr;
        }
      }
    }

    const rawText = response?.text || '';

    // Parse JSON from response (may be wrapped in ```json ... ```)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      try {
        const fs = require('fs');
        fs.writeFileSync('C:\\Users\\Emi\\Desktop\\carta_qr\\gemini_error.txt', 'No JSON found. Raw text:\n' + rawText);
      } catch (e) { }
      throw new Error('La IA no devolvió un JSON válido');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Normalize categories so subcategories and products are arrays
    if (Array.isArray(parsed.categories)) {
      parsed.categories = parsed.categories.map((cat: any) => {
        const subcategories: AISubcategory[] = Array.isArray(cat.subcategories)
          ? cat.subcategories.map((sub: any) => ({
              name: String(sub.name || 'General').trim(),
              products: Array.isArray(sub.products)
                ? sub.products.map((p: any) => ({
                    name: String(p.name || 'Producto').trim(),
                    description: p.description ? String(p.description).trim() : '',
                    price: Number(p.price) || 0,
                  }))
                : [],
            }))
          : [];

        const directProducts: AIProduct[] = Array.isArray(cat.products)
          ? cat.products.map((p: any) => ({
              name: String(p.name || 'Producto').trim(),
              description: p.description ? String(p.description).trim() : '',
              price: Number(p.price) || 0,
            }))
          : [];

        return {
          name: String(cat.name || 'Categoría').trim(),
          icon: cat.icon || '📋',
          subcategories,
          products: directProducts,
        };
      });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('AI import error:', err);
    try {
      const fs = require('fs');
      fs.writeFileSync('C:\\Users\\Emi\\Desktop\\carta_qr\\gemini_error.txt', 'Catch error:\n' + (err instanceof Error ? err.stack : String(err)));
    } catch (e) { }

    const errMsg = err instanceof Error ? err.message : String(err);
    const is503 = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');

    const clientMsg = is503
      ? 'El servicio de IA de Google está con alta demanda temporal. Por favor, volvé a hacer clic en "Analizar con IA" en unos segundos.'
      : (err instanceof Error ? err.message : 'Error interno al procesar el archivo');

    return NextResponse.json(
      { error: clientMsg },
      { status: is503 ? 503 : 500 }
    );
  }
}


async function fetchFileAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
