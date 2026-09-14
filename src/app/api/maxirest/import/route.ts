import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseMaxiRestSQL } from '@/lib/maxirest/parser';

export async function POST(req: NextRequest) {
  try {
    const { businessId, sqlContent, importTables } = await req.json();

    if (!businessId || !sqlContent) {
      return NextResponse.json({ error: 'Falta el ID del negocio o el contenido SQL' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verify business ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado o no autorizado' }, { status: 404 });
    }

    // Parse the MaxiRest SQL dump
    const parsed = parseMaxiRestSQL(sqlContent);

    if (parsed.categories.length === 0 && parsed.tables.length === 0) {
      return NextResponse.json({
        error: 'No se encontraron datos de artículos (mxart), rubros (mxrua) ni mesas (mxmes) en el archivo SQL. Asegúrese de haber exportado con la opción "Datos: Insertar" en HeidiSQL.',
      }, { status: 422 });
    }

    let categoriesCreated = 0;
    let productsCreated = 0;
    let tablesCreated = 0;

    // 1. Insert Categories & Products
    for (let i = 0; i < parsed.categories.length; i++) {
      const cat = parsed.categories[i];

      const { data: newCat, error: catErr } = await supabase
        .from('categories')
        .insert({
          business_id: businessId,
          name: cat.name,
          item_order: i,
          is_visible: true,
        })
        .select()
        .single();

      if (catErr || !newCat) {
        console.error('Error insertando categoría:', catErr);
        continue;
      }

      categoriesCreated++;

      if (cat.products?.length) {
        const productsToInsert = cat.products.map((p, pIdx) => ({
          business_id: businessId,
          category_id: newCat.id,
          name: p.name || 'Producto',
          description: p.description || null,
          price: p.price || 0,
          item_order: pIdx,
          is_available: p.is_available ?? true,
          is_featured: false,
        }));

        const { error: prodErr } = await supabase.from('products').insert(productsToInsert);
        if (!prodErr) {
          productsCreated += productsToInsert.length;
        } else {
          console.error('Error insertando productos:', prodErr);
        }
      }
    }

    // 2. Insert Tables if selected and found
    if (importTables && parsed.tables.length > 0) {
      for (const t of parsed.tables) {
        const tableCode = `table-${businessId.slice(0, 4)}-${t.table_number}-${Date.now().toString().slice(-4)}`;
        const { error: tblErr } = await supabase
          .from('restaurant_tables')
          .insert({
            business_id: businessId,
            table_number: t.table_number,
            table_name: `Mesa ${t.mesa}`,
            table_code: tableCode,
            active: true,
          });

        if (!tblErr) tablesCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      categoriesCreated,
      productsCreated,
      tablesCreated,
      waitersFound: parsed.waiters.length,
      waiters: parsed.waiters,
    });
  } catch (err: unknown) {
    console.error('Error en importación de MaxiRest:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}
