# Admin Panel Guide

## Overview

The Carmella Admin Panel is a comprehensive dashboard for managing the B2B ceramics wholesale platform. It provides tools for order management, product inventory, B2B approvals, and homepage content editing.

**Access**: Navigate to `/admin` in your browser

---

## Features

### 1. Dashboard Overview
The main dashboard displays key metrics and recent activity:

- **Total Orders**: Count of all orders with monthly trend
- **Revenue**: Total revenue generated with monthly trend
- **Pending B2B Requests**: Number of pending B2B approvals with 24-hour countdown timer
- **Active Users**: Count of active users with daily trend
- **Recent Orders Table**: Latest 4 orders with status and totals
- **Sales Performance Chart**: 6-month sales trend visualization

### 2. Product Management
Manage your ceramic product inventory:

**Features:**
- Search products by name, SKU, or category
- Filter by category and stock status
- Add new products
- Bulk CSV upload
- Edit product details
- Delete products
- Toggle product active/inactive status
- View stock levels with status indicators (In Stock, Low Stock, Out of Stock)
- Manage B2B pricing tiers
- Pagination (128 products total)

**Product Information:**
- Product name and SKU
- Product image
- Stock quantity
- B2B pricing
- Active/Inactive status
- Quick edit/delete actions

### 3. B2B Approval Queue
Review and manage B2B wholesale requests:

**Features:**
- View all pending B2B requests
- 24-hour approval window with countdown timer
- Approve requests (grants B2B pricing access)
- Reject requests with reason
- View approval history
- Track approved and rejected requests

**Request Information:**
- Company name
- Contact person
- Request date
- Status (Pending, Approved, Rejected)
- Time remaining for approval
- Rejection reason (if applicable)

### 4. Orders Management
*(Coming Soon)* - Full order management interface with:
- Order list with filtering
- Order status updates
- Invoice printing
- Refund management
- Customer contact information

### 5. Clients Management
*(Coming Soon)* - User and client management with:
- Client list
- Client details
- Order history
- Communication tools

### 6. Homepage Content Editor
*(Coming Soon)* - Edit homepage sections without coding:
- Hero section (image, headline, CTA)
- Categories section
- Product showcase
- Testimonials
- Newsletter settings
- Brand quote
- Collection split content
- Giving back section

---

## Mock Data

The admin panel currently uses mock data for demonstration:

### Dashboard Stats
- 1,284 total orders (+12.5% this month)
- $42,500.00 revenue (+8.2% this month)
- 12 pending B2B requests (23:58:12 remaining)
- 842 active users (-2% today)

### Products (4 samples)
1. Earthbound Charcoal Vase - 142 in stock - $42.50
2. Artisan Nesting Bowls - 8 in stock (low) - $85.00
3. Speckled Morning Mug - 520 in stock - $12.00
4. Minimalist Water Pitcher - 0 in stock (out) - $28.90

### B2B Requests (4 samples)
1. Nordic Interiors Ltd - Pending (23:45:30 remaining)
2. Earth & Fire Gallery - Pending (22:15:00 remaining)
3. Minimalist Home Co. - Approved (Jan 23, 2024)
4. Artisan Collective - Rejected (Incomplete documentation)

### Recent Orders (4 samples)
1. #CR-9821 - The Clay Studio - Shipped - $4,210.00
2. #CR-9820 - Nordic Living Co. - Pending - $1,850.50
3. #CR-9819 - Earth & Fire Gallery - Processing - $920.00
4. #CR-9818 - Minimalist Home - Shipped - $12,400.00

---

## Design System

### Colors
- **Primary**: Sage Green (#6B7051)
- **Secondary**: Warm Terracotta (#D4A574)
- **Accent**: Clay Brown (#8B7355)
- **Background**: Soft Cream (#FAF8F3)
- **Text**: Dark Gray (#2C2A27)

### Typography
- **Headings**: Serif font (elegant, sophisticated)
- **Body**: Sans-serif (clean, readable)
- **Sizes**: H1 (32px), H2 (24px), Body (14px)

### Components
- Sidebar navigation with active state
- Top header with search and notifications
- Stats cards with icons and trends
- Data tables with pagination
- Status badges (color-coded)
- Toggle switches for active/inactive
- Action buttons (edit, delete)
- Modal dialogs (coming soon)

---

## Navigation

### Sidebar Menu
1. **Dashboard** - Overview and key metrics
2. **Orders** - Order management (coming soon)
3. **Products** - Product inventory management
4. **B2B Requests** - B2B approval queue
5. **Clients** - Client management (coming soon)
6. **Homepage Content** - Content editor (coming soon)
7. **Settings** - Admin settings (coming soon)

### Top Header
- Page title
- Search bar (global search)
- Notifications bell
- Current date
- Logout button

---

## Keyboard Shortcuts
*(Coming Soon)*
- `Cmd/Ctrl + K` - Global search
- `Cmd/Ctrl + /` - Help menu
- `Esc` - Close modals

---

## Next Steps

### Phase 1: Backend Integration
- Connect to Supabase database
- Replace mock data with real API calls
- Implement authentication checks

### Phase 2: Missing Features
- Orders management page
- Clients management page
- Homepage content editor
- Settings page

### Phase 3: Advanced Features
- Bulk actions (approve multiple B2B requests)
- Export reports (PDF, CSV)
- Email notifications
- Audit logs
- User activity tracking

### Phase 4: Optimization
- Performance optimization
- Caching strategies
- Real-time updates
- Mobile responsiveness

---

## Troubleshooting

### Admin Panel Not Loading
- Ensure you're logged in as an admin user
- Check browser console for errors
- Clear browser cache and reload

### Mock Data Not Showing
- Refresh the page
- Check browser console for JavaScript errors
- Ensure all dependencies are installed

### Styling Issues
- Verify Tailwind CSS is properly configured
- Check for CSS conflicts
- Clear browser cache

---

## Support

For issues or questions:
1. Check this guide
2. Review the implementation status document
3. Check browser console for errors
4. Contact the development team

---

**Last Updated**: January 24, 2024  
**Status**: Beta (Mock Data)  
**Next Update**: Backend Integration Phase
