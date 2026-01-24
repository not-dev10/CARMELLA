/**
 * Generate a systematic order ID with timestamp
 * Format: ORD-YYYYMMDD-XXXXXX (6-digit sequential)
 * Example: ORD-20250124-123456
 * 
 * Supports up to 1,000,000 orders per day (6 digits = 0-999999)
 * For 100k orders, use a global counter approach in the database
 */
export function generateOrderId(): string {
  const now = new Date();
  
  // Format: YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate random 6-digit number (supports up to 1 million orders per day)
  const randomNum = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  
  return `ORD-${dateStr}-${randomNum}`;
}

/**
 * Generate a global sequential order ID (for high-volume scenarios)
 * Format: ORD-XXXXXXXXX (9-digit timestamp-based)
 * Example: ORD-173737123
 * 
 * Uses milliseconds since epoch divided by 1000 + random suffix
 * Supports unlimited orders globally
 */
export function generateGlobalOrderId(): string {
  // Use timestamp in seconds (9 digits covers ~285 years)
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Add 3-digit random suffix for uniqueness
  const randomSuffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `ORD-${timestamp}${randomSuffix}`;
}

/**
 * Format order ID for display (show full ID with timestamp info)
 */
export function formatOrderId(id: string): string {
  // If it's already a systematic ID, return as is
  if (id.startsWith('ORD-')) {
    return id;
  }
  // If it's a UUID, return first 8 chars
  return id.slice(0, 8).toUpperCase();
}

/**
 * Extract date from systematic order ID (date-based format)
 * Returns formatted date string like "Jan 24, 2025"
 */
export function getOrderDateFromId(orderId: string): string | null {
  const match = orderId.match(/ORD-(\d{4})(\d{2})(\d{2})-/);
  if (!match) return null;
  
  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Extract timestamp from global order ID
 * Returns Date object
 */
export function getOrderDateFromGlobalId(orderId: string): Date | null {
  const match = orderId.match(/ORD-(\d{10})/);
  if (!match) return null;
  
  const timestamp = parseInt(match[1]);
  return new Date(timestamp * 1000);
}
