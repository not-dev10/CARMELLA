/**
 * Secure Pricing Utilities
 * 
 * These utilities help interact with the products_safe view
 * which implements database-level pricing security via RLS
 */

import { supabase } from "../config/supabase.js";

/**
 * Get products with secure pricing
 * Uses products_safe view which automatically applies RLS pricing rules
 * 
 * @param filters - Optional filters (category, search, etc.)
 * @param userId - Current user ID (optional, for auth context)
 * @returns Products with pricing based on user's B2B approval status
 */
export async function getSecureProducts(filters?: {
    categoryId?: string;
    search?: string;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
}) {
    let query = supabase.from("products_safe").select("*", { count: "exact" });

    if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
    }

    if (filters?.search) {
        // ✅ OPTIMIZED: Search only on name (faster than OR on multiple columns)
        // Description search is rarely used and significantly slows down queries
        query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.isFeatured !== undefined) {
        query = query.eq("is_featured", filters.isFeatured);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset !== undefined) {
        query = query.range(
            filters.offset,
            filters.offset + (filters.limit || 10) - 1
        );
    }

    return query;
}

/**
 * Get single product with secure pricing
 * 
 * @param productId - Product ID or slug
 * @param bySlug - If true, search by slug instead of ID
 */
export async function getSecureProduct(
    productId: string,
    bySlug: boolean = false
) {
    const query = supabase
        .from("products_safe")
        .select("*")
        .eq(bySlug ? "slug" : "id", productId)
        .single();

    return query;
}

/**
 * Check if user can see pricing
 * 
 * @param userId - User ID to check
 * @returns Object with pricing access info
 */
export async function checkPricingAccess(userId?: string) {
    if (!userId) {
        return {
            canSeePricing: false,
            userTier: "guest",
            b2bApprovalStatus: "none",
            message: "Please log in to view pricing",
        };
    }

    const { data: user } = await supabase
        .from("users")
        .select("b2b_approval_status, is_b2b_user")
        .eq("id", userId)
        .single();

    const isApproved = user?.b2b_approval_status === "approved";

    return {
        canSeePricing: isApproved,
        userTier: isApproved ? "b2b_approved" : "user",
        b2bApprovalStatus: user?.b2b_approval_status || "none",
        isB2bUser: user?.is_b2b_user || false,
        message: isApproved
            ? "Full pricing access"
            : user?.b2b_approval_status === "pending"
                ? "B2B approval pending"
                : "Request B2B approval to view pricing",
    };
}

/**
 * Calculate order total with secure pricing
 * Fetches current prices from products_safe view
 * 
 * @param cartItems - Array of {product_id, quantity}
 * @param userId - User ID for pricing context
 */
export async function calculateSecureOrderTotal(
    cartItems: Array<{ product_id: string; quantity: number }>,
    userId: string
) {
    // Get pricing access info
    const pricingAccess = await checkPricingAccess(userId);

    if (!pricingAccess.canSeePricing) {
        throw new Error(
            "B2B approval required to place orders. Please request approval first."
        );
    }

    // Fetch products with secure pricing
    const productIds = cartItems.map((item) => item.product_id);
    const { data: products, error } = await supabase
        .from("products_safe")
        .select("id, base_price, sale_price, b2b_price, moq")
        .in("id", productIds);

    if (error || !products) {
        throw new Error("Failed to fetch product pricing");
    }

    // Calculate total
    let total = 0;
    const orderItems = cartItems.map((item) => {
        const product = products.find((p) => p.id === item.product_id);

        if (!product) {
            throw new Error(`Product ${item.product_id} not found`);
        }

        // Check if any price is available (should be for approved users)
        const price =
            product.b2b_price || product.sale_price || product.base_price;

        if (!price) {
            throw new Error(
                "Pricing not available. Please ensure B2B approval is active."
            );
        }

        // Check MOQ
        if (product.moq && item.quantity < product.moq) {
            throw new Error(
                `Minimum order quantity for ${product.id} is ${product.moq}`
            );
        }

        total += price * item.quantity;

        return {
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: price,
        };
    });

    return {
        total,
        orderItems,
        pricingTier: pricingAccess.userTier,
    };
}

/**
 * Format pricing for frontend display
 * Handles null prices gracefully
 */
export function formatPricingResponse(product: any) {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.image_url,

        // Pricing info
        pricing: {
            basePrice: product.base_price,
            salePrice: product.sale_price,
            salePercentage: product.sale_percentage,
            b2bPrice: product.b2b_price,
            displayPrice: product.sale_price || product.base_price,
            isLocked: product.pricing_locked,
        },

        // B2B info
        b2b: {
            minQuantity: product.b2b_min_quantity,
            moq: product.moq,
            isEligible: product.user_tier === "b2b_approved",
        },

        // User context
        userTier: product.user_tier,

        // Product details
        badge: product.badge,
        features: product.features,
        stockQuantity: product.stock_quantity,
        isFeatured: product.is_featured,
    };
}
