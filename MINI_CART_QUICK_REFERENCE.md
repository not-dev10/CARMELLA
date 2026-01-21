# Mini Cart - Quick Reference

## Component Structure

```
Header Component
  └── Shopping Bag Icon (with badge count)
      └── Triggers MiniCart
          ├── Header
          │   ├── "Your Cart" Title
          │   └── Item Count Badge
          ├── Content Area
          │   ├── B2B/Tier Info Banner
          │   ├── Shipping Goal Progress
          │   └── Cart Items List
          │       ├── Product Image
          │       ├── Product Info
          │       ├── Price Section
          │       └── Quantity Controls
          └── Footer
              ├── Pricing Summary
              ├── Checkout Button
              ├── Continue Shopping Button
              └── Footer Text
```

## User States Display

### 1. Guest User
- **Banner**: Blue info banner "Standard Pricing"
- **Message**: "Login to access B2B pricing and exclusive discounts"
- **Checkout**: Shows "Sign In to Checkout"
- **Cart Button**: Links to /login first

### 2. Logged-in User
- **Banner**: Blue info banner "Standard Pricing"
- **Message**: "Login to access B2B pricing and exclusive discounts"
- **Checkout**: Shows "Checkout" button
- **Additional**: Order history, wishlist access

### 3. B2B Approved User
- **Banner**: Green "B2B Tier 1 Pricing Applied"
- **Message**: "You are currently receiving wholesale volume discounts"
- **Pricing**: Shows discounted tier prices
- **Icon**: Green checkmark in banner

## Theme Support

### Light Theme
```
Background: #FAF8F3 (Warm Cream)
Text: Dark Charcoal (#1a1816)
Cards: White/Light
Accents: Gold/Yellow (#FDB022)
Borders: Soft gray
```

### Dark Theme
```
Background: #1A1816 (Deep Charcoal)
Text: Light cream (#FAF8F3)
Cards: Dark gray with subtle borders
Accents: Lighter sage greens (#8B9A6F)
Borders: Subtle light borders
```

## Key Features

### Cart Item Display
✓ Product image thumbnail
✓ Name and SKU
✓ Original and discounted price
✓ Discount percentage badge
✓ Quantity controls (+/-)
✓ Remove button
✓ Hover effects

### Pricing Breakdown
✓ Subtotal calculation
✓ Total savings (if discounts applied)
✓ Shipping estimate ($42)
✓ Minimum order alert ($500)
✓ Final total in large yellow text

### Shipping Goal
✓ Progress bar to free shipping
✓ Visual fill percentage
✓ Text showing remaining amount
✓ Updates dynamically

### Empty State
✓ Decorative illustration
✓ Helpful messaging
✓ Minimum order information
✓ Continue shopping button
✓ Professional footer text

## Animations

- Item appear: Fade in + slide down
- Price bar fill: Smooth width animation
- Hover states: Subtle background color shift
- Banner entrance: Fade and slide from top
- Quantity buttons: Instant feedback with color change

## Responsive Design

### Mobile
- Full-width drawer on right side
- Optimized touch targets
- Simplified layouts
- Stacked buttons

### Tablet/Desktop
- 420px width modal
- Side-by-side layouts
- Sticky pricing summary
- Hover effects enabled

## Data Flow

```
User Action (Add to Cart)
  ↓
ProductDetail.handleAddToCart()
  ↓
useCart().addItem()
  ↓
CartContext updates items state
  ↓
localStorage updated
  ↓
Header re-renders with badge count
  ↓
MiniCart displays updated items
```

## CSS Classes Used

```
mini-cart
├── mini-cart-header
├── mini-cart-items
│   └── mini-cart-item
│       ├── mini-cart-item-image
│       ├── mini-cart-price
│       ├── mini-cart-discount-badge
│       └── mini-cart-quantity-btn
├── mini-cart-b2b-banner
│   ├── mini-cart-b2b-text
│   ├── mini-cart-b2b-title
│   └── mini-cart-b2b-desc
├── mini-cart-progress
│   └── mini-cart-progress-fill
└── mini-cart-footer
    ├── mini-cart-summary
    ├── mini-cart-checkout-btn
    ├── mini-cart-secondary-btn
    └── mini-cart-footer-text
```

## API Integration Points

### Cart Data from API (Ready for backend)
```typescript
// Fetch cart from backend (optional)
const response = await cartAPI.get()
const response = await cartAPI.add(productId, quantity)
const response = await cartAPI.update(itemId, quantity)
const response = await cartAPI.remove(itemId)
const response = await cartAPI.clear()
```

Currently uses localStorage for persistence. Backend integration can be added in CartContext.

## Color Scheme

### Primary Colors
- **Yellow/Gold**: #FDB022 (CTAs, pricing, accents)
- **Red**: #EF4444 (Discounts, urgent info)
- **Green**: #10B981 (B2B approved status)
- **Blue**: #3B82F6 (Info messages)

### Neutral Colors
- **Text**: --foreground (dark/light mode aware)
- **Muted**: --muted (secondary text)
- **Border**: --border (dividers)
- **Background**: --background (page bg)
- **Card**: --card (component bg)

## Files Modified Summary

1. **CartContext.tsx** (NEW) - 100 lines
   - Cart state management
   - localStorage persistence
   - Cart operations (add, remove, update)

2. **mini-cart.tsx** (NEW) - 350+ lines
   - Main component
   - Item display
   - Empty state
   - Pricing summary
   - User tier info

3. **Checkout.tsx** (NEW) - 200+ lines
   - Checkout page placeholder
   - Order summary
   - Shipping form (UI only)

4. **header.tsx** (MODIFIED)
   - Added cart trigger
   - Dynamic badge count
   - Mini cart integration

5. **ProductDetail.tsx** (MODIFIED)
   - Add to cart functionality
   - Cart context integration
   - Visual feedback

6. **App.tsx** (MODIFIED)
   - CartProvider wrapper
   - /checkout route

7. **index.css** (MODIFIED)
   - 100+ lines of mini cart styles
   - Dark/light theme variants
   - Responsive classes

## Testing Checklist

- [ ] Add item to cart from ProductDetail
- [ ] View mini cart from header
- [ ] Update quantity (+ and -)
- [ ] Remove item from cart
- [ ] Check cart persists on refresh
- [ ] Toggle light/dark theme
- [ ] Verify B2B banner shows correctly
- [ ] Test empty state
- [ ] Verify pricing calculations
- [ ] Check mobile responsiveness
- [ ] Test guest vs logged-in state
- [ ] Verify discount display
- [ ] Check shipping goal progress
- [ ] Navigate to checkout

## Known Limitations

1. B2B approval status needs backend integration
2. Checkout page is UI-only (needs payment integration)
3. Shipping calculation is static ($42)
4. Tax calculation not implemented
5. Coupon codes not yet supported

## Future Enhancements

1. Sync cart with backend database
2. Implement B2B pricing tier fetching
3. Add coupon/discount code support
4. Real-time shipping calculations
5. Tax estimation
6. Cart abandonment analytics
7. Loyalty program integration
8. One-click checkout for returning customers
