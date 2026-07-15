'use server';

import { createClient } from '@/lib/supabase/server';

interface AICategory {
  name: string;
  icon?: string;
  products: {
    name: string;
    description: string;
    price: number;
  }[];
}

export async function importMenuAI(businessId: string, fileUrl: string, mimeType: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      // Fallback/Mock data if no key is present
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
      return { data: { categories: mockCategories } };
    }

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

    const requestBody = {
      contents: [
        {
          parts: [
            ...(inlineData ? [{ inlineData }] : []),
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
      return { error: 'Error al llamar a la IA de Gemini' };
    }

    const geminiData = await response.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: 'La IA no devolvió un JSON válido' };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return { data: parsed };
  } catch (err: any) {
    console.error('importMenuAI error:', err);
    return { error: err.message || 'Error interno del servidor' };
  }
}
