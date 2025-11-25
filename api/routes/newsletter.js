import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }

    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert([{ email }])
      .select()
      .single();
    
    if (error) {
      // Check if email already exists
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'This email is already subscribed',
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/newsletter/subscribers (Admin only)
 * Get all active subscribers
 */
router.get('/subscribers', async (req, res, next) => {
  try {
    const { is_active = true, limit = 1000 } = req.query;

    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('is_active', is_active === 'true')
      .order('subscribed_at', { ascending: false })
      .limit(parseInt(limit));
    
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
