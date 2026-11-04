import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AIProduct {
  name: string;
  description: string;
  price: number;
  subcategory?: string;
}

interface AISubcategory {
  name: string;
  products: AIProduct[];
}

interface AICategory {
  name: string;
  icon?: string;
  subcategories?: AISubcategory[];
  products?: AIProduct[];
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, categories } = await req.json() as { businessId: string; categories: AICategory[] };

    if (!businessId || !categories?.length) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    // Verify ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single();

    if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });

    let totalCats = 0;
    let totalProducts = 0;

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];

      const { data: newCat, error: catErr } = await supabase
        .from('categories')
        .insert({
          business_id: businessId,
          name: cat.name,
          icon: cat.icon ?? null,
          item_order: i,
          is_visible: true,
        })
        .select()
        .single();

      if (catErr || !newCat) {
        console.error('Error creating category:', catErr);
        continue;
      }

      totalCats++;

      // Collect all products for this category (from subcategories + direct products)
      const productsToInsert: any[] = [];
      let itemOrder = 0;

      // 1. Direct products
      if (Array.isArray(cat.products)) {
        for (const p of cat.products) {
          productsToInsert.push({
            business_id: businessId,
            category_id: newCat.id,
            subcategory: p.subcategory || null,
            name: p.name || 'Producto',
            description: p.description || null,
            price: p.price || 0,
            item_order: itemOrder++,
            is_available: true,
            is_featured: false,
          });
        }
      }

      // 2. Products inside subcategories
      if (Array.isArray(cat.subcategories)) {
        for (const subcat of cat.subcategories) {
          const subcatName = subcat.name?.trim() || null;
          if (Array.isArray(subcat.products)) {
            for (const p of subcat.products) {
              productsToInsert.push({
                business_id: businessId,
                category_id: newCat.id,
                subcategory: subcatName,
                name: p.name || 'Producto',
                description: p.description || null,
                price: p.price || 0,
                item_order: itemOrder++,
                is_available: true,
                is_featured: false,
              });
            }
          }
        }
      }

      if (productsToInsert.length > 0) {
        // Try inserting with subcategory
        const { error: prodErr } = await supabase.from('products').insert(productsToInsert);

        if (prodErr) {
          // If subcategory column doesn't exist yet, retry without subcategory
          console.warn('Error inserting with subcategory, retrying without subcategory column:', prodErr.message);
          const fallbackProducts = productsToInsert.map(({ subcategory, ...rest }) => rest);
          const { error: fallbackErr } = await supabase.from('products').insert(fallbackProducts);
          if (!fallbackErr) {
            totalProducts += fallbackProducts.length;
          } else {
            console.error('Error inserting fallback products:', fallbackErr);
          }
        } else {
          totalProducts += productsToInsert.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      categoriesCreated: totalCats,
      productsCreated: totalProducts,
    });
  } catch (err: unknown) {
    console.error('Save import error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
