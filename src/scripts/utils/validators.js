/**
 * Form Validation Utilities
 * 
 * Provides reusable validation functions for form inputs with comprehensive
 * error messaging and support for multiple input formats.
 * 
 * @module validators
 * @version 1.0.0
 */

/**
 * Email validation regex pattern (RFC 5322 compliant)
 * Validates standard email formats including:
 * - Local part with alphanumeric, dots, hyphens, underscores
 * - Domain with alphanumeric, dots, hyphens
 * - TLD with 2-63 characters
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Phone number validation patterns
 * Supports multiple common formats:
 * - (123) 456-7890
 * - 123-456-7890
 * - 123.456.7890
 * - 1234567890
 * - +1 123 456 7890
 * - +1-123-456-7890
 */
const PHONE_PATTERNS = [
  /^\(\d{3}\)\s?\d{3}-\d{4}$/, // (123) 456-7890 or (123)456-7890
  /^\d{3}-\d{3}-\d{4}$/, // 123-456-7890
  /^\d{3}\.\d{3}\.\d{4}$/, // 123.456.7890
  /^\d{10}$/, // 1234567890
  /^\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, // +1 123 456 7890, +1-123-456-7890, etc.
  /^\+\d{1,3}\s?\d{1,14}$/, // International format: +XX XXXXXXXXXXX
];

/**
 * Validation result object structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string} error - Error message if validation failed, empty string if valid
 */

/**
 * Validates email address format
 * 
 * Checks if the provided email matches RFC 5322 standard format.
 * Performs additional checks for common issues like consecutive dots,
 * leading/trailing dots, and invalid characters.
 * 
 * @param {string} email - Email address to validate
 * @returns {ValidationResult} Validation result with isValid flag and error message
 * 
 * @example
 * validateEmail('user@example.com')
 * // Returns: { isValid: true, error: '' }
 * 
 * validateEmail('invalid.email')
 * // Returns: { isValid: false, error: 'Please enter a valid email address' }
 */
export function validateEmail(email) {
  /* Handle null, undefined, or non-string inputs */
  if (email === null || email === undefined) {
    return {
      isValid: false,
      error: 'Email address is required',
    };
  }

  /* Convert to string and trim whitespace */
  const emailStr = String(email).trim();

  /* Check for empty string */
  if (emailStr.length === 0) {
    return {
      isValid: false,
      error: 'Email address is required',
    };
  }

  /* Check maximum length (RFC 5321 limit) */
  if (emailStr.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long (maximum 254 characters)',
    };
  }

  /* Check for consecutive dots */
  if (emailStr.includes('..')) {
    return {
      isValid: false,
      error: 'Email address cannot contain consecutive dots',
    };
  }

  /* Check for leading or trailing dots */
  if (emailStr.startsWith('.') || emailStr.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email address cannot start or end with a dot',
    };
  }

  /* Validate against regex pattern */
  if (!EMAIL_REGEX.test(emailStr)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., user@example.com)',
    };
  }

  /* Split and validate local and domain parts */
  const [localPart, domainPart] = emailStr.split('@');

  /* Validate local part length (RFC 5321) */
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email local part is too long (maximum 64 characters)',
    };
  }

  /* Validate domain part */
  if (!domainPart || domainPart.length === 0) {
    return {
      isValid: false,
      error: 'Email address must include a domain',
    };
  }

  /* Check for valid TLD */
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return {
      isValid: false,
      error: 'Email domain must include a top-level domain (e.g., .com)',
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Email top-level domain must be at least 2 characters',
    };
  }

  return {
    isValid: true,
    error: '',
  };
}

/**
 * Validates phone number format
 * 
 * Accepts multiple common phone number formats including:
 * - US formats: (123) 456-7890, 123-456-7890, 1234567890
 * - International formats: +1 123 456 7890, +44 20 1234 5678
 * 
 * @param {string} phone - Phone number to validate
 * @returns {ValidationResult} Validation result with isValid flag and error message
 * 
 * @example
 * validatePhone('(123) 456-7890')
 * // Returns: { isValid: true, error: '' }
 * 
 * validatePhone('123')
 * // Returns: { isValid: false, error: 'Please enter a valid phone number' }
 */
export function validatePhone(phone) {
  /* Handle null, undefined, or non-string inputs */
  if (phone === null || phone === undefined) {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  /* Convert to string and trim whitespace */
  const phoneStr = String(phone).trim();

  /* Check for empty string */
  if (phoneStr.length === 0) {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  /* Check minimum length (at least 10 digits for most formats) */
  const digitsOnly = phoneStr.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      error: 'Phone number must contain at least 10 digits',
    };
  }

  /* Check maximum length (international numbers can be up to 15 digits) */
  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      error: 'Phone number is too long (maximum 15 digits)',
    };
  }

  /* Test against all supported patterns */
  const isValidFormat = PHONE_PATTERNS.some(pattern => pattern.test(phoneStr));

  if (!isValidFormat) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number (e.g., (123) 456-7890 or 123-456-7890)',
    };
  }

  return {
    isValid: true,
    error: '',
  };
}

/**
 * Validates that a field is not empty
 * 
 * Checks for null, undefined, empty strings, and strings with only whitespace.
 * Provides field-specific error messages when fieldName is provided.
 * 
 * @param {*} value - Value to validate
 * @param {string} [fieldName='This field'] - Name of the field for error message
 * @returns {ValidationResult} Validation result with isValid flag and error message
 * 
 * @example
 * validateRequired('John Doe', 'Name')
 * // Returns: { isValid: true, error: '' }
 * 
 * validateRequired('', 'Name')
 * // Returns: { isValid: false, error: 'Name is required' }
 * 
 * validateRequired('   ')
 * // Returns: { isValid: false, error: 'This field is required' }
 */
export function validateRequired(value, fieldName = 'This field') {
  /* Handle null or undefined */
  if (value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  /* Convert to string and check for empty or whitespace-only */
  const valueStr = String(value).trim();

  if (valueStr.length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return {
    isValid: true,
    error: '',
  };
}

/**
 * Validates string length constraints
 * 
 * Checks if a string meets minimum and/or maximum length requirements.
 * Supports validation with only min, only max, or both constraints.
 * 
 * @param {string} value - String value to validate
 * @param {Object} options - Length constraints
 * @param {number} [options.min] - Minimum length (inclusive)
 * @param {number} [options.max] - Maximum length (inclusive)
 * @param {string} [options.fieldName='This field'] - Field name for error messages
 * @returns {ValidationResult} Validation result with isValid flag and error message
 * 
 * @example
 * validateLength('Hello', { min: 3, max: 10 })
 * // Returns: { isValid: true, error: '' }
 * 
 * validateLength('Hi', { min: 3, fieldName: 'Message' })
 * // Returns: { isValid: false, error: 'Message must be at least 3 characters' }
 * 
 * validateLength('Very long text...', { max: 10, fieldName: 'Name' })
 * // Returns: { isValid: false, error: 'Name must not exceed 10 characters' }
 */
export function validateLength(value, options = {}) {
  const {
    min,
    max,
    fieldName = 'This field',
  } = options;

  /* Validate options */
  if (min !== undefined && (typeof min !== 'number' || min < 0)) {
    throw new Error('min must be a non-negative number');
  }

  if (max !== undefined && (typeof max !== 'number' || max < 0)) {
    throw new Error('max must be a non-negative number');
  }

  if (min !== undefined && max !== undefined && min > max) {
    throw new Error('min cannot be greater than max');
  }

  /* Handle null or undefined */
  if (value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  /* Convert to string and get length */
  const valueStr = String(value);
  const length = valueStr.length;

  /* Check minimum length */
  if (min !== undefined && length < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min} character${min === 1 ? '' : 's'}`,
    };
  }

  /* Check maximum length */
  if (max !== undefined && length > max) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${max} character${max === 1 ? '' : 's'}`,
    };
  }

  return {
    isValid: true,
    error: '',
  };
}

/**
 * Validates multiple fields at once
 * 
 * Convenience function to validate multiple form fields and aggregate results.
 * Returns all validation results and a flag indicating if all validations passed.
 * 
 * @param {Object} validations - Object mapping field names to validation functions
 * @returns {Object} Aggregated validation results
 * @returns {boolean} return.isValid - True if all validations passed
 * @returns {Object} return.errors - Object mapping field names to error messages
 * @returns {Object} return.results - Object mapping field names to full ValidationResult objects
 * 
 * @example
 * const results = validateAll({
 *   email: () => validateEmail('user@example.com'),
 *   phone: () => validatePhone('123-456-7890'),
 *   name: () => validateRequired('John', 'Name')
 * });
 * // Returns: {
 * //   isValid: true,
 * //   errors: {},
 * //   results: { email: {...}, phone: {...}, name: {...} }
 * // }
 */
export function validateAll(validations) {
  if (!validations || typeof validations !== 'object' || Array.isArray(validations)) {
    throw new Error('validations must be an object');
  }

  const results = {};
  const errors = {};
  let isValid = true;

  for (const [fieldName, validationFn] of Object.entries(validations)) {
    try {
      if (typeof validationFn !== 'function') {
        throw new Error(`Validation for ${fieldName} must be a function`);
      }

      const result = validationFn();

      if (!result || typeof result !== 'object' || typeof result.isValid !== 'boolean') {
        throw new Error(`Validation function for ${fieldName} must return a ValidationResult object`);
      }

      results[fieldName] = result;

      if (!result.isValid) {
        isValid = false;
        errors[fieldName] = result.error;
      }
    } catch (error) {
      isValid = false;
      errors[fieldName] = `Validation error: ${error.message}`;
      results[fieldName] = {
        isValid: false,
        error: `Validation error: ${error.message}`,
      };
    }
  }

  return {
    isValid,
    errors,
    results,
  };
}

/**
 * Testing utilities for internal functions
 * Exported only for testing purposes
 * @private
 */
export const __testing__ = {
  EMAIL_REGEX,
  PHONE_PATTERNS,
};