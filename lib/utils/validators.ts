// Validation utilities

// Email validation
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (min 8 characters)
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password minimal 8 karakter' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung huruf kecil' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung huruf besar' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung angka' };
    }

    return { valid: true };
};

// Phone number validation (Indonesian format)
export const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it starts with 0 or 62 and has correct length
    if (cleaned.startsWith('0')) {
        return cleaned.length >= 10 && cleaned.length <= 13;
    } else if (cleaned.startsWith('62')) {
        return cleaned.length >= 11 && cleaned.length <= 14;
    }

    return false;
};

// PIN validation (6 digits)
export const validatePIN = (pin: string): boolean => {
    const pinRegex = /^\d{6}$/;
    return pinRegex.test(pin);
};

// Full name validation
export const validateFullName = (name: string): boolean => {
    return name.trim().length >= 3;
};
