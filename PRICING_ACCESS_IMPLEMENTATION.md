# Pricing Access Implementation

**Date**: January 18, 2026  
**Status**: ✅ Complete  
**Feature**: Dynamic Pricing with B2B Access Control

---

## 📋 Overview

The pricing system now implements **tier-wise pricing access control**:
- **🔒 Guest Users**: NO pricing visible - pricing locked
- **👤 Logged-in Users**: Base and sale prices visible | B2B pricing hidden
- **💼 Approved B2B Users**: ALL pricing visible including bulk/B2B rates

---

## 🔧 Backend Implementation

### New Endpoints

#### 1. Enhanced Product Endpoints
```
GET /api/products              - Returns products with pricing rules applied
GET /api/products/:id          - Returns single product with pricing rules
GET /api/products/:id/pricing  - Returns detailed pricing information
```

#### 2. Enhanced Homepage Endpoints
```
GET /api/homepage/featured-products - Returns featured products with pricing rules
GET /api/homepage/categories        - Returns categories
```

### Price Visibility Rules

**Product Controller** (`productController.ts`):
- `applyPricingRules()` helper function checks user authentication and B2B approval status
- **Guest (not logged in)**: ALL pricing hidden (`base_price`, `sale_price`, `sale_percentage`, `moq`, `b2b_price`, `b2b_min_quantity` = null)
  - Sets `pricingLocked: true`
- **Logged-in (not approved)**: Base/sale pricing visible, B2B pricing hidden
  - Sets `b2b_price` = null, `b2b_min_quantity` = null
  - Sets `pricingLocked: false`
- **Approved B2B**: All pricing fields visible
  - All fields returned with actual values
  - Sets `pricingLocked: false`

**Homepage Controller** (`homepageController.ts`):
- Same pricing rules applied to featured products
- Returns `pricingInfo` object indicating user tier

### Pricing Fields in Database

```typescript
Products Table:
├── base_price: DECIMAL(10, 2)      // Standard retail price
├── sale_price: DECIMAL(10, 2)      // Discounted price (optional)
├── sale_percentage: DECIMAL(5, 2)  // Calculated discount %
├── b2b_price: DECIMAL(10, 2)       // Bulk/B2B rate (hidden unless approved)
├── b2b_min_quantity: INT           // Minimum quantity for B2B rate
└── moq: INT                         // Minimum order quantity
```

---

## 🎨 Frontend Implementation

### New Hooks

**`usePricing(productId)`**:
```typescript
const { pricing, loading, error } = usePricing(productId);

// Returns:
{
  basePrice: number,
  salePrice: number | null,
  salePercentage: number | null,
  displayPrice: number,           // Effective display price
  b2bPrice: number | null,        // Hidden if not approved
  b2bMinQuantity: number | null,  // Hidden if not approved
  moq: number,
  isBulkEligible: boolean
}
```

**Helper Functions**:
- `formatPrice()` - Formats numbers as currency or "Contact for pricing"
- `calculateDiscount()` - Calculates percentage discount
- `getEffectivePrice()` - Determines price based on quantity and B2B eligibility

### New Components

**`PricingDisplay`**:
```tsx
<PricingDisplay
  basePrice={100}
  salePrice={80}
  b2bPrice={50}
  b2bMinQuantity={100}
  isBulkEligible={isApproved}
  showSavings={true}
/>
```

Features:
- Shows main price with savings badge
- Displays sale price with strikethrough
- Shows B2B bulk pricing if eligible
- Displays message if B2B pricing available but not approved

### API Integration

**`productsAPI.getPricing(id)`**:
```typescript
const pricingInfo = await productsAPI.getPricing(productId);
```

---

## 📊 Pricing Logic Flow

```
User Request to /api/products or /api/products/:id
    ↓
Check Authentication Status
    │
    ├─ NOT LOGGED IN (Guest)
    │   └─ Hide ALL pricing fields
    │       (base_price = null, sale_price = null, b2b_price = null, ...)
    │       pricingLocked = true
    │
    ├─ LOGGED IN, NOT B2B APPROVED
    │   └─ Show base/sale prices
    │       Hide B2B pricing (b2b_price = null, b2b_min_quantity = null)
    │       pricingLocked = false
    │       userTier = "user"
    │
    └─ LOGGED IN, B2B APPROVED
        └─ Show ALL pricing
            pricingLocked = false
            userTier = "b2b_approved"
    ↓
Apply Visibility Rules in applyPricingRules()
    ↓
Return Product with Tier-Appropriate Pricing
```

---

## 🔐 Security Implementation

1. **Authentication Check**: Uses `req.userId` from JWT middleware
2. **Database Query**: Checks `users.b2b_approval_status = 'approved'`
3. **RLS Policies**: Supabase RLS prevents unauthorized data access
4. **Expiration**: B2B approval expires after 24 hours (configurable)

---

## 📱 User Experience

### For Guests (Not Logged In)
```
Product Card:
┌─────────────────────────────┐
│     Product Image           │
├─────────────────────────────┤
│ Product Name                │
│ Description                 │
│                             │
│ 🔒 Pricing Locked           │
│ Login to view prices        │
│                             │
│ [Sign in to unlock pricing →]
└─────────────────────────────┘
```

### For Logged-in Users (Standard)
```
Product Card:
┌─────────────────────────────┐
│     Product Image           │
├─────────────────────────────┤
│ Product Name                │
│ Description                 │
│ $79.99 (SALE) ✨            │
│ Original: $99.99            │
│ Save 20% 📉                  │
│ MOQ: 10 units               │
│                             │
│ 🔒 No bulk pricing          │
└─────────────────────────────┘
```

### For Approved B2B Users
```
Product Card:
┌─────────────────────────────┐
│     Product Image           │
├─────────────────────────────┤
│ Product Name                │
│ Description                 │
│ $79.99 (SALE) ✨            │
│ Original: $99.99            │
│ Save 20% 📉                  │
│ MOQ: 10 units               │
│                             │
│ Bulk Pricing Available:      │
│ $49.99 for 100+ units 📦    │
└─────────────────────────────┘
```

---

## 🚀 Usage Examples

### Backend

```typescript
// Product Controller
const products = await getProducts(req, res);
// Products will have pricing rules applied based on user

// Pricing Endpoint
const pricing = await getProductPricing(req, res);
// Returns: { basePrice, displayPrice, b2bPrice, isBulkEligible, ... }
```

### Frontend

```tsx
// In Components
import { PricingDisplay } from '@/components/PricingDisplay';
import { usePricing, formatPrice } from '@/hooks/usePricing';

function ProductCard({ product }) {
  const { pricing } = usePricing(product.id);

  return (
    <PricingDisplay
      basePrice={pricing.basePrice}
      salePrice={pricing.salePrice}
      b2bPrice={pricing.b2bPrice}
      b2bMinQuantity={pricing.b2bMinQuantity}
      isBulkEligible={pricing.isBulkEligible}
    />
  );
}
```

---

## ✅ Testing Checklist

- [x] Backend pricing rules applied correctly
- [x] B2B pricing hidden for non-approved users
- [x] B2B pricing visible for approved users
- [x] Frontend hooks fetch pricing correctly
- [x] PricingDisplay component renders correctly
- [x] No TypeScript errors
- [x] API endpoints return correct structure

---

## 📌 Related Documentation

- [API Endpoints](./API_ENDPOINTS.md)
- [B2B Approval System](./B2B_APPROVAL_SYSTEM.md)
- [Product Schema](./supabase-setup.sql)
- [Frontend Integration](../FRONTEND_BACKEND_INTEGRATION.md)

---

## 🎯 Key Features

✅ **Dynamic Pricing** - Prices change based on user role  
✅ **B2B Access Control** - Bulk pricing hidden until approved  
✅ **Audit Trail** - User approval status tracked  
✅ **Responsive UI** - Components handle all pricing scenarios  
✅ **Type Safe** - Full TypeScript support  
✅ **Cached Data** - Frontend caching for performance  

---
