import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

/**
 * Fetch all active products
 */
export const getProducts = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.classification) {
    query = query.eq('classification', filters.classification);
  }
  
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters.low_stock) {
    query = query.eq('is_low_stock', true);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Subscribe to newsletter
 */
export const subscribeNewsletter = async (email) => {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .insert([{ email }])
    .select()
    .single();
  
  if (error) {
    // Check if email already exists
    if (error.code === '23505') {
      throw new Error('This email is already subscribed');
    }
    throw error;
  }
  return data;
};

/**
 * Submit contact inquiry
 */
export const submitContactInquiry = async (inquiry) => {
  const { data, error } = await supabase
    .from('contact_inquiries')
    .insert([inquiry])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Get approved testimonials
 */
export const getTestimonials = async (featuredOnly = false) => {
  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (featuredOnly) {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

/**
 * Upload image to Supabase Storage
 */
export const uploadImage = async (bucket, file, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};

/**
 * Get public URL for an image
 */
export const getImageUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

/**
 * Get low stock products (Admin only)
 */
export const getLowStockProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock_quantity, low_stock_threshold, price')
    .eq('is_low_stock', true)
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true });
  
  if (error) throw error;
  return data;
};

/**
 * Update product stock quantity
 */
export const updateProductStock = async (productId, quantity) => {
  const { data, error } = await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('id', productId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
