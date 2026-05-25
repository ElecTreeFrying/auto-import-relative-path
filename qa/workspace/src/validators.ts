const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export const isEmail = (value: string): boolean => EMAIL_PATTERN.test(value);
export const isUrl = (value: string): boolean => URL_PATTERN.test(value);
export const isNonEmpty = (value: string): boolean => value.trim().length > 0;
