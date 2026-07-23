'use server';

import { createClient } from '@/lib/supabase/server';
import { Business } from '@/types';

export async function analyzeMenuDesign(businessId: string, fileUrl: string, mimeType: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return { error: 'La API Key de Gemini no está configurada.' };
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

    const parts: any[] = [];
    if (inlineData) {
      parts.push({ inlineData });
    }
    
    parts.push({
      text: `Analiza únicamente el diseño visual de esta carta.

NO extraigas productos.
NO extraigas categorías.
NO extraigas precios.
NO describas el contenido.
Ignora completamente el texto.

Devuelve únicamente un JSON válido.
El JSON debe contener solamente propiedades relacionadas con el diseño.

Debe detectar si es posible:
theme
primary_color
secondary_color
background_color
surface_color
text_color
accent_color
font_style
font_weight
category_alignment
product_alignment
price_alignment
title_alignment
card_style
border_radius
shadow
spacing
separator_style
image_style
button_style
header_style
overall_style
visual_density

Debe clasificar el diseño como:
modern
minimal
classic
vintage
elegant
dark
industrial
coffee
restaurant
bakery
fast_food

No devolver HTML.
No devolver CSS.
No devolver Markdown.
Únicamente JSON.`
    });

    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
    });

    const rawText = response.text || '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: 'La IA no devolvió un JSON válido' };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return { data: parsed };
  } catch (err: any) {
    console.error('analyzeMenuDesign error:', err);
    return { error: err.message || 'Error interno del servidor' };
  }
}

export async function updateBusinessTheme(businessId: string, designData: Partial<Business>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    // Verify ownership
    const { data: businessCheck, error: checkError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single();

    if (checkError || !businessCheck) {
      return { error: 'Negocio no encontrado o sin permisos' };
    }

    const { error: updateError } = await supabase
      .from('businesses')
      .update(designData)
      .eq('id', businessId);

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('updateBusinessTheme error:', err);
    return { error: err.message || 'Error interno del servidor' };
  }
}
