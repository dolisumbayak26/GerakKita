import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Format currency to Rupiah
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Format date to readable format
export const formatDate = (date: string | Date, formatString = 'dd MMM yyyy'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: idLocale });
};

// Format datetime to readable format
export const formatDateTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd MMM yyyy, HH:mm', { locale: idLocale });
};

// Format time only
export const formatTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'HH:mm', { locale: idLocale });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: idLocale });
};

// Format duration (e.g., "1 hour 30 minutes")
export const formatDuration = (intervalString: string): string => {
    // Parse PostgreSQL interval format (e.g., "01:30:00")
    const parts = intervalString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (hours > 0 && minutes > 0) {
        return `${hours} jam ${minutes} menit`;
    } else if (hours > 0) {
        return `${hours} jam`;
    } else {
        return `${minutes} menit`;
    }
};

// Format ETA (e.g., "5 menit" or "Tiba dalam 5 menit")
export const formatETA = (minutes: number, withPrefix = false): string => {
    if (minutes < 1) {
        return 'Tiba sebentar lagi';
    }

    const text = `${minutes} menit`;
    return withPrefix ? `Tiba dalam ${text}` : text;
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as +62-XXX-XXXX-XXXX
    if (cleaned.startsWith('62')) {
        const match = cleaned.match(/^62(\d{3})(\d{4})(\d{4})$/);
        if (match) {
            return `+62-${match[1]}-${match[2]}-${match[3]}`;
        }
    } else if (cleaned.startsWith('0')) {
        const match = cleaned.match(/^0(\d{3})(\d{4})(\d{4})$/);
        if (match) {
            return `+62-${match[1]}-${match[2]}-${match[3]}`;
        }
    }

    return phone;
};

// Mask phone number for privacy
export const maskPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
        return `+62-${cleaned.slice(2, 5)}-****-${cleaned.slice(-4)}`;
    }
    return phone;
};

// Format bus number
export const formatBusNumber = (busNumber: string): string => {
    return busNumber.toUpperCase();
};

// Format route number
export const formatRouteNumber = (routeNumber: string): string => {
    return routeNumber.toUpperCase();
};
