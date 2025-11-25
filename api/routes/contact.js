import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * POST /api/contact
 * Submit a contact inquiry
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }

    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert([{ name, email, subject, message }])
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Contact inquiry submitted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/contact (Admin only)
 * Fetch all contact inquiries
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
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

export default router;
