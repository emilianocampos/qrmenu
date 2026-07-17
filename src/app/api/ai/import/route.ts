import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

interface AICategory {
  name: string;
  icon: string;
  products: {
    name: string;
    description: string;
    price: number;
  }[];
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
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
    });

    const rawText = response.text || '';

    // Parse JSON from response (may be wrapped in ```json ... ```)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      try {
        const fs = require('fs');
        fs.writeFileSync('C:\\Users\\Emi\\Desktop\\carta_qr\\gemini_error.txt', 'No JSON found. Raw text:\n' + rawText);
      } catch (e) {}
      throw new Error('La IA no devolvió un JSON válido');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('AI import error:', err);
    try {
      const fs = require('fs');
      fs.writeFileSync('C:\\Users\\Emi\\Desktop\\carta_qr\\gemini_error.txt', 'Catch error:\n' + (err instanceof Error ? err.stack : String(err)));
    } catch (e) {}
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno del servidor' },
      { status: 500 }
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
