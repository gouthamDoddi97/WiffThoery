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
  StickyNote,
  User,
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

const NotesPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      // Fetch notes with user profiles
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          user_profiles!notes_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Fetch status votes for all notes
      const { data: votesData, error: votesError } = await supabase
        .from('note_status_votes')
        .select('*, user_profiles(full_name)');

      if (votesError) throw votesError;

      // Fetch comments for all notes
      const { data: commentsData, error: commentsError } = await supabase
        .from('note_comments')
        .select('*, user_profiles(full_name)')
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch reactions for all notes
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('note_reactions')
        .select('*, user_profiles(full_name)');

      if (reactionsError) throw reactionsError;

      // Combine data
      const enrichedNotes = notesData.map(note => ({
        ...note,
        votes: votesData.filter(v => v.note_id === note.id) || [],
        comments: commentsData.filter(c => c.note_id === note.id) || [],
        reactions: reactionsData.filter(r => r.note_id === note.id) || [],
      }));

      setNotes(enrichedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
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
                <StickyNote size={28} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Team Notes
              </h1>
              <p className="dashboard-header__subtitle">
                Share important notes and reminders with the team
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="button button--primary"
            >
              <Plus size={18} />
              Add Note
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div className="notes-grid">
            {notes.length === 0 ? (
              <div className="empty-state">
                <StickyNote size={48} />
                <h3>No notes yet</h3>
                <p>Create your first note to get started</p>
              </div>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={setEditingNote}
                  onRefresh={fetchNotes}
                />
              ))
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(showAddModal || editingNote) && (
          <NoteModal
            note={editingNote}
            onClose={() => {
              setShowAddModal(false);
              setEditingNote(null);
            }}
            onSave={() => {
              fetchNotes();
              setShowAddModal(false);
              setEditingNote(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const NoteCard = ({ note, onEdit, onRefresh }) => {
  const { user, profile } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const canEdit = user?.id === note.created_by;

  // Calculate status consensus
  const statusCounts = note.votes.reduce((acc, vote) => {
    acc[vote.status] = (acc[vote.status] || 0) + 1;
    return acc;
  }, {});

  const allAgreeStatus = Object.keys(statusCounts).find(status => statusCounts[status] === 3);
  const myVote = note.votes.find(v => v.user_id === user?.id);

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
        await supabase.from('note_status_votes').delete().eq('id', myVote.id);
      } else if (myVote) {
        // Update vote
        await supabase
          .from('note_status_votes')
          .update({ status })
          .eq('id', myVote.id);
      } else {
        // Create vote
        await supabase.from('note_status_votes').insert({
          note_id: note.id,
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
      await supabase.from('note_comments').insert({
        note_id: note.id,
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
      await supabase.from('note_comments').delete().eq('id', commentId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReaction = async (emoji) => {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = note.reactions.find(
        r => r.user_id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        await supabase.from('note_reactions').delete().eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase.from('note_reactions').insert({
          note_id: note.id,
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
  const groupedReactions = note.reactions.reduce((acc, reaction) => {
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase.from('notes').delete().eq('id', note.id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const activeStatus = allAgreeStatus || myVote?.status;
  const ActiveIcon = activeStatus ? statusOptions.find(s => s.value === activeStatus)?.icon : null;
  const activeColor = activeStatus ? statusOptions.find(s => s.value === activeStatus)?.color : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`note-card ${allAgreeStatus ? `note-card--${allAgreeStatus}` : ''}`}
    >
      <div className="note-card__header">
        <span className="note-card__author">
          <User size={14} />
          {note.user_profiles?.full_name || 'Unknown'}
        </span>
        {canEdit && (
          <div className="note-card__actions">
            <button onClick={() => onEdit(note)} className="icon-button" title="Edit">
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
      </div>

      {/* Status Badge */}
      {activeStatus && (
        <div 
          className={`status-badge ${allAgreeStatus ? 'status-badge--all' : 'status-badge--partial'}`}
          style={{ backgroundColor: activeColor }}
        >
          {ActiveIcon && <ActiveIcon size={14} />}
          {statusOptions.find(s => s.value === activeStatus)?.label}
          {allAgreeStatus && <span className="status-badge__count"> (All Agreed)</span>}
          {!allAgreeStatus && statusCounts[activeStatus] > 1 && (
            <span className="status-badge__count"> ({statusCounts[activeStatus]}/3)</span>
          )}
        </div>
      )}

      <h3 className="note-card__title">{note.title}</h3>
      <p className="note-card__content">{note.content}</p>

      {/* Status Voting Buttons */}
      <div className="status-voting">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const voteCount = statusCounts[option.value] || 0;
          const isMyVote = myVote?.status === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleStatusVote(option.value)}
              className={`status-vote-btn ${isMyVote ? 'status-vote-btn--active' : ''}`}
              style={isMyVote ? { 
                borderColor: option.color,
                backgroundColor: `${option.color}15`
              } : {}}
              title={option.label}
            >
              <Icon size={16} style={{ color: option.color }} />
              {voteCount > 0 && <span className="vote-count">{voteCount}</span>}
            </button>
          );
        })}
      </div>

      <div className="note-card__footer">
        <span className="note-card__date">
          {new Date(note.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <div className="note-card__footer-actions">
          <button
            onClick={() => setShowComments(!showComments)}
            className="comments-toggle"
          >
            <MessageCircle size={16} />
            {note.comments.length > 0 && (
              <span className="comment-count">{note.comments.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Emoji Reactions */}
      <div className="reactions-container">
        <div className="reactions-list">
          {reactionsList.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className={`reaction-bubble ${reaction.hasMyReaction ? 'reaction-bubble--active' : ''}`}
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
            className="reaction-add-btn"
            title="Add reaction"
          >
            <Smile size={16} />
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
              {note.comments.map((comment) => (
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
    </motion.div>
  );
};

const NoteModal = ({ note, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
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

      if (note) {
        const { error } = await supabase
          .from('notes')
          .update(dataToSubmit)
          .eq('id', note.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('notes').insert([dataToSubmit]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
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
          <h2 className="modal-title">{note ? 'Edit Note' : 'Add New Note'}</h2>
          <button onClick={onClose} className="modal-close" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="Enter note title..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="form-textarea"
              rows={8}
              placeholder="Write your note here..."
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="submit"
              disabled={submitting}
              className="button button--primary"
            >
              <Save size={18} />
              {submitting ? 'Saving...' : 'Save Note'}
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

export default NotesPage;
