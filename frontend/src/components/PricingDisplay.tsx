import { Lock } from 'lucide-react';
import Link from '@/components/ui/link-shim';
import { formatPrice, calculateDiscount } from '@/hooks/usePricing';
import { Badge } from '@/components/ui/badge';

interface PricingDisplayProps {
  basePrice: number | null;
  salePrice?: number | null;
  b2bPrice?: number | null;
  b2bMinQuantity?: number | null;
  isBulkEligible?: boolean;
  pricingLocked?: boolean;
  userTier?: 'guest' | 'user' | 'b2b_approved' | 'b2b_pending' | 'b2b_rejected';
  className?: string;
  showSavings?: boolean;
}

export function PricingDisplay({
  basePrice,
  salePrice,
  b2bPrice,
  b2bMinQuantity,
  isBulkEligible,
  pricingLocked = false,
  userTier = 'guest',
  className = '',
  showSavings = true,
}: PricingDisplayProps) {

  // Pricing is locked - show different messages based on user tier
  if (pricingLocked || basePrice === null) {
    const message = userTier === 'guest'
      ? 'Login to view pricing'
      : 'Request B2B approval to see prices';

    const linkText = userTier === 'guest'
      ? 'Sign in →'
      : 'Request approval →';

    const linkHref = userTier === 'guest'
      ? '/auth/signin'
      : '/b2b-request';

    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <Lock className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">Pricing Locked</p>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        </div>
        <Link href={linkHref} className="text-xs font-medium text-primary hover:underline">
          {linkText}
        </Link>
      </div>
    );
  }

  const displayPrice = salePrice || basePrice;
  const discount = salePrice ? calculateDiscount(basePrice, salePrice) : 0;
  const hasBulkPrice = isBulkEligible && b2bPrice && b2bMinQuantity;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Main pricing */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(displayPrice)}
        </span>
        {salePrice && basePrice > salePrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(basePrice)}
          </span>
        )}
      </div>

      {/* Sale badge */}
      {discount > 0 && showSavings && (
        <Badge variant="destructive" className="w-fit">
          Save {discount}%
        </Badge>
      )}

      {/* B2B pricing info */}
      {hasBulkPrice && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">
            Bulk pricing available:
          </p>
          <p className="text-sm font-semibold">
            {formatPrice(b2bPrice)} for {b2bMinQuantity}+ units
          </p>
        </div>
      )}

      {/* Non-approved user message */}
      {!isBulkEligible && b2bPrice && (
        <div className="pt-2 border-t border-border">
          <Link href="/b2b-request" className="text-xs text-primary font-medium hover:underline">
            📊 Request B2B Pricing Access →
          </Link>
        </div>
      )}
    </div>
  );
}
