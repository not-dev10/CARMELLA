# PricingDisplay Component - Quick Reference Guide

## Location
`frontend/src/components/PricingDisplay.tsx`

## Import
```typescript
import { PricingDisplay } from '@/components/PricingDisplay'
import { useAuth } from '@/contexts/AuthContext'
```

## Usage Pattern

### Basic Example
```tsx
const { approvalStatus, user } = useAuth()

<PricingDisplay
  basePrice={product.basePrice}
  salePrice={product.salePrice}
  b2bStatus={user ? (approvalStatus || "none") : null}
  pricingLocked={!user}
  isBulkEligible={approvalStatus === "approved"}
  showSavings={true}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `basePrice` | `number \| null` | ✅ Yes | Base/list price of the product |
| `salePrice` | `number \| null` | ❌ No | Discounted price (shows discount badge if provided) |
| `b2bStatus` | `'none' \| 'pending' \| 'approved' \| 'rejected' \| null` | ❌ No | User's B2B approval status |
| `pricingLocked` | `boolean` | ❌ No | Locks pricing display for guests (default: `false`) |
| `isBulkEligible` | `boolean` | ❌ No | Shows MOQ/bulk order info (default: `false`) |
| `showSavings` | `boolean` | ❌ No | Shows discount percentage badge (default: `true`) |
| `className` | `string` | ❌ No | Custom CSS classes for wrapper |

## Status Display Behaviors

### 1. Guest/Locked (`pricingLocked={true}`)
```
┌─────────────────────────┐
│ 🔒 Pricing Locked       │
│ Login to view prices    │
│ Sign in to unlock ➜     │
└─────────────────────────┘
```

### 2. No B2B Status (`b2bStatus={null}` for logged-in user)
```
🏷️  $35.00  $45.00  
📌 Save 22%
```

### 3. Pending Approval (`b2bStatus="pending"`)
```
┌──────────────────────────────┐
│ ⏳ Pending B2B Approval       │
│ $35.00  $45.00               │
│ Request is under review...   │
└──────────────────────────────┘
```

### 4. Rejected (`b2bStatus="rejected"`)
```
┌──────────────────────────────┐
│ ❌ B2B Application Rejected  │
│ $35.00  $45.00               │
│ Contact support for details  │
│ Contact Support ➜            │
└──────────────────────────────┘
```

### 5. Approved (`b2bStatus="approved"`)
```
┌──────────────────────────────┐
│ ✅ B2B Approved ✓             │
│ $35.00  $45.00               │
│ Bulk ordering available      │
└──────────────────────────────┘
```

## Real-World Examples

### Product Grid Item
```tsx
function ProductCard({ product }) {
  const { approvalStatus, user } = useAuth()
  
  return (
    <div>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <PricingDisplay
        basePrice={product.basePrice}
        salePrice={product.salePrice}
        b2bStatus={user ? (approvalStatus || "none") : null}
        pricingLocked={!user}
        isBulkEligible={approvalStatus === "approved"}
      />
    </div>
  )
}
```

### Product Detail Page
```tsx
function ProductDetail({ productId }) {
  const { approvalStatus, user } = useAuth()
  const product = fetchProduct(productId) // fetch from API
  
  return (
    <div>
      <h1>{product.name}</h1>
      <PricingDisplay
        basePrice={product.basePrice}
        salePrice={product.salePrice}
        b2bStatus={user ? (approvalStatus || "none") : null}
        pricingLocked={!user}
        isBulkEligible={approvalStatus === "approved"}
        showSavings={true}
      />
      <AddToCart />
    </div>
  )
}
```

### Cart Summary
```tsx
function CartSummary({ items }) {
  const { approvalStatus, user } = useAuth()
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <PricingDisplay
            basePrice={item.basePrice}
            salePrice={item.salePrice}
            b2bStatus={user ? (approvalStatus || "none") : null}
            pricingLocked={!user}
            isBulkEligible={approvalStatus === "approved"}
          />
        </div>
      ))}
    </div>
  )
}
```

## Integration Checklist

- [ ] Import `PricingDisplay` and `useAuth` hook
- [ ] Get approval status: `const { approvalStatus, user } = useAuth()`
- [ ] Replace hardcoded price spans with `<PricingDisplay />`
- [ ] Pass `basePrice` and `salePrice` from product data
- [ ] Pass `b2bStatus={user ? approvalStatus : null}`
- [ ] Set `pricingLocked={!user}` for guest behavior
- [ ] Set `isBulkEligible={approvalStatus === "approved"}` for bulk features
- [ ] Test with different user states (guest, pending, approved, rejected)

## Components Already Updated

✅ `ProductGrid` - Product listing with B2B status
✅ `ProductDetail` - Single product page with approval messages
✅ `ProductShowcase` - Homepage featured products
✅ `AuthContext` - Provides `approvalStatus` via `useAuth()`

## Components Remaining (Optional)

- Cart page (if exists)
- Checkout page (if exists)
- Order history (if exists)
- Admin dashboard pricing view (if exists)

## Backend Integration

The `b2bStatus` comes from:
1. **Endpoint**: `GET /api/users/{userId}/b2b-status`
2. **Response**: Latest `b2b_requests` record with `status` field
3. **Status Values**: `pending` | `approved` | `rejected` | `none`
4. **Called**: Automatically in `AuthContext` on login/session change

## Styling

Component uses Tailwind CSS with:
- Color system: `primary`, `accent`, `destructive`
- Spacing: Consistent `gap-3`, `p-3` padding
- Icons: Lucide React icons
- Responsive: Flex layout for mobile/desktop

## Troubleshooting

**Pricing not showing?**
- Check: Is `basePrice` prop passed?
- Check: Is price being fetched from API/database?

**Wrong status message?**
- Check: Is `useAuth()` returning correct `approvalStatus`?
- Check: Is backend endpoint `/api/users/{userId}/b2b-status` working?

**Styling looks off?**
- Check: Are Tailwind CSS classes loading?
- Check: Is theme provider wrapping the component?

## Future Enhancements

- [ ] Add quantity-based pricing tiers (MOQ discounts)
- [ ] Add currency selector (USD, EUR, etc.)
- [ ] Add cart-level bulk pricing calculators
- [ ] Add B2B approval request modal directly from component
