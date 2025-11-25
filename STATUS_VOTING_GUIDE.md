# Status Voting & Comments System Guide

## Overview
The Status Voting & Comments system allows all 3 partners (Vinod, Neelam, Goutham) to collaboratively manage Notes and Todos through voting on status and adding comments.

## Features

### 1. Status Voting
Each partner can vote for ONE status per note/todo:
- **Done** ✅ - Task is completed
- **In Progress** 🕐 - Currently being worked on
- **Urgent** ⚠️ - Requires immediate attention
- **Strike** ❌ - Should be removed/cancelled

#### Voting Behavior
- Click a status button to vote for that status
- Click the same button again to remove your vote
- You can only have one active vote per item
- Changing your vote updates it automatically

#### Visual Indicators

**Partial Agreement** (1-2 votes):
- Status badge shows with vote count (e.g., "Urgent (2/3)")
- Subtle styling to indicate not everyone agrees
- Item has a colored left border matching the status

**Full Agreement** (All 3 votes):
- Status badge glows with "All Agreed" text
- Stronger visual emphasis with pulsing animation
- Clear indication that all partners are aligned
- Special checkmarks (✓✓✓) for full consensus

### 2. Comments System
Every partner can:
- Add unlimited comments to any note or todo
- View all comments in chronological order
- Delete only their own comments
- See who wrote each comment and when

#### Comment Features
- Real-time comment threads
- Author name and date display
- Smooth expand/collapse animations
- Comment count badges
- Delete button for own comments only

### 3. UI Components

#### Status Badge Colors
- **Done**: Green (#10b981)
- **In Progress**: Blue (#3b82f6)
- **Urgent**: Orange (#f59e0b) with pulsing animation
- **Strike**: Red (#ef4444) with reduced opacity

#### Voting Buttons
- Icon-based for compact display
- Shows vote count when votes exist
- Highlights when you've voted
- Colored border matches status when active

#### Comments Toggle
- Message icon with count badge
- Click to expand/collapse comments
- Positioned in footer for easy access

## Database Schema

### Status Votes Tables

**note_status_votes**
```sql
- id: UUID PRIMARY KEY
- note_id: UUID (references notes)
- user_id: UUID (references user_profiles)
- status: VARCHAR(20) ('strike', 'urgent', 'done', 'in-progress')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(note_id, user_id) - One vote per user per note
```

**todo_status_votes**
```sql
- Same structure as note_status_votes
- todo_id instead of note_id
```

### Comments Tables

**note_comments**
```sql
- id: UUID PRIMARY KEY
- note_id: UUID (references notes)
- user_id: UUID (references user_profiles)
- comment: TEXT NOT NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**todo_comments**
```sql
- Same structure as note_comments
- todo_id instead of note_id
```

## Security (RLS Policies)

### Status Votes
- **View**: All authenticated users can see all votes
- **Create**: Users can only vote as themselves (auth.uid() = user_id)
- **Update**: Users can only update their own votes
- **Delete**: Users can only delete their own votes

### Comments
- **View**: All authenticated users can see all comments
- **Create**: Users can only comment as themselves
- **Update**: Users can only edit their own comments
- **Delete**: Users can only delete their own comments

## Usage Guide

### For Notes

1. **Viewing Status**
   - Status badge appears at top of card when votes exist
   - Hover over voting buttons to see status names

2. **Voting on Status**
   - Click any of the 4 status buttons below note content
   - Your active vote is highlighted with colored border
   - See vote counts on each button

3. **Adding Comments**
   - Click the message icon in card footer
   - Type comment in input field
   - Press Send button or hit Enter

4. **Managing Comments**
   - Expand comments to see thread
   - Delete your own comments with X button
   - Cannot delete other users' comments

### For Todos

Same functionality as Notes, with these differences:
- Status badge appears inline with todo title
- Voting buttons are more compact
- Comments toggle is in todo meta section
- Works alongside checkbox completion status

## Setup Instructions

### 1. Run Database Migration
```bash
# In Supabase SQL Editor, run:
notes_todos_setup.sql
```

This creates:
- Status votes tables for notes and todos
- Comments tables for notes and todos
- RLS policies for security
- Indexes for performance
- Helper functions for consensus checking

### 2. Verify Tables
After running the SQL, verify in Supabase Dashboard:
- `note_status_votes` table exists
- `todo_status_votes` table exists
- `note_comments` table exists
- `todo_comments` table exists

### 3. Test the System
1. Login as each of the 3 users
2. Create a test note
3. Have each user vote for different statuses
4. Observe the vote counts (1/3, 2/3)
5. Have all 3 vote for same status
6. See "All Agreed" badge with glow effect
7. Add comments from each user
8. Try deleting own and others' comments

## Best Practices

### Status Voting
- Use **Urgent** for time-sensitive items requiring immediate attention
- Use **In Progress** to show active work and prevent duplicates
- Use **Done** when completed but want to keep visible (vs deleting)
- Use **Strike** to flag items for removal after team review

### Comments
- Add context about why you voted a certain way
- Use comments for questions or clarifications
- Update team on progress in comments
- Keep comments constructive and professional

### Team Workflow
1. Create note/todo with clear title and description
2. Partners review and vote on priority/status
3. Discuss in comments if consensus isn't reached
4. When all agree on "Strike", creator can delete
5. When all agree on "Done", can move or archive

## Troubleshooting

### Votes Not Appearing
- Check Supabase RLS policies are enabled
- Verify user is authenticated
- Check browser console for errors
- Ensure `note_status_votes` table has data

### Comments Not Saving
- Verify `note_comments` table exists
- Check user has authenticated session
- Ensure comment is not empty
- Look for validation errors in console

### Status Badge Not Showing
- At least one vote must exist
- Check vote data includes user_profiles join
- Verify CSS is loaded (status-badge class)

### "All Agreed" Not Showing
- Requires exactly 3 votes for same status
- All 3 votes must be for identical status value
- Check database has 3 distinct user_ids

## API Reference

### Fetch Notes with Votes & Comments
```javascript
// Fetch notes
const { data: notesData } = await supabase
  .from('notes')
  .select('*, user_profiles!notes_created_by_fkey(full_name)')
  .order('created_at', { ascending: false });

// Fetch votes
const { data: votesData } = await supabase
  .from('note_status_votes')
  .select('*, user_profiles(full_name)');

// Fetch comments
const { data: commentsData } = await supabase
  .from('note_comments')
  .select('*, user_profiles(full_name)')
  .order('created_at', { ascending: true });

// Combine
const enrichedNotes = notesData.map(note => ({
  ...note,
  votes: votesData.filter(v => v.note_id === note.id),
  comments: commentsData.filter(c => c.note_id === note.id),
}));
```

### Cast a Vote
```javascript
// Create new vote
await supabase.from('note_status_votes').insert({
  note_id: noteId,
  user_id: userId,
  status: 'urgent',
});

// Update existing vote
await supabase
  .from('note_status_votes')
  .update({ status: 'done' })
  .eq('id', voteId);

// Remove vote
await supabase
  .from('note_status_votes')
  .delete()
  .eq('id', voteId);
```

### Add Comment
```javascript
await supabase.from('note_comments').insert({
  note_id: noteId,
  user_id: userId,
  comment: commentText,
});
```

### Delete Comment
```javascript
await supabase
  .from('note_comments')
  .delete()
  .eq('id', commentId);
```

## Future Enhancements

Potential features to consider:
- Email notifications when all users agree
- Comment mentions (@username)
- Vote history/audit log
- Status change timestamps
- Comment reactions (👍 ⭐)
- Filter notes/todos by status consensus
- Export consensus reports
- Automated archiving when all vote "Strike"

## Support

If you encounter issues:
1. Check database tables exist and have correct schema
2. Verify RLS policies are properly configured
3. Test with browser console open for error messages
4. Ensure all 3 users are created in Supabase Auth
5. Try refreshing the page to reload data

## Credits

Built for perfume business admin system with collaborative team management in mind.
