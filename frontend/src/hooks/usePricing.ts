import { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface PricingInfo {
  basePrice: number | null;
  salePrice: number | null;
  salePercentage: number | null;
  displayPrice: number | null;
  b2bPrice: number | null;
  b2bMinQuantity: number | null;
  moq: number | null;
  isBulkEligible: boolean;
  pricingLocked: boolean;
  userTier: 'guest' | 'user' | 'b2b_approved';
}

export function usePricing(productId: string) {
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPricing() {
      try {
        setLoading(true);
        const data = await productsAPI.getPricing(productId);
        setPricing(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch pricing');
        setPricing(null);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchPricing();
    }
  }, [productId, user?.id]);

  return { pricing, loading, error };
}

/**
 * Format price for display
 * Returns formatted price or "Contact for pricing" if locked
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return 'Contact for pricing';
  }
  return `$${price.toFixed(2)}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Get effective price based on quantity
 */
export function getEffectivePrice(
  basePrice: number | null,
  salePrice: number | null,
  b2bPrice: number | null,
  quantity: number,
  b2bMinQuantity: number | null,
  isBulkEligible: boolean
): number | null {
  // If pricing is locked, return null
  if (basePrice === null) return null;

  // Check if eligible for B2B pricing
  if (isBulkEligible && b2bPrice && b2bMinQuantity && quantity >= b2bMinQuantity) {
    return b2bPrice;
  }

  // Use sale price if available, otherwise base price
  return salePrice || basePrice;
}
