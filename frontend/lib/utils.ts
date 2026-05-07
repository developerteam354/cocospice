/**
 * Format date to readable string
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Oct 24, 2025")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format date with time
 * @param dateString - ISO date string
 * @returns Formatted date with time (e.g., "Oct 24, 2025, 14:30")
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency to GBP
 * @param amount - Amount in pounds
 * @returns Formatted currency (e.g., "£18.50")
 */
export const formatCurrency = (amount: number): string => {
  return `£${amount.toFixed(2)}`;
};

/**
 * Map backend order status to frontend status
 * @param backendStatus - Backend status string
 * @returns Frontend status
 */
export const mapOrderStatus = (backendStatus: string): 'pending' | 'confirmed' | 'on-the-way' | 'delivered' | 'cancelled' => {
  const statusMap: Record<string, 'pending' | 'confirmed' | 'on-the-way' | 'delivered' | 'cancelled'> = {
    'Pending': 'pending',
    'Confirmed': 'confirmed',
    'On the Way': 'on-the-way',
    'Delivered': 'delivered',
    'Cancelled': 'cancelled',
  };
  
  return statusMap[backendStatus] || 'pending';
};
