# Emoji Reactions Guide 😊

## Overview
WhatsApp-style emoji reactions have been added to both Notes and Todos! Any partner can react to any item with multiple emojis, making collaboration fun and expressive.

## Features

### 8 Popular Emojis
- 👍 **Thumbs Up** - Agree/Like
- ❤️ **Heart** - Love it
- 😂 **Laughing** - Funny
- 😮 **Surprised** - Wow/Amazing
- 😢 **Sad** - Concerned
- 🙏 **Praying Hands** - Please/Thank you
- 🎉 **Party** - Celebrate/Great news
- 🔥 **Fire** - Hot/Trending/Urgent

### How It Works

**Adding Reactions:**
1. Click the smile icon (😊) button
2. Picker popup appears with 8 emoji options
3. Click any emoji to react
4. Reaction appears as a bubble with count

**Multiple Reactions:**
- Each person can add multiple different emojis
- Click the same emoji again to remove your reaction
- Hover over reaction bubbles to see who reacted

**Visual Display:**
```
👍 3   ❤️ 2   🔥 1   [😊 +]
 ↑      ↑      ↑       ↑
3 people  2 people  1 person  Add reaction
reacted   reacted   reacted   button
```

## UI Components

### Reaction Bubbles
- **Gray background** - Default state
- **Blue border** - Your reaction (highlighted)
- **Number badge** - Count of reactions
- **Hover effect** - Scales up and shows tooltip with names

### Reaction Picker
- **Popup position** - Appears above the smile button
- **8 emoji grid** - Quick access to all options
- **Hover effect** - Emoji scales up on hover
- **Auto-close** - Closes after selecting emoji

### Layout

**On Notes:**
- Reactions appear below note content
- Above the status voting buttons
- Separated by border line
- Full-size bubbles and picker

**On Todos:**
- Reactions appear in todo meta section
- After author and due date
- Compact size to save space
- Smaller bubbles and picker

## Database Schema

### Tables Created

**note_reactions**
```sql
- id: UUID PRIMARY KEY
- note_id: UUID (references notes)
- user_id: UUID (references user_profiles)
- emoji: VARCHAR(10) - The emoji character
- created_at: TIMESTAMP
- UNIQUE(note_id, user_id, emoji) - One emoji per user per note
```

**todo_reactions**
```sql
- Same structure as note_reactions
- todo_id instead of note_id
```

### Security (RLS)
- **View**: All authenticated users can see all reactions
- **Create**: Users can only add reactions as themselves
- **Delete**: Users can only remove their own reactions
- No UPDATE policy (remove and re-add instead)

### Key Features
- **UNIQUE constraint** prevents duplicate reactions
- **Cascade delete** removes reactions when note/todo deleted
- **User tracking** knows who reacted with what
- **Timestamp** tracks when reaction was added

## Usage Examples

### Scenario 1: Urgent Task Agreement
```
Todo: "Fix website bug before launch"

Vinod: 🔥 (urgent)
Neelam: 👍 (agree)
Goutham: 🔥 (urgent)

Display: 🔥 2  👍 1
```

### Scenario 2: Celebrating Success
```
Note: "We hit our monthly sales target! 🎯"

Vinod: 🎉 (celebrate)
Neelam: 🎉 (celebrate)  
Goutham: 🎉 ❤️ (celebrate + love)

Display: 🎉 3  ❤️ 1
```

### Scenario 3: Mixed Reactions
```
Todo: "Need to work weekend for urgent order"

Vinod: 😢 (sad but okay)
Neelam: 👍 (willing to help)
Goutham: 😮 (surprised)

Display: 😢 1  👍 1  😮 1
```

## Implementation Details

### Frontend Logic

**Grouping Reactions:**
```javascript
// Groups reactions by emoji with user info
const groupedReactions = reactions.reduce((acc, reaction) => {
  if (!acc[reaction.emoji]) {
    acc[reaction.emoji] = {
      emoji: reaction.emoji,
      count: 0,
      users: [],
      hasMyReaction: false,
    };
  }
  acc[reaction.emoji].count++;
  acc[reaction.emoji].users.push(reaction.user_profiles?.full_name);
  if (reaction.user_id === currentUser.id) {
    acc[reaction.emoji].hasMyReaction = true;
  }
  return acc;
}, {});
```

**Add/Remove Logic:**
```javascript
const handleReaction = async (emoji) => {
  const existingReaction = reactions.find(
    r => r.user_id === user.id && r.emoji === emoji
  );
  
  if (existingReaction) {
    // Remove reaction (toggle off)
    await supabase
      .from('note_reactions')
      .delete()
      .eq('id', existingReaction.id);
  } else {
    // Add new reaction
    await supabase.from('note_reactions').insert({
      note_id: noteId,
      user_id: userId,
      emoji: emoji,
    });
  }
};
```

### Database Queries

**Fetch with Reactions:**
```sql
-- Fetch all note reactions with user names
SELECT 
  nr.*,
  up.full_name
FROM note_reactions nr
LEFT JOIN user_profiles up ON nr.user_id = up.id;
```

**Count Reactions:**
```sql
-- Get reaction counts per note
SELECT 
  note_id,
  emoji,
  COUNT(*) as count,
  STRING_AGG(up.full_name, ', ') as users
FROM note_reactions nr
LEFT JOIN user_profiles up ON nr.user_id = up.id
GROUP BY note_id, emoji;
```

## Setup Instructions

### 1. Database Setup
The reactions tables are already included in `notes_todos_setup.sql`:
```bash
# Run in Supabase SQL Editor:
notes_todos_setup.sql
```

This creates:
- `note_reactions` table
- `todo_reactions` table  
- RLS policies for security
- Indexes for performance

### 2. Verify Installation
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('note_reactions', 'todo_reactions');

-- Check data
SELECT COUNT(*) FROM note_reactions;
SELECT COUNT(*) FROM todo_reactions;
```

### 3. Test Reactions
1. Login as any user
2. Go to Notes or Todos page
3. Click the smile icon (😊)
4. Select an emoji
5. See the reaction bubble appear
6. Hover to see your name in tooltip
7. Click again to remove
8. Login as another user and add more reactions

## Best Practices

### When to Use Each Emoji

**👍 Thumbs Up**
- Agreeing with idea
- Approving decision
- "Got it" acknowledgment

**❤️ Heart**
- Love the suggestion
- Appreciate the effort
- Support and encouragement

**😂 Laughing**
- Lighthearted comment
- Funny mistake/typo
- Team humor

**😮 Surprised**
- Unexpected news
- Impressive achievement
- "Wow" moment

**😢 Sad**
- Disappointed by news
- Sympathetic to challenge
- Concerned about issue

**🙏 Praying Hands**
- Requesting help
- Grateful for assistance
- "Please do this"

**🎉 Party**
- Celebrating success
- Milestone achieved
- Good news announcement

**🔥 Fire**
- Urgent/hot topic
- Trending priority
- Exciting opportunity

### Team Communication Tips

1. **Use reactions instead of comments** when you just want to acknowledge without adding text

2. **Multiple emojis allowed** - Add 🔥 for urgent AND 👍 for agree

3. **Check reactions before meetings** - See team sentiment at a glance

4. **Celebrate wins together** - Everyone add 🎉 when goals are met

5. **Express concerns** - Use 😢 or 😮 to flag issues without confrontation

## Troubleshooting

### Reactions Not Appearing
- Check browser console for errors
- Verify `note_reactions` table exists
- Ensure user is authenticated
- Refresh page to reload data

### Can't Add Reaction
- Check RLS policies are enabled
- Verify user_id matches auth.uid()
- Look for UNIQUE constraint violations
- Check network tab for API errors

### Picker Not Showing
- Click outside to close if stuck open
- Check z-index isn't blocked
- Verify AnimatePresence is working
- Look for CSS class `reaction-picker`

### Tooltip Not Showing Names
- Verify user_profiles join in query
- Check full_name field exists
- Ensure reactions include user data
- Look at browser hover state

## CSS Classes Reference

### Reaction Components
```css
.reactions-container          /* Main container */
.reactions-container--compact /* Compact version for todos */
.reactions-list              /* Flex container for bubbles */
.reaction-bubble             /* Individual reaction bubble */
.reaction-bubble--small      /* Smaller bubble size */
.reaction-bubble--active     /* User's own reaction (highlighted) */
.reaction-emoji              /* Emoji character */
.reaction-count              /* Number badge */
.reaction-picker-wrapper     /* Picker button wrapper */
.reaction-add-btn            /* Smile icon button */
.reaction-add-btn--small     /* Smaller button */
.reaction-picker             /* Popup emoji picker */
.reaction-option             /* Individual emoji option */
```

### Hover Effects
- Bubbles scale to 1.1x on hover
- Picker options scale to 1.2x on hover
- Add button scales to 1.1x on hover
- Smooth 0.2s transitions on all

### Colors
- Default background: `#f0f2f5` (light gray)
- Hover background: `#e4e6eb` (medium gray)
- Active background: `#e7f3ff` (light blue)
- Active border: `#667eea` (blue)

## Future Enhancements

Potential improvements:
- Custom emoji picker with search
- Animated reaction effects (hearts floating up)
- Reaction notifications
- Reaction analytics (most used emoji)
- Skin tone variations
- More emoji categories
- Reaction history/timeline
- Quick react buttons (no picker)

## Integration with Other Features

### Works With Status Voting
- Reactions are separate from status votes
- Can react 🔥 AND vote "Urgent"
- Both visible on same card/item
- Different use cases complement each other

### Works With Comments
- React to express quick sentiment
- Comment for detailed thoughts
- React to others' items to show support
- Both count in engagement

### Mobile Responsive
- Touch-friendly reaction bubbles
- Picker positioned correctly on mobile
- Compact size on smaller screens
- Smooth animations on all devices

---

**Built with:** React, Supabase, Framer Motion  
**Inspired by:** WhatsApp message reactions  
**For:** Team collaboration and fun! 🎉
