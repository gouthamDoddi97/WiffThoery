# Perfume E-Commerce Project Roadmap

## Current Priority: Products Management (Full Functionality)

---

## Features Overview

### ✅ Phase 1: Products System (CURRENT FOCUS)
**Status:** In Progress  
**Goal:** Full CRUD operations for perfume products

**Product Schema:**
- `id` (UUID, primary key)
- `name` (string, required)
- `description` (text, required)
- `price` (decimal, required)
- `notes` (array of strings - top/middle/base notes)
- `product_images` (array of image URLs)
- `background_image` (single image URL for product page backdrop)
- `classification` (enum: 'edp', 'edt', 'extrait')
- `category_id` (foreign key to categories)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `is_active` (boolean)

**Features:**
- Supabase admin panel for adding/editing products
- Image upload to Supabase Storage
- Frontend dynamic product rendering
- Product detail pages
- Filter by classification

---

### 🔄 Phase 2: Backend Infrastructure

#### Categories
**Status:** Backend Only (No UI Yet)  
**Schema:**
- `id` (UUID, primary key)
- `name` (string) - e.g., "Perfumes", "Solid Perfumes", "Candles"
- `slug` (string)
- `description` (text)

**Current Categories:**
- Perfumes (default, only one for now)

**Future Expansion:**
- Solid Perfumes
- Scented Candles
- Gift Sets

---

### 📋 Phase 3: Customer Engagement (Future)

#### Contact Forms
**Status:** Planned  
**Features:**
- Customer inquiry submission
- Admin notification system
- Response tracking
- Store in Supabase

#### Newsletter Subscriptions
**Status:** Planned  
**Features:**
- Email collection
- Supabase storage
- Export capability for email campaigns
- Unsubscribe functionality

#### Testimonials
**Status:** Planned  
**Features:**
- Customer review submission
- Admin approval workflow
- Display on homepage
- Rating system

---

### 🛒 Phase 4: E-Commerce (UI Only for Now)

#### Cart System
**Status:** UI Mockup Only  
**Current:**
- Frontend cart using localStorage
- Add/remove items
- Quantity management
- No checkout/payment yet

**Future:**
- Backend order processing
- Payment gateway integration (Stripe/Razorpay)
- Order management system
- Email confirmations

---

### 💼 Admin Features

#### Expenses Tracker
**Status:** Planned  
**Access:** Admin Only  
**Purpose:** Track business expenses shared among partners and investors

**Features:**
- Expense entry (amount, category, description, date)
- Receipt upload
- Filter by date range, category
- Export reports
- Multi-user access (partners/investors only)
- Expense categories (Materials, Marketing, Operations, etc.)

**Schema:**
- `id` (UUID)
- `amount` (decimal)
- `category` (string)
- `description` (text)
- `date` (date)
- `receipt_url` (image URL)
- `created_by` (user_id)
- `created_at` (timestamp)

---

## Technical Stack

### Frontend
- React 18+
- Vite
- Framer Motion (animations)
- GSAP (scroll effects)
- Tailwind CSS / Custom CSS

### Backend
- Express.js (lightweight Node framework)
- Supabase (PostgreSQL database)
- Supabase Storage (images)
- Supabase Auth (future)

### Deployment
- Frontend: Vercel / GitHub Pages
- Backend API: Vercel Serverless Functions
- Database: Supabase (cloud hosted)

---

## Implementation Priority

1. **CURRENT:** Products full CRUD ⚡
2. Database schema setup
3. Image storage configuration
4. Backend API endpoints
5. Frontend product fetching
6. Admin expenses tracker
7. Contact forms
8. Newsletter
9. Testimonials
10. Full e-commerce with orders

---

## Notes
- All admin features accessible via Supabase dashboard
- Non-technical users can manage products through Supabase Table Editor
- Focus on perfumes category only for initial launch
- Cart is UI-only until payment integration is ready
