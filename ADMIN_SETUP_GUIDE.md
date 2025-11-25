# Admin System Setup Guide

## 🔐 Admin Authentication & Expense Management

Complete admin system with authentication, expense tracking, and charts for Vinod, Neelam, and Goutham.

---

## Step 1: Setup Database Schema

### Run the admin authentication schema

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the SQL file: `database/admin_auth_setup.sql`
3. This creates:
   - `user_profiles` table
   - Row Level Security policies
   - Auto-profile creation trigger
   - Updated `expenses` table with user tracking

---

## Step 2: Create Admin Users

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users**
2. Click **Add User** (top right)
3. Create three users:

   **User 1: Vinod**
   - Email: `vinod@perfume.com`
   - Password: `[Choose a secure password]`
   - Auto Confirm User: ✅ (check this)

   **User 2: Neelam**
   - Email: `neelam@perfume.com`
   - Password: `[Choose a secure password]`
   - Auto Confirm User: ✅

   **User 3: Goutham**
   - Email: `goutham@perfume.com`
   - Password: `[Choose a secure password]`
   - Auto Confirm User: ✅

4. The `user_profiles` table will auto-populate via the trigger

### Option B: Via Email Signup (Production)

If you want users to set their own passwords:

1. Enable email authentication in Supabase
2. Each user visits: `http://localhost:5176/admin/login`
3. (Add signup form if needed - currently login-only)

---

## Step 3: Verify User Profiles

1. Go to **Table Editor** → `user_profiles`
2. Confirm all 3 users have profiles with:
   - `id` (UUID from auth.users)
   - `email`
   - `full_name`
   - `role` = 'admin'
   - `is_active` = true

If profiles didn't auto-create, manually run:

```sql
-- Get user IDs first
SELECT id, email FROM auth.users;

-- Then insert profiles
INSERT INTO user_profiles (id, email, full_name, role) 
VALUES 
    ('[vinod-uuid]', 'vinod@perfume.com', 'Vinod', 'admin'),
    ('[neelam-uuid]', 'neelam@perfume.com', 'Neelam', 'admin'),
    ('[goutham-uuid]', 'goutham@perfume.com', 'Goutham', 'admin');
```

---

## Step 4: Test the Admin System

### 1. Access the Admin Login

Visit: `http://localhost:5176/admin/login`

### 2. Login as Each User

Test with each admin:
- vinod@perfume.com
- neelam@perfume.com
- goutham@perfume.com

### 3. Test Features

**Dashboard Features:**
- ✅ View expense statistics (total, monthly, transactions)
- ✅ See charts (expenses by category, by user)
- ✅ Filter expenses (by user, category, date range)
- ✅ Add new expense
- ✅ Edit own expenses
- ✅ Delete own expenses
- ✅ View all users' expenses (read-only for others)

**Add an Expense:**
1. Click **"Add Expense"** button
2. Fill in:
   - Amount ($)
   - Date
   - Category (materials, marketing, operations, etc.)
   - Description
   - Notes (optional)
3. Click **"Save Expense"**

**View Charts:**
- **By Category**: See which expense categories consume most budget
- **By User**: See each partner's spending

---

## Features Overview

### 🔒 Authentication
- Secure login with Supabase Auth
- Session management
- Protected admin routes
- Auto-redirect to dashboard when logged in

### 💰 Expense Management
- Add, edit, delete expenses
- Track: amount, category, date, description, notes
- User attribution (who created it)
- Receipt upload support (future)

### 📊 Analytics & Charts
- **Total Expenses**: All-time total
- **Monthly Spending**: Current month total
- **Transaction Count**: Number of expenses
- **Category Breakdown**: Bar chart showing spending by category
- **User Breakdown**: Bar chart showing each partner's spending

### 🔍 Filters
- Filter by user (Vinod, Neelam, Goutham, or All)
- Filter by category (materials, marketing, operations, etc.)
- Filter by date range (Last 7/30/90 days, or All Time)

### 🔐 Security
- Row Level Security (RLS) on all tables
- Users can only edit/delete their own expenses
- All users can VIEW each other's expenses
- Authenticated access only

---

## Expense Categories

1. **Materials** - Raw materials for perfumes
2. **Marketing** - Advertising, branding, promotions
3. **Operations** - Day-to-day business operations
4. **Shipping** - Delivery and logistics
5. **Packaging** - Bottles, boxes, labels
6. **Rent** - Store/warehouse rent
7. **Utilities** - Electricity, water, internet
8. **Salaries** - Employee wages
9. **Other** - Miscellaneous expenses

---

## API Endpoints

The backend already supports these endpoints:

### Expenses
- `GET /api/expenses` - Get all expenses (with user profiles)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get expense summary/stats
- `GET /api/expenses/by-category` - Group by category
- `GET /api/expenses/by-user` - Group by user

---

## Troubleshooting

### Can't login?
- Verify user exists in `auth.users` table
- Check `user_profiles` has matching record
- Ensure `is_active = true` in profile
- Check browser console for errors

### Can't see other users' expenses?
- Verify RLS policies are enabled
- Check you're authenticated (session exists)
- Confirm expenses have `created_by` user ID

### Charts not showing?
- Add some expense data first
- Check filters aren't hiding data
- Verify expenses have valid dates and amounts

### Can't edit/delete?
- You can only edit/delete YOUR OWN expenses
- Check the expense `created_by` matches your user ID

---

## Next Steps

### Optional Enhancements
1. **Receipt Uploads**: Use Supabase Storage for expense receipts
2. **Budget Limits**: Set monthly budgets per category
3. **Notifications**: Alert when budget thresholds reached
4. **Export**: Download expenses as CSV/PDF
5. **Multi-currency**: Support multiple currencies
6. **Recurring Expenses**: Auto-create monthly expenses
7. **Approval Workflow**: Require expense approval

### Quick Links
- Frontend: `http://localhost:5176`
- Admin Login: `http://localhost:5176/admin/login`
- Admin Dashboard: `http://localhost:5176/admin/dashboard`
- API: `http://localhost:3001/api`
- Supabase: `https://znjwdpvawljoadftdxaw.supabase.co`

---

## Password Recommendations

Use strong passwords for production:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Unique for each user
- Store securely (password manager)

Example format: `Perfume2025!Vinod$#`

---

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console (F12)
3. Check backend terminal output
4. Verify `.env` file has correct Supabase credentials
