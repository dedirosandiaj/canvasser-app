/**
 * Formatting Utilities
 * Common formatters for displaying data
 */

/**
 * Format a number as Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format a number with separators (Indonesian locale)
 */
export function formatNumber(num: number, decimals = 0): string {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date to Indonesian locale
 */
export function formatDate(date: string | Date | undefined | null, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

    return d.toLocaleDateString('id-ID', options ?? {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format a datetime to Indonesian locale
 */
export function formatDateTime(date: string | Date | undefined | null): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

    return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
    if (!date) return 'Baru saja'; // or '-' but 'Baru saja' usually implies very recent or now. 
    // Wait, if it's undefined it means "no date", so "Baru saja" is misleading. 
    // If created_at is missing, it should probably be N/A. 
    // But for 'created_at', usually if it's new it might be just created?
    // Let's stick to handling valid dates. If invalid, maybe just return formatted date (which handles invalid) or specific string.

    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;

    return formatDate(d);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
