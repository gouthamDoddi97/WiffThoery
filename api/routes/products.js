import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * GET /api/products
 * Fetch all active products with optional filters
 */
router.get('/', async (req, res, next) => {
  try {
    const { classification, category_id, low_stock, limit = 100 } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // Apply filters
    if (classification) {
      query = query.eq('classification', classification);
    }
    
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    // Filter for low stock items
    if (low_stock === 'true') {
      query = query.eq('is_low_stock', true);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    // Count low stock items
    const lowStockCount = data.filter(p => p.is_low_stock).length;

    res.json({
      success: true,
      data,
      count: data.length,
      lowStockCount,
      lowStockItems: data.filter(p => p.is_low_stock).map(p => ({
        id: p.id,
        name: p.name,
        stock_quantity: p.stock_quantity,
        low_stock_threshold: p.low_stock_threshold
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/alerts/low-stock
 * Get all low stock products (Admin only)
 */
router.get('/alerts/low-stock', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity, low_stock_threshold, price')
      .eq('is_low_stock', true)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true });
    
    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length,
      message: data.length > 0 ? `${data.length} product(s) are low on stock` : 'All products are well stocked',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Fetch a single product by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products
 * Create a new product (Admin only - add auth later)
 */
router.post('/', async (req, res, next) => {
  try {
    const productData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'classification'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/products/:id
 * Update a product (Admin only - add auth later)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/products/:id
 * Soft delete a product (set is_active to false)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
