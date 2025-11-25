# Inventory Management & Quality Tracking

## New Features Added

### ✅ Stock Quantity Tracking
Every product now has:
- **`stock_quantity`** - Current available units
- **`low_stock_threshold`** - Alert level (default: 20 units)
- **`is_low_stock`** - Auto-calculated field (true when stock ≤ threshold)

### ✅ Quality Rating System
- **`quality_rating`** - Product quality score (0-5 stars, decimal)
- Displayed alongside customer ratings
- Used for product sorting and filtering

### ✅ Low Stock Alerts
- Automatic alerts when stock falls below threshold
- Visual badges on product cards
- Dedicated admin alert dashboard
- Real-time monitoring

---

## Database Schema Changes

### Products Table Updates

```sql
CREATE TABLE products (
    -- ... existing fields ...
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 20,
    is_low_stock BOOLEAN GENERATED ALWAYS AS (stock_quantity <= low_stock_threshold) STORED,
    quality_rating DECIMAL(3, 2) CHECK (quality_rating >= 0 AND quality_rating <= 5),
    -- ... rest of fields ...
);
```

**New Fields:**
- `stock_quantity` - Number of units available
- `low_stock_threshold` - Alert when stock drops below this number
- `is_low_stock` - Computed field, automatically true/false
- `quality_rating` - Product quality (0.00 to 5.00)

**Index Added:**
```sql
CREATE INDEX idx_products_low_stock ON products(is_low_stock) WHERE is_low_stock = true;
```

---

## API Endpoints

### Get All Products (Enhanced)
```
GET /api/products?low_stock=true
```

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "count": 10,
  "lowStockCount": 2,
  "lowStockItems": [
    {
      "id": "uuid",
      "name": "Midnight Elegance",
      "stock_quantity": 15,
      "low_stock_threshold": 20
    }
  ]
}
```

### New: Low Stock Alerts Endpoint
```
GET /api/products/alerts/low-stock
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Midnight Elegance",
      "stock_quantity": 15,
      "low_stock_threshold": 20,
      "price": 149.99
    }
  ],
  "count": 1,
  "message": "1 product(s) are low on stock"
}
```

---

## Frontend Features

### Product Cards
**Visual Indicators:**
- 🟠 **"Only X left"** badge when low stock
- 🔴 **"Out of Stock"** badge when quantity = 0
- Disabled "Add to Cart" button when out of stock

### Low Stock Alert Component
**New Component:** `LowStockAlerts.jsx`

**Features:**
- Real-time low stock monitoring
- Auto-refreshes every 5 minutes
- Color-coded urgency (orange/red)
- Direct links to Supabase for restocking
- Clean, modern dashboard UI

**Usage:**
```jsx
import LowStockAlerts from './components/LowStockAlerts';

// Add to admin dashboard
<LowStockAlerts />
```

---

## How to Use

### 1. Add Products with Inventory

**Supabase Table Editor:**
1. Go to Table Editor → products
2. Insert/Edit product
3. Set fields:
   - `stock_quantity`: 50 (units available)
   - `low_stock_threshold`: 20 (alert level)
   - `quality_rating`: 4.8 (product quality)
4. Save

**The `is_low_stock` field updates automatically!**

### 2. Monitor Low Stock

**Option A: API Endpoint**
```bash
curl https://your-api.com/api/products/alerts/low-stock
```

**Option B: Frontend Component**
Add `<LowStockAlerts />` to admin page

**Option C: Supabase Dashboard**
1. Table Editor → products
2. Filter: `is_low_stock = true`
3. See all low stock items

### 3. Restock Products

**Quick Update:**
1. Supabase → Table Editor → products
2. Find low stock item
3. Edit `stock_quantity` field
4. Increase to desired amount
5. Save - alert automatically clears!

**Via API:**
```javascript
import { updateProductStock } from './lib/supabase';

await updateProductStock('product-id', 100); // Set to 100 units
```

### 4. Adjust Alert Thresholds

Change when alerts trigger:
1. Edit product in Supabase
2. Modify `low_stock_threshold`
   - Default: 20
   - High-demand products: 50-100
   - Slow-moving products: 10-15
3. Save - `is_low_stock` recalculates instantly

---

## Sample Data

The schema includes 3 sample products:

| Product | Stock | Threshold | Quality | Alert? |
|---------|-------|-----------|---------|--------|
| Golden Dawn | 50 | 20 | 4.9 | ❌ No |
| Midnight Elegance | 15 | 20 | 4.8 | ⚠️ Yes |
| Rose Mystique | 45 | 20 | 4.7 | ❌ No |

**Midnight Elegance** will show low stock alert (15 ≤ 20)

---

## Stock Management Workflow

### Daily Operations
1. Check `<LowStockAlerts />` dashboard
2. Note products below threshold
3. Place restock orders
4. Update quantities in Supabase

### Weekly Review
1. Export low stock report:
   ```bash
   GET /api/products/alerts/low-stock
   ```
2. Analyze patterns
3. Adjust thresholds if needed
4. Update pricing for low stock items

### Monthly Planning
1. Review `stock_quantity` trends
2. Identify fast-moving products
3. Increase thresholds for popular items
4. Decrease for slow movers

---

## Quality Rating System

### Setting Quality Ratings

**Factors to consider:**
- Ingredient quality (1-5)
- Longevity (1-5)  
- Sillage/projection (1-5)
- Bottle design (1-5)
- Customer feedback (1-5)

**Average = Quality Rating**

Example:
```
Ingredients: 5.0
Longevity: 4.5
Sillage: 4.8
Design: 5.0
Feedback: 4.9
---
Average: 4.84 ⭐
```

### Displaying Ratings

Frontend automatically uses `quality_rating` if available:
```javascript
const rating = product.quality_rating || product.rating || 4.8;
```

**Priority:**
1. `quality_rating` (from database)
2. `rating` (legacy field)
3. 4.8 (fallback default)

---

## Admin Dashboard Integration

### Add to Your Admin Page

```jsx
import React from 'react';
import LowStockAlerts from './components/LowStockAlerts';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Low Stock Monitoring */}
      <section className="dashboard-section">
        <h2>Inventory Alerts</h2>
        <LowStockAlerts />
      </section>

      {/* Other admin sections... */}
    </div>
  );
};
```

---

## Automation Ideas

### Email Alerts (Future)
```javascript
// Run daily cron job
const lowStock = await getLowStockProducts();

if (lowStock.length > 0) {
  sendEmail({
    to: 'admin@luxeparfum.com',
    subject: `⚠️ ${lowStock.length} Products Low on Stock`,
    body: generateStockReport(lowStock)
  });
}
```

### Auto-Reorder (Future)
```javascript
// Automatic supplier orders
if (product.stock_quantity <= 10) {
  placeSupplierOrder({
    product_id: product.id,
    quantity: product.low_stock_threshold * 2
  });
}
```

### Dynamic Pricing (Future)
```javascript
// Increase price when low stock
if (product.is_low_stock) {
  product.price *= 1.1; // 10% increase
}
```

---

## Best Practices

### Setting Thresholds
- **Fast-moving**: Threshold = 2 weeks of sales
- **Medium**: Threshold = 1 week of sales  
- **Slow-moving**: Threshold = 3-5 units

### Stock Levels
- **Safety stock**: Always keep 5-10 units extra
- **Reorder point**: Threshold + Lead time sales
- **Maximum**: Based on storage capacity

### Quality Ratings
- Update quarterly based on customer feedback
- Factor in returns and complaints
- Adjust for seasonal performance

---

## Troubleshooting

### Alert Not Showing
- Check `stock_quantity` value
- Verify `low_stock_threshold` is set
- Confirm `is_active = true`
- Refresh page or wait for auto-refresh

### Wrong Stock Count
- Verify recent orders didn't deplete stock
- Check for manual edits in Supabase
- Review order_items table for discrepancies

### Quality Rating Not Displaying
- Ensure `quality_rating` field has value (not null)
- Check decimal format (e.g., 4.80 not 4.8.0)
- Verify within 0-5 range

---

## Migration Guide

If you already have products in your database:

```sql
-- Add default values to existing products
UPDATE products 
SET 
  stock_quantity = 100,
  low_stock_threshold = 20,
  quality_rating = 4.5
WHERE stock_quantity IS NULL;
```

---

## Summary

### What You Can Do Now
✅ Track inventory in real-time  
✅ Get automatic low stock alerts  
✅ Display quality ratings  
✅ Show stock status on product cards  
✅ Disable purchases when out of stock  
✅ Monitor via admin dashboard  
✅ Export stock reports via API  

### Next Steps
1. Run updated `schema.sql` in Supabase
2. Add `<LowStockAlerts />` to your admin page
3. Set initial stock quantities for products
4. Adjust thresholds based on sales velocity
5. Monitor and restock as needed!

---

**Your inventory is now fully managed! 📦✨**
