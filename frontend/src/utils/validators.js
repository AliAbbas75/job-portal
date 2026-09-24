export const isValidCnic = (value) => /^\d{5}-\d{7}-\d$/.test(value);

/** Pakistani mobile numbers: 03XXXXXXXXX, with or without a dash after the network code. */
export const isValidMobile = (value) => /^03\d{2}-?\d{7}$/.test(value);

export const isValidOtp = (value) => /^\d{6}$/.test(value);

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isBlank = (value) => value == null || String(value).trim() === '';
