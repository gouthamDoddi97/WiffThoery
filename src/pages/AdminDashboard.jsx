import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Download,
  Filter,
  User,
  PieChart,
  Image as ImageIcon,
  X,
  Eye,
  ZoomIn,
  StickyNote,
  ListTodo,
  Calculator,
  Moon,
  Sun,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';
import formatINR from '../lib/formatCurrency';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [filterUser, setFilterUser] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const categories = [
    'materials',
    'marketing',
    'operations',
    'shipping',
    'packaging',
    'rent',
    'utilities',
    'salaries',
    'other',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_active', true);

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filterUser !== 'all' && expense.created_by !== filterUser) return false;
    if (filterCategory !== 'all' && expense.category !== filterCategory) return false;
    
    if (dateRange !== 'all') {
      const expenseDate = new Date(expense.expense_date);
      const now = new Date();
      const daysDiff = Math.floor((now - expenseDate) / (1000 * 60 * 60 * 24));
      
      if (dateRange === '7days' && daysDiff > 7) return false;
      if (dateRange === '30days' && daysDiff > 30) return false;
      if (dateRange === '90days' && daysDiff > 90) return false;
    }
    
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  const expensesByCategory = categories.map((cat) => ({
    category: cat,
    total: filteredExpenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
  }));

  const expensesByUser = users.map((user) => ({
    user: user.full_name,
    total: filteredExpenses
      .filter((exp) => exp.created_by === user.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
  }));

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-header__content">
            <div>
              <h1 className="dashboard-header__title">Expense Manager</h1>
              <p className="dashboard-header__subtitle">Track and manage business expenses</p>
            </div>
            <div className="dashboard-header__actions">
              <div className="nav-buttons">
                <button
                  onClick={() => navigate('/admin/notes')}
                  className="button button--secondary"
                  title="Team Notes"
                >
                  <StickyNote size={18} />
                  <span className="button-text">Notes</span>
                </button>
                <button
                  onClick={() => navigate('/admin/todos')}
                  className="button button--secondary"
                  title="To-Do List"
                >
                  <ListTodo size={18} />
                  <span className="button-text">To-Do</span>
                </button>
                <button
                  onClick={() => navigate('/admin/calculator')}
                  className="button button--secondary"
                  title="Cost Calculator"
                >
                  <Calculator size={18} />
                  <span className="button-text">Calculator</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="button button--secondary"
                  title={isDark ? 'Light Mode' : 'Dark Mode'}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="button-text">{isDark ? 'Light' : 'Dark'}</span>
                </button>
              </div>
              <div className="user-info">
                <User size={20} />
                <span>{profile?.full_name}</span>
              </div>
              <button onClick={handleSignOut} className="button button--outline button--small">
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            icon={<DollarSign />}
            title="Total Expenses"
            value={formatINR(totalExpenses)}
            color="#667eea"
          />
          <StatsCard
            icon={<TrendingUp />}
            title="This Month"
            value={formatINR(filteredExpenses
              .filter((exp) => {
                const date = new Date(exp.expense_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              })
              .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
            )}
            color="#f093fb"
          />
          <StatsCard
            icon={<Calendar />}
            title="Transactions"
            value={filteredExpenses.length}
            color="#4facfe"
          />
          <StatsCard
            icon={<User />}
            title="Active Users"
            value={users.length}
            color="#43e97b"
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-card__title">
              <PieChart size={20} />
              Expenses by Category
            </h3>
            <div className="chart-bars">
              {expensesByCategory
                .filter((cat) => cat.total > 0)
                .sort((a, b) => b.total - a.total)
                .map((cat, index) => (
                  <div key={cat.category} className="chart-bar">
                    <div className="chart-bar__label">
                      <span className="chart-bar__name">{cat.category}</span>
                      <span className="chart-bar__value">{formatINR(cat.total)}</span>
                    </div>
                    <div className="chart-bar__track">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.total / totalExpenses) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="chart-bar__fill"
                        style={{ backgroundColor: `hsl(${index * 40}, 70%, 60%)` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-card__title">
              <User size={20} />
              Expenses by User
            </h3>
            <div className="chart-bars">
              {expensesByUser
                .filter((user) => user.total > 0)
                .sort((a, b) => b.total - a.total)
                .map((user, index) => (
                  <div key={user.user} className="chart-bar">
                    <div className="chart-bar__label">
                      <span className="chart-bar__name">{user.user}</span>
                      <span className="chart-bar__value">{formatINR(user.total)}</span>
                    </div>
                    <div className="chart-bar__track">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(user.total / totalExpenses) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="chart-bar__fill"
                        style={{ backgroundColor: `hsl(${200 + index * 60}, 70%, 60%)` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="expense-controls">
          <div className="filters">
            <div className="filter-group">
              <Filter size={18} />
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="button button--primary"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>

        {/* Expenses Table */}
        <div className="expenses-table-container">
          <ExpensesTable
            expenses={filteredExpenses}
            onEdit={setEditingExpense}
            onView={setViewingExpense}
            onRefresh={fetchData}
          />
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      <AnimatePresence>
        {(showAddModal || editingExpense) && (
          <ExpenseModal
            expense={editingExpense}
            categories={categories}
            onClose={() => {
              setShowAddModal(false);
              setEditingExpense(null);
            }}
            onSave={() => {
              fetchData();
              setShowAddModal(false);
              setEditingExpense(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Expense Detail View Modal */}
      <AnimatePresence>
        {viewingExpense && (
          <ExpenseDetailModal
            expense={viewingExpense}
            onClose={() => setViewingExpense(null)}
            onEdit={() => {
              setEditingExpense(viewingExpense);
              setViewingExpense(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon, title, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="stats-card"
    style={{ borderTopColor: color }}
  >
    <div className="stats-card__icon" style={{ backgroundColor: `${color}20`, color }}>
      {icon}
    </div>
    <div className="stats-card__content">
      <p className="stats-card__title">{title}</p>
      <h3 className="stats-card__value">{value}</h3>
    </div>
  </motion.div>
);

// Expenses Table Component
const ExpensesTable = ({ expenses, onEdit, onView, onRefresh }) => {
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <DollarSign size={48} />
        <h3>No expenses found</h3>
        <p>Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="expenses-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Images</th>
            <th>Added By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <motion.tr
              key={expense.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onView(expense)}
              className="expense-row"
            >
              <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
              <td>
                <span className="category-badge">{expense.category}</span>
              </td>
              <td>{expense.description}</td>
              <td className="amount">{formatINR(expense.amount)}</td>
              <td>
                <div className="expense-images">
                  {expense.receipt_images && expense.receipt_images.length > 0 && (
                    <span className="image-badge" title="Bill/Receipt images">
                      📋 {expense.receipt_images.length}
                    </span>
                  )}
                  {expense.product_images && expense.product_images.length > 0 && (
                    <span className="image-badge" title="Product images">
                      📦 {expense.product_images.length}
                    </span>
                  )}
                  {(!expense.receipt_images || expense.receipt_images.length === 0) &&
                   (!expense.product_images || expense.product_images.length === 0) && (
                    <span className="text-muted">—</span>
                  )}
                </div>
              </td>
              <td>{expense.user_profiles?.full_name || 'Unknown'}</td>
              <td>
                <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onView(expense)}
                    className="icon-button"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(expense)}
                    className="icon-button"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="icon-button icon-button--danger"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Expense Detail Modal Component
const ExpenseDetailModal = ({ expense, onClose, onEdit }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  const allImages = [
    ...(expense.receipt_images || []).map(url => ({ url, type: 'receipt' })),
    ...(expense.product_images || []).map(url => ({ url, type: 'product' })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content modal-content--detail"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Expense Details</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body modal-body--detail">
          <div className="detail-grid">
            <div className="detail-item">
              <label className="detail-label">Date</label>
              <p className="detail-value">
                {new Date(expense.expense_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="detail-item">
              <label className="detail-label">Category</label>
              <p className="detail-value">
                <span className="category-badge">{expense.category}</span>
              </p>
            </div>

            <div className="detail-item">
              <label className="detail-label">Amount</label>
              <p className="detail-value detail-value--amount">
                  {formatINR(expense.amount)}
                </p>
            </div>

            <div className="detail-item">
              <label className="detail-label">Added By</label>
              <p className="detail-value">{expense.user_profiles?.full_name || 'Unknown'}</p>
            </div>
          </div>

          <div className="detail-item detail-item--full">
            <label className="detail-label">Description</label>
            <p className="detail-value">{expense.description}</p>
          </div>

          {expense.notes && (
            <div className="detail-item detail-item--full">
              <label className="detail-label">Notes</label>
              <p className="detail-value detail-value--notes">{expense.notes}</p>
            </div>
          )}

          {allImages.length > 0 && (
            <div className="detail-item detail-item--full">
              <label className="detail-label">
                Attached Images ({allImages.length})
              </label>
              <div className="detail-images">
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    className="detail-image"
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img src={img.url} alt={`${img.type} ${index + 1}`} />
                    <div className="detail-image-overlay">
                      <ZoomIn size={24} />
                    </div>
                    <span className="detail-image-type">
                      {img.type === 'receipt' ? '📋 Receipt' : '📦 Product'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onEdit} className="button button--primary">
            <Edit2 size={18} />
            Edit Expense
          </button>
          <button onClick={onClose} className="button button--outline">
            Close
          </button>
        </div>
      </motion.div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImage}
              alt="Full size"
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Expense Modal Component
// Expense Modal Component
const ExpenseModal = ({ expense, categories, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: expense?.amount || '',
    category: expense?.category || 'materials',
    description: expense?.description || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    notes: expense?.notes || '',
    receipt_images: expense?.receipt_images || [],
    product_images: expense?.product_images || [],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        created_by: user.id,
      };

      if (expense) {
        // Update
        const { error } = await supabase
          .from('expenses')
          .update(dataToSubmit)
          .eq('id', expense.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('expenses').insert([dataToSubmit]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="modal-content modal-content--form"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button onClick={onClose} className="modal-close" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={16} />
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Date
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input"
              rows="2"
            />
          </div>

          <ImageUpload
            images={formData.receipt_images}
            onImagesChange={(images) => setFormData({ ...formData, receipt_images: images })}
            maxImages={2}
            bucket="expense_receipts"
            label="📋 Bill/Receipt Images (Max 2)"
          />

          <ImageUpload
            images={formData.product_images}
            onImagesChange={(images) => setFormData({ ...formData, product_images: images })}
            maxImages={2}
            bucket="expense_products"
            label="📦 Product Images (Max 2)"
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="button button--outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="button button--primary">
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
