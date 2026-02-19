/**
 * Utils Module
 * Helper functions for dates, formatting, etc.
 */

// Calculate days remaining until expiration
export function getDaysRemaining(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const expiry = new Date(expiryDate);
    // expiry.setHours(0, 0, 0, 0); 

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

// Get freshness status based on days remaining
export function getFreshnessStatus(days) {
    if (days <= 0) return { status: 'expired', label: 'Expired', color: 'var(--color-muted-black)', percent: 0 };
    if (days < 3) return { status: 'critical', label: 'Critical', color: 'var(--color-red)', percent: 20 };
    if (days <= 5) return { status: 'caution', label: 'Caution', color: 'var(--color-mustard)', percent: 50 };
    return { status: 'safe', label: 'Safe', color: 'var(--color-tea)', percent: 100 };
}

// Debounce function for search
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
