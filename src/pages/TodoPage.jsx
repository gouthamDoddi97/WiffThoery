import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckSquare,
  Square,
  ListTodo,
  User,
  Calendar,
  MessageCircle,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Smile,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Popular emoji reactions (WhatsApp-style)
const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

const TodoPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      
      // Fetch todos with user profiles
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select(`
          *,
          user_profiles!todos_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (todosError) throw todosError;

      // Fetch status votes for all todos
      const { data: votesData, error: votesError } = await supabase
        .from('todo_status_votes')
        .select('*, user_profiles(full_name)');

      if (votesError) throw votesError;

      // Fetch comments for all todos
      const { data: commentsData, error: commentsError } = await supabase
        .from('todo_comments')
        .select('*, user_profiles(full_name)')
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch reactions for all todos
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('todo_reactions')
        .select('*, user_profiles(full_name)');

      if (reactionsError) throw reactionsError;

      // Combine data
      const enrichedTodos = todosData.map(todo => ({
        ...todo,
        votes: votesData.filter(v => v.todo_id === todo.id) || [],
        comments: commentsData.filter(c => c.todo_id === todo.id) || [],
        reactions: reactionsData.filter(r => r.todo_id === todo.id) || [],
      }));

      setTodos(enrichedTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-header__content">
            <div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="back-button"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
              <h1 className="dashboard-header__title">
                <ListTodo size={28} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Team To-Do List
              </h1>
              <p className="dashboard-header__subtitle">
                Manage tasks and track progress together
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="button button--primary"
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Stats */}
        <div className="todo-stats">
          <div className="todo-stat">
            <span className="todo-stat__value">{stats.total}</span>
            <span className="todo-stat__label">Total</span>
          </div>
          <div className="todo-stat">
            <span className="todo-stat__value" style={{ color: '#667eea' }}>
              {stats.active}
            </span>
            <span className="todo-stat__label">Active</span>
          </div>
          <div className="todo-stat">
            <span className="todo-stat__value" style={{ color: '#10b981' }}>
              {stats.completed}
            </span>
            <span className="todo-stat__label">Completed</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="todo-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Tasks
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div className="todo-list">
            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                <ListTodo size={48} />
                <h3>No tasks found</h3>
                <p>Create your first task to get started</p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onEdit={setEditingTodo}
                  onRefresh={fetchTodos}
                />
              ))
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(showAddModal || editingTodo) && (
          <TodoModal
            todo={editingTodo}
            onClose={() => {
              setShowAddModal(false);
              setEditingTodo(null);
            }}
            onSave={() => {
              fetchTodos();
              setShowAddModal(false);
              setEditingTodo(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TodoItem = ({ todo, onEdit, onRefresh }) => {
  const { user, profile } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const canEdit = user?.id === todo.created_by;

  // Calculate status consensus
  const statusCounts = todo.votes.reduce((acc, vote) => {
    acc[vote.status] = (acc[vote.status] || 0) + 1;
    return acc;
  }, {});

  const allAgreeStatus = Object.keys(statusCounts).find(status => statusCounts[status] === 3);
  const myVote = todo.votes.find(v => v.user_id === user?.id);

  const statusOptions = [
    { value: 'done', label: 'Done', icon: CheckCircle2, color: '#10b981' },
    { value: 'in-progress', label: 'In Progress', icon: Clock, color: '#3b82f6' },
    { value: 'urgent', label: 'Urgent', icon: AlertCircle, color: '#f59e0b' },
    { value: 'strike', label: 'Strike', icon: XCircle, color: '#ef4444' },
  ];

  const handleStatusVote = async (status) => {
    try {
      if (myVote?.status === status) {
        // Remove vote
        await supabase.from('todo_status_votes').delete().eq('id', myVote.id);
      } else if (myVote) {
        // Update vote
        await supabase
          .from('todo_status_votes')
          .update({ status })
          .eq('id', myVote.id);
      } else {
        // Create vote
        await supabase.from('todo_status_votes').insert({
          todo_id: todo.id,
          user_id: user.id,
          status,
        });
      }
      onRefresh();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to update vote');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await supabase.from('todo_comments').insert({
        todo_id: todo.id,
        user_id: user.id,
        comment: newComment.trim(),
      });
      setNewComment('');
      onRefresh();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await supabase.from('todo_comments').delete().eq('id', commentId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReaction = async (emoji) => {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = todo.reactions.find(
        r => r.user_id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        await supabase.from('todo_reactions').delete().eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase.from('todo_reactions').insert({
          todo_id: todo.id,
          user_id: user.id,
          emoji,
        });
      }
      
      setShowReactionPicker(false);
      onRefresh();
    } catch (error) {
      console.error('Error handling reaction:', error);
      alert('Failed to update reaction');
    }
  };

  // Group reactions by emoji with user info
  const groupedReactions = todo.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasMyReaction: false,
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user_profiles?.full_name || 'Unknown');
    if (reaction.user_id === user?.id) {
      acc[reaction.emoji].hasMyReaction = true;
    }
    return acc;
  }, {});

  const reactionsList = Object.values(groupedReactions);

  const handleToggle = async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error toggling todo:', error);
      alert('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase.from('todos').delete().eq('id', todo.id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete task');
    }
  };

  const activeStatus = allAgreeStatus || myVote?.status;
  const ActiveIcon = activeStatus ? statusOptions.find(s => s.value === activeStatus)?.icon : null;
  const activeColor = activeStatus ? statusOptions.find(s => s.value === activeStatus)?.color : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`todo-item ${todo.completed ? 'todo-item--completed' : ''} ${allAgreeStatus ? `todo-item--${allAgreeStatus}` : ''}`}
    >
      <button onClick={handleToggle} className="todo-checkbox">
        {todo.completed ? <CheckSquare size={24} /> : <Square size={24} />}
      </button>
      <div className="todo-content">
        <div className="todo-header-row">
          <h3 className="todo-title">{todo.title}</h3>
          {activeStatus && (
            <div 
              className={`status-badge status-badge--small ${allAgreeStatus ? 'status-badge--all' : 'status-badge--partial'}`}
              style={{ backgroundColor: activeColor }}
            >
              {ActiveIcon && <ActiveIcon size={12} />}
              {statusOptions.find(s => s.value === activeStatus)?.label}
              {allAgreeStatus && <span className="status-badge__count"> ✓✓✓</span>}
              {!allAgreeStatus && statusCounts[activeStatus] > 1 && (
                <span className="status-badge__count"> ({statusCounts[activeStatus]}/3)</span>
              )}
            </div>
          )}
        </div>
        
        {todo.description && <p className="todo-description">{todo.description}</p>}
        
        {/* Status Voting Buttons */}
        <div className="status-voting status-voting--compact">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const voteCount = statusCounts[option.value] || 0;
            const isMyVote = myVote?.status === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleStatusVote(option.value)}
                className={`status-vote-btn status-vote-btn--small ${isMyVote ? 'status-vote-btn--active' : ''}`}
                style={isMyVote ? { 
                  borderColor: option.color,
                  backgroundColor: `${option.color}15`
                } : {}}
                title={option.label}
              >
                <Icon size={14} style={{ color: option.color }} />
                {voteCount > 0 && <span className="vote-count">{voteCount}</span>}
              </button>
            );
          })}
        </div>

        <div className="todo-meta">
          <span className="todo-author">
            <User size={14} />
            {todo.user_profiles?.full_name || 'Unknown'}
          </span>
          {todo.due_date && (
            <span className="todo-due-date">
              <Calendar size={14} />
              {new Date(todo.due_date).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={() => setShowComments(!showComments)}
            className="comments-toggle comments-toggle--inline"
          >
            <MessageCircle size={14} />
            {todo.comments.length > 0 && (
              <span className="comment-count">{todo.comments.length}</span>
            )}
          </button>
        </div>

        {/* Emoji Reactions */}
        <div className="reactions-container reactions-container--compact">
          <div className="reactions-list">
            {reactionsList.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`reaction-bubble reaction-bubble--small ${reaction.hasMyReaction ? 'reaction-bubble--active' : ''}`}
                title={reaction.users.join(', ')}
              >
                <span className="reaction-emoji">{reaction.emoji}</span>
                <span className="reaction-count">{reaction.count}</span>
              </button>
            ))}
          </div>
          
          <div className="reaction-picker-wrapper">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="reaction-add-btn reaction-add-btn--small"
              title="Add reaction"
            >
              <Smile size={14} />
            </button>
            
            <AnimatePresence>
              {showReactionPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="reaction-picker"
                >
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="reaction-option"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="comments-section"
            >
              <div className="comments-list">
                {todo.comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment__header">
                      <span className="comment__author">
                        {comment.user_profiles?.full_name}
                      </span>
                      <span className="comment__date">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {comment.user_id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="comment__delete"
                          title="Delete"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <p className="comment__text">{comment.comment}</p>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleAddComment} className="comment-form">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="comment-input"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="comment-submit"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {canEdit && (
        <div className="todo-actions">
          <button onClick={() => onEdit(todo)} className="icon-button" title="Edit">
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="icon-button icon-button--danger"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const TodoModal = ({ todo, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    due_date: todo?.due_date || '',
    completed: todo?.completed || false,
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

      if (todo) {
        const { error } = await supabase
          .from('todos')
          .update(dataToSubmit)
          .eq('id', todo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('todos').insert([dataToSubmit]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('Failed to save task');
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
          <h2 className="modal-title">{todo ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="modal-close" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              rows={4}
              placeholder="Add task details..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="form-input"
            />
          </div>

          {todo && (
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) =>
                    setFormData({ ...formData, completed: e.target.checked })
                  }
                />
                <span>Mark as completed</span>
              </label>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="submit"
              disabled={submitting}
              className="button button--primary"
            >
              <Save size={18} />
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
            <button type="button" onClick={onClose} className="button button--outline">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TodoPage;
