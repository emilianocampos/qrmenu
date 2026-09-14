import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';

// Banco de imágenes gastronómicas profesionales en alta resolución (Unsplash Food & Beverage Curated)
const CULINARY_IMAGE_MAP: { keywords: string[]; url: string }[] = [
  // Cafetería
  {
    keywords: ['latte', 'flat white', 'macchiato', 'lagrima'],
    url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['capuccino', 'cappuccino'],
    url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['iced coffee', 'cold brew', 'frappe', 'frio'],
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['submarino', 'chocolate caliente', 'chocolatada'],
    url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['espresso', 'jarrito', 'doble', 'americano', 'cortado', 'cafe'],
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['te en hebras', 'infusion', 'te verde', 'te negro', 'te'],
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
  },

  // Panadería y Viennoiserie
  {
    keywords: ['croissant'],
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['medialuna', 'medialunas'],
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['pain au chocolate', 'pain au chocolat', 'suisse'],
    url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['roll de canela', 'cinnamon roll', 'canela'],
    url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['scon', 'scones'],
    url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['focaccia', 'pan masa madre', 'panaderia', 'pan'],
    url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&auto=format&fit=crop&q=80',
  },

  // Pastelería y Dulces
  {
    keywords: ['cheesecake'],
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['brownie'],
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['cookie', 'galletita'],
    url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['eclair', 'lingote', 'choux', 'degustacion'],
    url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['banoffee', 'tarta', 'torta', 'chaja', 'moka', 'budin'],
    url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
  },

  // Desayunos, Tostones y Bowls
  {
    keywords: ['avocado', 'palta', 'huevos rotos', 'toston', 'tostada'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['yogurt', 'smoothie', 'bowl', 'granola', 'fruta'],
    url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['tostado', 'croque', 'jyq', 'sandwich', 'bagel'],
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
  },

  // Almuerzos y Cenas
  {
    keywords: ['milanesa', 'suprema', 'carne'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['noquis', 'pasta', 'fetuccini', 'fideos', 'bolognesa'],
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['quiche', 'loraine', 'ratatouille'],
    url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['ensalada', 'cesar', 'salad'],
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['pulled pork', 'bbq', 'hamburguesa', 'burger'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['berenjena', 'bruschetta', 'entrada', 'empanada'],
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
  },

  // Bebidas sin alcohol
  {
    keywords: ['limonada', 'd-tox', 'detox'],
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['jugo de naranja', 'naranja', 'licuado'],
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['gaseosa', 'coca', 'agua', 'aquarius', 'mineral'],
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
  },

  // Tragos y Coctelería
  {
    keywords: ['negroni', 'campari', 'carpano', 'vermouth', 'aperitivo'],
    url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['gin tonic', 'gin', 'branca', 'fernet', 'trago'],
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['malbec', 'pinot', 'vino', 'rose', 'champagne', 'espumante', 'blancas'],
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
  },
];

// Fallback por categoría si ninguna keyword coincide
const CATEGORY_FALLBACKS: Record<string, string> = {
  cafeteria: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  bebidas: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
  pasteleria: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
  panaderia: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
  'des/mer': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
  'alm/cena': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
  'promos/for': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
};

const DEFAULT_FOOD_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80';

export function matchImageUrl(productName: string, categoryName: string = ''): string {
  const normName = productName.toLowerCase();
  const normCat = categoryName.toLowerCase();

  for (const item of CULINARY_IMAGE_MAP) {
    if (item.keywords.some((kw) => normName.includes(kw))) {
      return item.url;
    }
  }

  for (const [catKey, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (normCat.includes(catKey)) {
      return url;
    }
  }

  return DEFAULT_FOOD_IMG;
}

async function generateGeminiDescriptions(
  items: { id: string; name: string; category: string }[]
): Promise<Record<string, string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || items.length === 0) return {};

  const results: Record<string, string> = {};
  const ai = new GoogleGenAI({ apiKey });

  // Procesar en lotes de hasta 25 platos
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25);
    try {
      const prompt = `Sos un redactor gastronómico y sommelier profesional.
Escribí una descripción apetitosa, concisa y gourmet (1 sola oración de entre 8 y 16 palabras) para cada uno de los siguientes platos/bebidas de una carta de restaurante en español. Entiende los ingredientes implícitos por el nombre del plato.

Lista de platos:
${JSON.stringify(chunk.map((c) => ({ id: c.id, plato: c.name, categoria: c.category })))}

Devolvé ÚNICAMENTE un array JSON válido con este formato exacto (sin markdown ni explicaciones):
[
  { "id": "...", "description": "..." }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: prompt }],
      });

      const raw = response.text || '';
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        for (const it of parsed) {
          if (it.id && it.description) {
            results[it.id] = it.description.trim();
          }
        }
      }
    } catch (err) {
      console.warn('Fallo parcial de lote en Gemini, se usará diccionario culinario de respaldo:', err);
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const {
      businessId,
      includeDescriptions = true,
      includeImages = true,
      overwriteExisting = false,
      useGemini = true,
    } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: 'businessId es requerido' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Si ambas opciones están deseleccionadas, borrar tanto imágenes como descripciones
    if (!includeDescriptions && !includeImages) {
      const { error: clearErr } = await supabase
        .from('products')
        .update({ image_url: null, description: null })
        .eq('business_id', businessId);

      if (clearErr) {
        return NextResponse.json({ error: 'Error al limpiar productos' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        clearedAll: true,
        updatedCount: 0,
        totalProducts: 0,
      });
    }

    // Si se deseleccionaron las imágenes, borrarlas de todos los productos
    if (!includeImages) {
      await supabase
        .from('products')
        .update({ image_url: null })
        .eq('business_id', businessId);
    }

    // Si se deseleccionaron las descripciones, borrarlas de todos los productos
    if (!includeDescriptions) {
      await supabase
        .from('products')
        .update({ description: null })
        .eq('business_id', businessId);
    }

    // Traer todos los productos y categorías del negocio
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, description, image_url, category_id, categories(name)')
      .eq('business_id', businessId);

    if (prodErr || !products) {
      return NextResponse.json({ error: 'Error al consultar productos' }, { status: 500 });
    }

    // Identificar productos que necesitan descripción con IA
    const itemsNeedingDesc: { id: string; name: string; category: string }[] = [];
    if (includeDescriptions) {
      for (const p of products) {
        if (overwriteExisting || !p.description || p.description.trim() === '') {
          const catName = Array.isArray(p.categories)
            ? (p.categories[0] as { name?: string })?.name || ''
            : (p.categories as { name?: string })?.name || '';
          itemsNeedingDesc.push({ id: p.id, name: p.name, category: catName });
        }
      }
    }

    // Si se solicitó IA y hay platos pendientes, ejecutar Gemini
    let geminiResults: Record<string, string> = {};
    if (includeDescriptions && useGemini && itemsNeedingDesc.length > 0) {
      try {
        geminiResults = await generateGeminiDescriptions(itemsNeedingDesc);
      } catch (e) {
        console.warn('Error en Gemini batch:', e);
      }
    }

    let updatedCount = 0;
    const updates: { id: string; image_url?: string; description?: string }[] = [];

    for (const p of products) {
      const needsImage = includeImages && (overwriteExisting || !p.image_url || p.image_url.trim() === '');
      const needsDesc = includeDescriptions && (overwriteExisting || !p.description || p.description.trim() === '');

      if (!needsImage && !needsDesc) {
        continue;
      }

      // Categoría asociada
      const catName = Array.isArray(p.categories) 
        ? (p.categories[0] as { name?: string })?.name || ''
        : (p.categories as { name?: string })?.name || '';

      const payload: { id: string; image_url?: string; description?: string } = { id: p.id };

      if (needsImage) {
        payload.image_url = matchImageUrl(p.name, catName);
      }
      if (needsDesc) {
        // Priorizar descripción generada por Gemini, o fallback culinario si no vino
        payload.description = geminiResults[p.id] || matchDescription(p.name);
      }

      updates.push(payload);
    }

    // Actualizar en Supabase
    for (const u of updates) {
      const { id, ...dataToUpdate } = u;
      const { error: updErr } = await supabase
        .from('products')
        .update(dataToUpdate)
        .eq('id', id);

      if (!updErr) updatedCount++;
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalProducts: products.length,
      usedGemini: Object.keys(geminiResults).length > 0,
    });
  } catch (err: unknown) {
    console.error('Error en auto-images:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    );
  }
}

export function matchDescription(name: string): string {
  const n = name.toLowerCase().trim();

  // Cafetería
  if (n.includes('americano')) return 'Espresso doble con agua caliente, de aroma intenso y cuerpo suave.';
  if (n.includes('macchiato')) return 'Espresso intenso cortado con una mancha de espuma de leche cremosa.';
  if (n.includes('jarrito')) return 'Café clásico servido en jarrito tradicional con espuma suave.';
  if (n.includes('doble') && n.includes('leche')) return 'Doble shot de café espresso con abundante leche vaporizada.';
  if (n.includes('submarino')) return 'Barra de chocolate artesanal derretida en leche bien caliente.';
  if (n.includes('caramelo') || n.includes('caramel')) return 'Café de especialidad con leche texturizada y notas dulces de caramelo.';
  if (n.includes('avellana')) return 'Café de especialidad combinado con crema y suave syrup de avellanas tostadas.';
  if (n.includes('flat white')) return 'Doble shot de espresso con fina microespuma de leche sedosa.';
  if (n.includes('capuccino') || n.includes('cappuccino')) return 'Equilibrio perfecto de espresso, leche vaporizada y abundante espuma aterciopelada.';
  if (n.includes('te en hebras')) return 'Selección de hebras finas naturales para una infusión aromática y relajante.';
  if (n.includes('frappe')) return 'Bebida helada refrescante y cremosa batida con hielo.';

  // Panadería
  if (n.includes('croissant')) return 'Clásico hojaldre francés elaborado con pura manteca, aireado y crujiente.';
  if (n.includes('medialuna')) return 'Tradicional medialuna de manteca esponjosa y almibarada recién horneada.';
  if (n.includes('pain au chocolate') || n.includes('pain au chocolat')) return 'Hojaldre francés crujiente relleno con barras de chocolate semiamargo belga.';
  if (n.includes('roll de canela')) return 'Espiral de masa esponjosa especiada con canela y glaseado dulce.';
  if (n.includes('scon')) return 'Scon horneado con queso reggianito crocante por fuera y suave por dentro.';

  // Pastelería
  if (n.includes('cookie')) return 'Galleta artesanal horneada en el día con textura suave y centro húmedo.';
  if (n.includes('cheesecake')) return 'Cremosa tarta de queso horneada sobre masa de galleta con compota de frutos rojos.';
  if (n.includes('brownie')) return 'Porción de brownie húmedo de chocolate puro con nueces seleccionadas.';
  if (n.includes('choux') || n.includes('eclair')) return 'Masa choux ligera rellena con cremas y coberturas artesanales.';
  if (n.includes('banoffee') || n.includes('chaja') || n.includes('tarta')) return 'Pastelería fresca elaborada en el día con ingredientes de primera calidad.';

  // Tostones y Desayunos
  if (n.includes('avocado')) return 'Tostón de pan de masa madre con palta fresca laminada, semillas y condimentos especiales.';
  if (n.includes('huevos rotos')) return 'Tostada de masa madre con huevos rotos al plato y toque de pimentón ahumado.';
  if (n.includes('toston')) return 'Tostón en pan de masa madre con combinación gourmet de ingredientes frescos.';
  if (n.includes('yogurt') || n.includes('bowl')) return 'Bowl nutritivo con yogur natural, frutas frescas y granola crocante.';
  if (n.includes('tostado') || n.includes('pan tostado') || n.includes('croque')) return 'Tostado de pan artesanal dorado con abundante jamón y queso derretido.';

  // Almuerzos
  if (n.includes('milanesa')) return 'Milanesa tierna rebozada crocante acompañada de guarnición fresca o pasta.';
  if (n.includes('ñoquis') || n.includes('noquis') || n.includes('fetuccini') || n.includes('pasta')) return 'Pasta fresca casera servida al dente con salsas de elaboración propia.';
  if (n.includes('quiche')) return 'Tarta francesa con masa crocante y relleno suave al horno.';
  if (n.includes('cesar') || n.includes('ensalada')) return 'Hojas verdes seleccionadas con aderezo especial e ingredientes frescos.';

  // Bebidas
  if (n.includes('limonada')) return 'Limonada natural recién exprimida con menta fresca, jengibre o frutas.';
  if (n.includes('naranja') || n.includes('jugo')) return 'Jugo 100% natural recién exprimido.';
  if (n.includes('negroni') || n.includes('gin') || n.includes('trago')) return 'Cóctel de autor preparado con licores seleccionados y hielo cristalino.';
  if (n.includes('vino') || n.includes('malbec') || n.includes('champagne')) return 'Vino de bodega premium seleccionado para acompañar tu momento.';

  return 'Elaborado artesanalmente en el día con ingredientes frescos de primera calidad.';
}
