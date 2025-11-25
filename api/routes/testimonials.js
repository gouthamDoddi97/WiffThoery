import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * GET /api/testimonials
 * Get approved testimonials
 */
router.get('/', async (req, res, next) => {
  try {
    const { featured, limit = 50 } = req.query;

    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/testimonials
 * Submit a testimonial (requires approval)
 */
router.post('/', async (req, res, next) => {
  try {
    const { customer_name, customer_title, rating, testimonial, product_id } = req.body;

    // Validate required fields
    if (!customer_name || !rating || !testimonial) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, rating, and testimonial are required',
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        customer_name,
        customer_title,
        rating,
        testimonial,
        product_id,
        is_approved: false, // Requires admin approval
      }])
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Testimonial submitted successfully and pending approval',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
