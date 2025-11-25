# Notes and To-Do Features Setup Guide

## Features Added

### 1. **Notes Page** (`/admin/notes`)
- Create, edit, and delete team notes
- View all team members' notes
- Rich text support for detailed notes
- Author tracking and timestamps
- Only creators can edit/delete their own notes

### 2. **To-Do Page** (`/admin/todos`)
- Task management with completion tracking
- Optional descriptions and due dates
- Filter tasks: All, Active, Completed
- Statistics dashboard (Total, Active, Completed)
- Checkbox to mark tasks complete
- Only creators can edit/delete their own tasks

### 3. **Navigation**
- Two new buttons in dashboard header:
  - **Notes** button (blue with sticky note icon)
  - **To-Do** button (blue with list icon)
- Back buttons on each page to return to dashboard
- Mobile responsive (icons only on small screens)

## Setup Instructions

### Step 1: Create Database Tables

Run `database/notes_todos_setup.sql` in **Supabase SQL Editor**:

```sql
-- This will create:
-- 1. notes table (id, title, content, created_by, timestamps)
-- 2. todos table (id, title, description, completed, due_date, created_by, timestamps)
-- 3. RLS policies (view all, edit/delete own)
-- 4. Triggers for updated_at timestamps
-- 5. Performance indexes
```

### Step 2: Test the Features

1. **Navigate to Dashboard**
   - Go to `http://localhost:5176/admin/dashboard`
   - You'll see two new buttons in the header: **Notes** and **To-Do**

2. **Test Notes**
   - Click **Notes** button
   - Click **Add Note**
   - Create a note with title and content
   - Try editing and deleting your own notes
   - Other users can view but not edit your notes

3. **Test To-Do**
   - Click **To-Do** button
   - Click **Add Task**
   - Create a task with optional description and due date
   - Check/uncheck the checkbox to mark complete
   - Use filters to view All, Active, or Completed tasks
   - Try editing and deleting your own tasks

## Database Schema

### Notes Table
```sql
id              UUID PRIMARY KEY
title           TEXT NOT NULL
content         TEXT NOT NULL
created_by      UUID REFERENCES user_profiles(id)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Todos Table
```sql
id              UUID PRIMARY KEY
title           TEXT NOT NULL
description     TEXT
completed       BOOLEAN DEFAULT FALSE
due_date        DATE
created_by      UUID REFERENCES user_profiles(id)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## Security (RLS Policies)

Both tables have the same security model:
- ✅ **View**: All authenticated users can view all items
- ✅ **Create**: Users can create new items
- ✅ **Update**: Users can only update their own items
- ✅ **Delete**: Users can only delete their own items

This ensures transparency (everyone sees everything) while maintaining ownership control.

## UI Features

### Notes Page
- **Card Layout**: Pinterest-style grid (3 columns on desktop, 1 on mobile)
- **Hover Effects**: Cards lift slightly on hover
- **Author Display**: Shows who created each note
- **Edit/Delete**: Buttons only visible for your own notes
- **Date Display**: Shows creation date in readable format

### To-Do Page
- **Stats Dashboard**: Shows total, active, and completed counts
- **Filter Tabs**: Switch between All, Active, and Completed views
- **Checkbox Toggle**: Click to mark complete/incomplete
- **Strikethrough**: Completed tasks have strikethrough text
- **Due Dates**: Optional calendar icon with due date
- **Author Display**: Shows who created each task

## Mobile Responsive

### Dashboard Header (Mobile)
- Navigation buttons show only icons
- Buttons stack in row at top
- Text labels hidden to save space

### Notes Page (Mobile)
- Single column layout
- Cards stack vertically
- Touch-friendly buttons

### To-Do Page (Mobile)
- Stats stack vertically
- Filter tabs remain horizontal
- Tasks stack with full information

## File Structure

```
src/
├── pages/
│   ├── AdminDashboard.jsx  (updated with nav buttons)
│   ├── NotesPage.jsx        (new)
│   └── TodoPage.jsx         (new)
├── AppRoutes.jsx            (updated with new routes)
└── styles/
    └── admin.css            (added notes/todo styles)

database/
└── notes_todos_setup.sql    (new)
```

## Routes

- `/admin/dashboard` - Main expense dashboard
- `/admin/notes` - Team notes page
- `/admin/todos` - Team to-do list page
- All routes are protected (require authentication)

## Next Steps

1. ✅ Run `notes_todos_setup.sql` in Supabase
2. ✅ Test creating notes and todos
3. ✅ Verify RLS policies work (try with different users)
4. ✅ Test mobile responsiveness
5. Optional: Add categories to notes/todos
6. Optional: Add markdown support for notes
7. Optional: Add task assignments (assign to specific users)
8. Optional: Add priority levels for todos

## Troubleshooting

**Issue**: "relation 'notes' does not exist"
- **Fix**: Run `notes_todos_setup.sql` in Supabase SQL Editor

**Issue**: Can't see notes/todos created by others
- **Fix**: Check RLS policies are enabled and SELECT policy exists

**Issue**: Can edit other users' items
- **Fix**: Verify UPDATE/DELETE policies check `auth.uid() = created_by`

**Issue**: Navigation buttons not showing
- **Fix**: Clear browser cache and refresh

## Features Summary

✅ Shared team notes with rich text
✅ Task management with completion tracking
✅ Mobile-responsive design
✅ Secure with RLS policies
✅ Author tracking for accountability
✅ Filter and search capabilities
✅ Statistics dashboard
✅ Clean, modern UI
✅ Smooth animations
✅ Back navigation to dashboard

Enjoy your new Notes and To-Do features! 📝✅
