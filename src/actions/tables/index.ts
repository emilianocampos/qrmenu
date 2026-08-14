'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTables(businessId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('business_id', businessId)
      .order('table_number', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

export async function createTable(params: {
  businessId: string;
  tableNumber: number;
  tableName?: string;
}) {
  try {
    const supabase = await createClient();

    // Generar un código único de mesa
    const tableCode = `table-${params.businessId.slice(0, 4)}-${params.tableNumber}-${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert({
        business_id: params.businessId,
        table_number: params.tableNumber,
        table_name: params.tableName || `Mesa ${params.tableNumber}`,
        table_code: tableCode,
        active: true,
      })
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/mesas');
    return { data };
  } catch (error: any) {
    console.error('Error creating table:', error);
    return { error: error.message || 'Error al crear la mesa' };
  }
}

export async function updateTable(
  tableId: string,
  updates: { tableNumber?: number; tableName?: string; active?: boolean }
) {
  try {
    const supabase = await createClient();

    const payload: any = {};
    if (updates.tableNumber !== undefined) payload.table_number = updates.tableNumber;
    if (updates.tableName !== undefined) payload.table_name = updates.tableName;
    if (updates.active !== undefined) payload.active = updates.active;

    const { data, error } = await supabase
      .from('restaurant_tables')
      .update(payload)
      .eq('id', tableId)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/mesas');
    return { data };
  } catch (error: any) {
    console.error('Error updating table:', error);
    return { error: error.message || 'Error al actualizar la mesa' };
  }
}

export async function deleteTable(tableId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('restaurant_tables')
      .delete()
      .eq('id', tableId);

    if (error) throw error;

    revalidatePath('/mesas');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting table:', error);
    return { error: error.message || 'Error al eliminar la mesa' };
  }
}
