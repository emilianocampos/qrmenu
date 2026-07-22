'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Business, Product, Review } from '@/types';

export async function getBusinessBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching business by slug:', error);
    return { error: error.message };
  }
  
  const { data: settingsData } = await supabase
    .from('settings')
    .select('*')
    .eq('business_id', data.id)
    .single();
    
  let businessData = { ...data };
  if (settingsData) {
    businessData = { ...businessData, ...settingsData, id: data.id };
  }
  
  return { data: businessData as Business };
}

// Get only available products for a business, ordered by category and item order
export async function getProducts(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name)')
    .eq('business_id', businessId)
    .eq('is_available', true)
    .order('item_order', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return { error: error.message };
  }
  return { data: data as Product[] };
}

// Search products by name, description, or category name
export async function searchProducts(businessId: string, query: string) {
  const supabase = await createClient();

  // First get all categories to match category name if query is search-term
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('business_id', businessId);

  const matchedCategoryIds = categories
    ? categories
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      .map(c => c.id)
    : [];

  let dbQuery = supabase
    .from('products')
    .select('*, category:categories(id, name)')
    .eq('business_id', businessId)
    .eq('is_available', true);

  if (query.trim()) {
    if (matchedCategoryIds.length > 0) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,category_id.in.(${matchedCategoryIds.map(id => `"${id}"`).join(',')})`);
    } else {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
  }

  const { data, error } = await dbQuery.order('item_order', { ascending: true });

  if (error) {
    console.error('Error searching products:', error);
    return { error: error.message };
  }
  return { data: data as Product[] };
}

// Get reviews for a business ordered by most recent first
export async function getReviews(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return { error: error.message };
  }
  return { data: data as Review[] };
}

// Create a new review and revalidate the public menu page
export async function createReview(
  businessId: string,
  reviewData: { first_name: string; last_name: string; comment: string; rating: number }
) {
  const supabase = await createClient();

  // Insert review
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      business_id: businessId,
      first_name: reviewData.first_name,
      last_name: reviewData.last_name,
      comment: reviewData.comment,
      rating: reviewData.rating,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return { error: error.message };
  }

  // Get business slug to revalidate path
  const { data: business } = await supabase
    .from('businesses')
    .select('slug')
    .eq('id', businessId)
    .single();

  if (business) {
    revalidatePath(`/c/${business.slug}`);
  }

  return { data: review as Review };
}

// Get average rating and counts
export async function getAverageRating(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('business_id', businessId);

  if (error) {
    console.error('Error getting reviews for rating:', error);
    return { error: error.message };
  }

  const reviews = data || [];
  const count = reviews.length;
  const average = count > 0
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
    : 0;

  return {
    data: {
      average,
      count
    }
  };
}
