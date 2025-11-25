import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * GET /api/expenses
 * Get all expenses (Admin only - add auth later)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, start_date, end_date, limit = 100 } = req.query;

    let query = supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .limit(parseInt(limit));

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by date range
    if (start_date) {
      query = query.gte('expense_date', start_date);
    }
    if (end_date) {
      query = query.lte('expense_date', end_date);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    // Calculate total
    const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    res.json({
      success: true,
      data,
      count: data.length,
      total: total.toFixed(2),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/expenses/summary
 * Get expense summary by category (Admin only)
 */
router.get('/summary', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let query = supabase
      .from('expenses')
      .select('category, amount');

    // Filter by date range
    if (start_date) {
      query = query.gte('expense_date', start_date);
    }
    if (end_date) {
      query = query.lte('expense_date', end_date);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    // Group by category and sum amounts
    const summary = data.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(expense.amount);
      return acc;
    }, {});

    const total = Object.values(summary).reduce((sum, amount) => sum + amount, 0);

    res.json({
      success: true,
      summary,
      total: total.toFixed(2),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/expenses
 * Create a new expense (Admin only)
 */
router.post('/', async (req, res, next) => {
  try {
    const { amount, category, description, expense_date, receipt_url, notes, created_by } = req.body;

    // Validate required fields
    if (!amount || !category || !description || !expense_date) {
      return res.status(400).json({
        success: false,
        error: 'Amount, category, description, and expense_date are required',
      });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number',
      });
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        amount,
        category,
        description,
        expense_date,
        receipt_url,
        notes,
        created_by,
      }])
      .select()
      .single();
    
    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Expense created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/expenses/:id
 * Update an expense (Admin only)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Expense not found',
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense (Admin only)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
