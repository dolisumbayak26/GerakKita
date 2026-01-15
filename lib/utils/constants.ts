// App-wide constants

export const COLORS = {
    primary: '#0EA5E9',
    primaryDark: '#0284C7',
    secondary: '#06B6D4',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    white: '#FFFFFF',
    black: '#000000',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
    background: '#F9FAFB',
    text: {
        primary: '#111827',
        secondary: '#6B7280',
        light: '#9CA3AF',
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FONT_SIZE = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};

// Payment methods
export const PAYMENT_METHODS = [
    { id: 'gopay', name: 'GoPay', icon: 'wallet', type: 'ewallet' },
    { id: 'ovo', name: 'OVO', icon: 'wallet', type: 'ewallet' },
    { id: 'dana', name: 'Dana', icon: 'wallet', type: 'ewallet' },
    { id: 'shopeepay', name: 'ShopeePay', icon: 'wallet', type: 'ewallet' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: 'bank', type: 'bank' },
    { id: 'credit_card', name: 'Credit/Debit Card', icon: 'card', type: 'card' },
] as const;

// Bus status colors
export const BUS_STATUS_COLORS = {
    available: COLORS.success,
    full: COLORS.error,
    maintenance: COLORS.warning,
    out_of_service: COLORS.gray[400],
};

// Ticket status colors
export const TICKET_STATUS_COLORS = {
    active: COLORS.success,
    used: COLORS.gray[400],
    expired: COLORS.error,
    cancelled: COLORS.warning,
};

// Transaction status colors
export const TRANSACTION_STATUS_COLORS = {
    pending: COLORS.warning,
    completed: COLORS.success,
    failed: COLORS.error,
    refunded: COLORS.gray[400],
    expired: COLORS.error,
};
