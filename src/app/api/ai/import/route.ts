import { NextRequest, NextResponse } from 'next/server';

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
    const { fileUrl, fileName, mimeType } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      // Return mock data if no API key configured
      const mockCategories: AICategory[] = [
        {
          name: 'Entradas',
          icon: '🥗',
          products: [
            { name: 'Ensalada César', description: 'Lechuga romana, aderezo césar, crutones y parmesano', price: 8.50 },
            { name: 'Bruschetta', description: 'Pan tostado con tomate, ajo y albahaca fresca', price: 6.00 },
          ],
        },
        {
          name: 'Platos Principales',
          icon: '🍽️',
          products: [
            { name: 'Pizza Margherita', description: 'Salsa de tomate, mozzarella y albahaca', price: 14.00 },
            { name: 'Pasta Bolognesa', description: 'Tagliatelle con ragú de carne', price: 12.50 },
          ],
        },
        {
          name: 'Bebidas',
          icon: '🥤',
          products: [
            { name: 'Agua mineral', description: 'Botella 500ml', price: 2.50 },
            { name: 'Limonada casera', description: 'Jugo de limón con menta', price: 4.00 },
          ],
        },
      ];

      return NextResponse.json({ categories: mockCategories });
    }

    // Real Gemini Vision call
    const isImage = mimeType?.startsWith('image/');

    const requestBody: Record<string, unknown> = {
      contents: [
        {
          parts: [
            ...(isImage ? [{
              inlineData: {
                mimeType: mimeType,
                data: await fetchFileAsBase64(fileUrl),
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
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', errText);
      throw new Error('Error al llamar a la IA');
    }

    const geminiData = await response.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Parse JSON from response (may be wrapped in ```json ... ```)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('La IA no devolvió un JSON válido');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('AI import error:', err);
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
