import React, { useState, useEffect } from 'react';
import IframeModal from '../components/IframeModal';
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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [page]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      // Fetch notes with user profiles
      const { data: notesData, error: notesError, count } = await supabase
        .from('notes')
        .select(`
          *,
          user_profiles!notes_created_by_fkey(full_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

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
      setTotalNotes(count || 0);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNoteInState = (noteId, updater) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === noteId ? updater(note) : note))
    );
  };

  const removeNoteFromState = (noteId) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  const [totalNotes, setTotalNotes] = useState(0);

  const totalPages = Math.ceil(totalNotes / pageSize);

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
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowAddModal(true)}
                className="button button--primary"
              >
                <Plus size={18} />
                Add Note
              </button>
              <button
                onClick={() => setShowAddModal('list')}
                className="button button--secondary"
              >
                <Plus size={18} />
                Add List
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <>
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
                    onUpdate={updateNoteInState}
                    onRemove={removeNoteFromState}
                  />
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0' }}>
                <button
                  className="button button--outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span style={{ fontWeight: 500, color: '#667eea' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="button button--outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {(showAddModal || editingNote) && (
          <NoteModal
            note={editingNote}
            forceList={showAddModal === 'list'}
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

const urlRegex = /(https?:\/\/[^\s]+)/g;

const NoteCard = ({ note, onEdit, onUpdate, onRemove }) => {
  // Modal for viewing paginated list items
  const [showListModal, setShowListModal] = useState(false);
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSort, setCommentSort] = useState('votes'); // 'votes' or 'date'

  // Helper: get votes/reactions for comments
  const getCommentVotes = (comment) => comment.votes || [];
  const getCommentReactions = (comment) => comment.reactions || [];

  // Sort comments by votes or date
  const sortedComments = [...(note.comments || [])].sort((a, b) => {
    if (commentSort === 'votes') {
      const aVotes = getCommentVotes(a).reduce((sum, v) => sum + (v.value || 0), 0);
      const bVotes = getCommentVotes(b).reduce((sum, v) => sum + (v.value || 0), 0);
      return bVotes - aVotes;
    } else {
      return new Date(a.created_at) - new Date(b.created_at);
    }
  });
  const [listModalPage, setListModalPage] = useState(1);
  const listPageSize = 3;

  // Paginated comments for modal
  const paginatedComments = [...sortedComments].slice((listModalPage - 1) * listPageSize, listModalPage * listPageSize);
  const totalListPages = Math.ceil(sortedComments.length / listPageSize);

  // Voting for comments
  const handleCommentVote = async (commentId, value) => {
    try {
      // Find if user already voted
      const comment = note.comments.find(c => c.id === commentId);
      const myVote = getCommentVotes(comment).find(v => v.user_id === user?.id);
      if (myVote && myVote.value === value) {
        // Remove vote
        await supabase.from('note_comment_votes').delete().eq('id', myVote.id);
        onUpdate(note.id, (current) => ({
          ...current,
          comments: current.comments.map(c =>
            c.id === commentId ? { ...c, votes: c.votes.filter(v => v.id !== myVote.id) } : c
          ),
        }));
      } else if (myVote) {
        // Update vote
        await supabase.from('note_comment_votes').update({ value }).eq('id', myVote.id);
        onUpdate(note.id, (current) => ({
          ...current,
          comments: current.comments.map(c =>
            c.id === commentId ? { ...c, votes: c.votes.map(v => v.id === myVote.id ? { ...v, value } : v) } : c
          ),
        }));
      } else {
        // Add vote - use upsert to handle race conditions
        const { data: insertedVote, error } = await supabase
          .from('note_comment_votes')
          .upsert({ comment_id: commentId, user_id: user.id, value }, { onConflict: 'comment_id,user_id' })
          .select()
          .single();
        if (error) throw error;
        onUpdate(note.id, (current) => ({
          ...current,
          comments: current.comments.map(c =>
            c.id === commentId ? { ...c, votes: [...(c.votes || []), insertedVote] } : c
          ),
        }));
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      alert('Failed to vote');
    }
  };

  // Reactions for comments
  const handleCommentReaction = async (commentId, emoji) => {
    try {
      const comment = note.comments.find(c => c.id === commentId);
      const myReaction = getCommentReactions(comment).find(r => r.user_id === user?.id && r.emoji === emoji);
      if (myReaction) {
        // Remove reaction
        await supabase.from('note_comment_reactions').delete().eq('id', myReaction.id);
        onUpdate(note.id, (current) => ({
          ...current,
          comments: current.comments.map(c =>
            c.id === commentId ? { ...c, reactions: c.reactions.filter(r => r.id !== myReaction.id) } : c
          ),
        }));
      } else {
        // Add reaction - use upsert to handle race conditions
        const { data: insertedReaction, error } = await supabase
          .from('note_comment_reactions')
          .upsert({ comment_id: commentId, user_id: user.id, emoji }, { onConflict: 'comment_id,user_id,emoji' })
          .select()
          .single();
        if (error) throw error;
        onUpdate(note.id, (current) => ({
          ...current,
          comments: current.comments.map(c =>
            c.id === commentId ? { ...c, reactions: [...(c.reactions || []), insertedReaction] } : c
          ),
        }));
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
      alert('Failed to react');
    }
  };
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
        onUpdate(note.id, (current) => ({
          ...current,
          votes: current.votes.filter((v) => v.id !== myVote.id),
        }));
      } else if (myVote) {
        // Update vote
        await supabase
          .from('note_status_votes')
          .update({ status })
          .eq('id', myVote.id);
        onUpdate(note.id, (current) => ({
          ...current,
          votes: current.votes.map((v) =>
            v.id === myVote.id ? { ...v, status } : v
          ),
        }));
      } else {
        // Create vote
        const { data: insertedVote, error: insertError } = await supabase
          .from('note_status_votes')
          .insert({
          note_id: note.id,
          user_id: user.id,
          status,
          })
          .select('*, user_profiles(full_name)')
          .single();

        if (insertError) throw insertError;

        onUpdate(note.id, (current) => ({
          ...current,
          votes: [...current.votes, insertedVote],
        }));
      }
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
      const { data: insertedComment, error: insertError } = await supabase
        .from('note_comments')
        .insert({
        note_id: note.id,
        user_id: user.id,
        comment: newComment.trim(),
        })
        .select('*, user_profiles(full_name)')
        .single();

      if (insertError) throw insertError;

      setNewComment('');
      onUpdate(note.id, (current) => ({
        ...current,
        comments: [...current.comments, insertedComment],
      }));
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
      onUpdate(note.id, (current) => ({
        ...current,
        comments: current.comments.filter((c) => c.id !== commentId),
      }));
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
        onUpdate(note.id, (current) => ({
          ...current,
          reactions: current.reactions.filter((r) => r.id !== existingReaction.id),
        }));
      } else {
        // Add reaction
        const { data: insertedReaction, error: insertError } = await supabase
          .from('note_reactions')
          .insert({
          note_id: note.id,
          user_id: user.id,
          emoji,
          })
          .select('*, user_profiles(full_name)')
          .single();

        if (insertError) throw insertError;

        onUpdate(note.id, (current) => ({
          ...current,
          reactions: [...current.reactions, insertedReaction],
        }));
      }
      
      setShowReactionPicker(false);
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
      onRemove(note.id);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const activeStatus = allAgreeStatus || myVote?.status;
  const ActiveIcon = activeStatus ? statusOptions.find(s => s.value === activeStatus)?.icon : null;
  const activeColor = activeStatus ? statusOptions.find(s => s.value === activeStatus)?.color : null;

  // Helper to render comment text with clickable links, truncating long URLs
  const renderCommentText = (text) => {
    const parts = text.split(urlRegex);
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        // Truncate long URLs for display, but keep full URL for click
        const displayUrl = part.length > 48 ? part.slice(0, 32) + '...' + part.slice(-12) : part;
        // Check if URL is from Alibaba or other sites that block iframes
        const shouldOpenInNewTab = part.includes('alibaba.com') || part.includes('aliexpress.com');
        
        if (shouldOpenInNewTab) {
          return (
            <a
              key={idx}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#667eea', textDecoration: 'underline', wordBreak: 'break-word' }}
              title={part}
              onClick={e => e.stopPropagation()}
            >
              {displayUrl}
            </a>
          );
        }
        
        return (
          <a
            key={idx}
            href="#"
            style={{ color: '#667eea', textDecoration: 'underline', wordBreak: 'break-word' }}
            title={part}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setIframeUrl(part);
            }}
          >
            {displayUrl}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
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

      {/* List rendering: if note is a list, show comments as list items */}
      {note.is_list && (
        <div className="note-list-section">
          <h4 className="note-list-header">List Items</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem' }}>Sort by:</span>
            <button style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', border: '1px solid #ddd', background: commentSort === 'votes' ? '#667eea' : 'white', color: commentSort === 'votes' ? 'white' : '#333', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCommentSort('votes')}>Votes</button>
            <button style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', border: '1px solid #ddd', background: commentSort === 'date' ? '#667eea' : 'white', color: commentSort === 'date' ? 'white' : '#333', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCommentSort('date')}>Date</button>
          </div>
          <ul className="note-list">
            {paginatedComments.map((comment) => {
              const votes = getCommentVotes(comment);
              const voteSum = votes.reduce((sum, v) => sum + (v.value || 0), 0);
              const myVote = votes.find(v => v.user_id === user?.id);
              const groupedReactions = (getCommentReactions(comment) || []).reduce((acc, reaction) => {
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
              return (
                <li
                  key={comment.id}
                  className="note-list-item-responsive"
                  onClick={() => setShowListModal(true)}
                  style={{
                    cursor: 'pointer',
                    background: '#fff',
                    borderRadius: '0.875rem',
                    boxShadow: '0 1px 3px rgba(102,126,234,0.06)',
                    marginBottom: '0.875rem',
                    padding: '1rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid #f0f0f0',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f8f9fc';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(102,126,234,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(102,126,234,0.06)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', wordBreak: 'break-word' }}>
                    {renderCommentText(comment.comment)}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.05rem',
                      background: 'rgba(102,126,234,0.08)',
                      borderRadius: '0.625rem',
                      padding: '0.4rem 0.6rem',
                      boxShadow: '0 1px 3px rgba(102,126,234,0.06)',
                    }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            color: myVote?.value === 1 ? '#10b981' : '#999',
                            padding: '0',
                            transition: 'color 0.2s'
                          }}
                          title="Upvote"
                          onClick={e => { e.stopPropagation(); handleCommentVote(comment.id, 1); }}
                        >
                          ↑
                        </button>
                        <span style={{ fontSize: '0.85rem', color: '#667eea', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{voteSum}</span>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            color: myVote?.value === -1 ? '#ef4444' : '#999',
                            padding: '0',
                            transition: 'color 0.2s'
                          }}
                          title="Downvote"
                          onClick={e => { e.stopPropagation(); handleCommentVote(comment.id, -1); }}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    {/* Emoji reactions for comments */}
                    <div className="reactions-list-responsive" style={{
                      display: 'inline-flex',
                      gap: '0.4rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      background: 'rgba(102,126,234,0.08)',
                      borderRadius: '0.625rem',
                      padding: '0.3rem 0.5rem',
                      boxShadow: '0 1px 3px rgba(102,126,234,0.06)',
                    }}>
                      {reactionsList.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={e => { e.stopPropagation(); handleCommentReaction(comment.id, reaction.emoji); }}
                          className={`reaction-bubble${reaction.hasMyReaction ? ' reaction-bubble--active' : ''}`}
                          style={{
                            background: reaction.hasMyReaction ? '#e7f3ff' : '#f8f9fa',
                            border: reaction.hasMyReaction ? '1px solid #667eea' : '1px solid #e0e0e0',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.625rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            transition: 'all 0.2s ease',
                          }}
                          title={reaction.users.join(', ')}
                        >
                          <span>{reaction.emoji}</span>
                          <span style={{ fontWeight: 600, color: '#333', fontSize: '0.75rem' }}>{reaction.count}</span>
                        </button>
                      ))}
                      <div className="reaction-picker-wrapper">
                        <button
                          onClick={e => { e.stopPropagation(); setShowReactionPicker(showReactionPicker === comment.id ? false : comment.id); }}
                          className="reaction-add-btn"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '0.625rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea',
                            transition: 'all 0.2s ease',
                          }}
                          title="Add reaction"
                          onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                          <Smile size={14} />
                        </button>
                        <AnimatePresence>
                          {showReactionPicker === comment.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              className="reaction-picker"
                            >
                              {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={e => { e.stopPropagation(); handleCommentReaction(comment.id, emoji); }}
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
                  </div>
                </li>
              );
            })}
          </ul>
          {totalListPages > 1 && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', margin: '1.2rem 0' }}>
              <button
                className="button button--outline"
                style={{ padding: '0.35rem 1.1rem', fontSize: '0.95rem', borderRadius: '1.5rem', minWidth: '70px' }}
                disabled={listModalPage === 1}
                onClick={() => setListModalPage(listModalPage - 1)}
              >
                <span style={{ fontWeight: 600, color: listModalPage === 1 ? '#bbb' : '#764ba2' }}>Previous</span>
              </button>
              <span style={{ fontWeight: 600, color: '#3b82f6', fontSize: '0.98rem', minWidth: '70px', textAlign: 'center' }}>
                Page {listModalPage} of {totalListPages}
              </span>
              <button
                className="button button--outline"
                style={{ padding: '0.35rem 1.1rem', fontSize: '0.95rem', borderRadius: '1.5rem', minWidth: '70px' }}
                disabled={listModalPage === totalListPages}
                onClick={() => setListModalPage(listModalPage + 1)}
              >
                <span style={{ fontWeight: 600, color: listModalPage === totalListPages ? '#bbb' : '#764ba2' }}>Next</span>
              </button>
            </div>
          )}
          {/* List Modal for paginated view */}
          <AnimatePresence>
            {showListModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{ zIndex: 2000 }}
                onClick={() => setShowListModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="modal-content"
                  style={{ width: '80vw', maxWidth: '900px', minHeight: '60vh', maxHeight: '80vh', overflowY: 'auto' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h2 className="modal-title">List Items</h2>
                    <button onClick={() => setShowListModal(false)} className="modal-close" type="button">
                      <X size={24} />
                    </button>
                  </div>
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem' }}>Sort by:</span>
                    <button style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', border: '1px solid #ddd', background: commentSort === 'votes' ? '#667eea' : 'white', color: commentSort === 'votes' ? 'white' : '#333', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCommentSort('votes')}>Votes</button>
                    <button style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', border: '1px solid #ddd', background: commentSort === 'date' ? '#667eea' : 'white', color: commentSort === 'date' ? 'white' : '#333', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCommentSort('date')}>Date</button>
                  </div>
                  <ul className="note-list">
                    {paginatedComments.map((comment) => {
                      const votes = getCommentVotes(comment);
                      const voteSum = votes.reduce((sum, v) => sum + (v.value || 0), 0);
                      const myVote = votes.find(v => v.user_id === user?.id);
                      const groupedReactions = (getCommentReactions(comment) || []).reduce((acc, reaction) => {
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
                      return (
                        <li key={comment.id} className="note-list-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {renderCommentText(comment.comment)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '1.1rem',
                                  color: myVote?.value === 1 ? '#10b981' : '#999',
                                  padding: '0',
                                  transition: 'color 0.2s'
                                }}
                                title="Upvote"
                                onClick={() => handleCommentVote(comment.id, 1)}
                              >
                                ↑
                              </button>
                              <span style={{ fontWeight: 600, color: '#667eea', fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>{voteSum}</span>
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '1.1rem',
                                  color: myVote?.value === -1 ? '#ef4444' : '#999',
                                  padding: '0',
                                  transition: 'color 0.2s'
                                }}
                                title="Downvote"
                                onClick={() => handleCommentVote(comment.id, -1)}
                              >
                                ↓
                              </button>
                            </div>
                            {/* Emoji reactions for comments */}
                            <div className="reactions-list">
                              {reactionsList.map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => handleCommentReaction(comment.id, reaction.emoji)}
                                  className={`reaction-bubble reaction-bubble--small${reaction.hasMyReaction ? ' reaction-bubble--active' : ''}`}
                                  title={reaction.users.join(', ')}
                                >
                                  <span className="reaction-emoji">{reaction.emoji}</span>
                                  <span className="reaction-count">{reaction.count}</span>
                                </button>
                              ))}
                              <div className="reaction-picker-wrapper">
                                <button
                                  onClick={() => setShowReactionPicker(showReactionPicker === comment.id ? false : comment.id)}
                                  className="reaction-add-btn reaction-add-btn--small"
                                  title="Add reaction"
                                >
                                  <Smile size={14} />
                                </button>
                                <AnimatePresence>
                                  {showReactionPicker === comment.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                      className="reaction-picker"
                                    >
                                      {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => handleCommentReaction(comment.id, emoji)}
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
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {totalListPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0' }}>
                      <button
                        className="button button--outline"
                        disabled={listModalPage === 1}
                        onClick={() => setListModalPage(listModalPage - 1)}
                      >
                        Previous
                      </button>
                      <span style={{ fontWeight: 500, color: '#667eea' }}>
                        Page {listModalPage} of {totalListPages}
                      </span>
                      <button
                        className="button button--outline"
                        disabled={listModalPage === totalListPages}
                        onClick={() => setListModalPage(listModalPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
                  <p className="comment__text">{renderCommentText(comment.comment)}</p>
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
      <IframeModal url={iframeUrl} open={!!iframeUrl} onClose={() => setIframeUrl(null)} />
    </>
  );
};

const NoteModal = ({ note, onClose, onSave, forceList }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    is_list: forceList ? true : (note?.is_list || false),
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

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.is_list}
                onChange={e => setFormData({ ...formData, is_list: e.target.checked })}
                style={{ marginRight: 8 }}
                disabled={!!forceList}
              />
              Treat this note as a list (comments become list items)
            </label>
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
