/**
 * Comprehensive Test Suite for Form Validation Utilities
 * 
 * Tests all validation functions with extensive coverage including:
 * - Valid inputs across multiple formats
 * - Invalid inputs and edge cases
 * - Boundary conditions
 * - Error handling
 * - Type coercion scenarios
 * 
 * @module validators.test
 * @version 1.0.0
 */

import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateLength,
  validateAll,
  __testing__,
} from '../../src/scripts/utils/validators.js';

/* ============================================================================
 * EMAIL VALIDATION TESTS
 * ========================================================================== */

describe('validateEmail', () => {
  describe('✅ Valid Email Addresses', () => {
    test('should accept standard email format', () => {
      const result = validateEmail('user@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with subdomain', () => {
      const result = validateEmail('user@mail.example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with plus sign', () => {
      const result = validateEmail('user+tag@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with dots in local part', () => {
      const result = validateEmail('first.last@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with numbers', () => {
      const result = validateEmail('user123@example456.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with hyphens in domain', () => {
      const result = validateEmail('user@my-domain.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with underscores', () => {
      const result = validateEmail('user_name@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with special characters', () => {
      const result = validateEmail('user!#$%&*@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with long TLD', () => {
      const result = validateEmail('user@example.museum');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept email with multiple subdomains', () => {
      const result = validateEmail('user@mail.corp.example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('❌ Invalid Email Addresses', () => {
    test('should reject null input', () => {
      const result = validateEmail(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address is required');
    });

    test('should reject undefined input', () => {
      const result = validateEmail(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address is required');
    });

    test('should reject empty string', () => {
      const result = validateEmail('');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address is required');
    });

    test('should reject whitespace-only string', () => {
      const result = validateEmail('   ');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address is required');
    });

    test('should reject email without @ symbol', () => {
      const result = validateEmail('userexample.com');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address (e.g., user@example.com)');
    });

    test('should reject email without domain', () => {
      const result = validateEmail('user@');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address must include a domain');
    });

    test('should reject email without TLD', () => {
      const result = validateEmail('user@example');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email domain must include a top-level domain (e.g., .com)');
    });

    test('should reject email with consecutive dots', () => {
      const result = validateEmail('user..name@example.com');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address cannot contain consecutive dots');
    });

    test('should reject email starting with dot', () => {
      const result = validateEmail('.user@example.com');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address cannot start or end with a dot');
    });

    test('should reject email ending with dot', () => {
      const result = validateEmail('user.@example.com');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address cannot start or end with a dot');
    });

    test('should reject email with spaces', () => {
      const result = validateEmail('user name@example.com');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address (e.g., user@example.com)');
    });

    test('should reject email with multiple @ symbols', () => {
      const result = validateEmail('user@@example.com');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address (e.g., user@example.com)');
    });

    test('should reject email with TLD less than 2 characters', () => {
      const result = validateEmail('user@example.c');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email top-level domain must be at least 2 characters');
    });
  });

  describe('🔍 Edge Cases and Boundary Conditions', () => {
    test('should trim whitespace from email', () => {
      const result = validateEmail('  user@example.com  ');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should reject email exceeding 254 characters', () => {
      const longEmail = 'a'.repeat(245) + '@test.com';
      const result = validateEmail(longEmail);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address is too long (maximum 254 characters)');
    });

    test('should accept email at exactly 254 characters', () => {
      const maxEmail = 'a'.repeat(240) + '@example.com';
      const result = validateEmail(maxEmail);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should reject local part exceeding 64 characters', () => {
      const longLocal = 'a'.repeat(65) + '@example.com';
      const result = validateEmail(longLocal);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email local part is too long (maximum 64 characters)');
    });

    test('should accept local part at exactly 64 characters', () => {
      const maxLocal = 'a'.repeat(64) + '@example.com';
      const result = validateEmail(maxLocal);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle number input by converting to string', () => {
      const result = validateEmail(12345);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address (e.g., user@example.com)');
    });

    test('should handle boolean input by converting to string', () => {
      const result = validateEmail(true);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address (e.g., user@example.com)');
    });

    test('should handle object input by converting to string', () => {
      const result = validateEmail({ email: 'test@example.com' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address (e.g., user@example.com)');
    });
  });

  describe('🎯 Real-World Email Formats', () => {
    test('should accept Gmail address', () => {
      const result = validateEmail('john.doe@gmail.com');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept corporate email', () => {
      const result = validateEmail('employee@company.co.uk');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept educational email', () => {
      const result = validateEmail('student@university.edu');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept government email', () => {
      const result = validateEmail('official@agency.gov');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });
});

/* ============================================================================
 * PHONE VALIDATION TESTS
 * ========================================================================== */

describe('validatePhone', () => {
  describe('✅ Valid Phone Numbers', () => {
    test('should accept US format with parentheses and hyphen', () => {
      const result = validatePhone('(123) 456-7890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept US format with parentheses no space', () => {
      const result = validatePhone('(123)456-7890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept US format with hyphens', () => {
      const result = validatePhone('123-456-7890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept US format with dots', () => {
      const result = validatePhone('123.456.7890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept 10 digits without formatting', () => {
      const result = validatePhone('1234567890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept international format with plus', () => {
      const result = validatePhone('+1 123 456 7890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept international format with country code', () => {
      const result = validatePhone('+44 20 1234 5678');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept format with country code and hyphens', () => {
      const result = validatePhone('+1-123-456-7890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept 11 digit number with country code', () => {
      const result = validatePhone('11234567890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept international format with spaces', () => {
      const result = validatePhone('+33 1 23 45 67 89');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('❌ Invalid Phone Numbers', () => {
    test('should reject null input', () => {
      const result = validatePhone(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('should reject undefined input', () => {
      const result = validatePhone(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('should reject empty string', () => {
      const result = validatePhone('');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('should reject whitespace-only string', () => {
      const result = validatePhone('   ');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('should reject phone with less than 10 digits', () => {
      const result = validatePhone('123456789');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number must contain at least 10 digits');
    });

    test('should reject phone with more than 15 digits', () => {
      const result = validatePhone('1234567890123456');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is too long (maximum 15 digits)');
    });

    test('should reject invalid format with letters', () => {
      const result = validatePhone('123-ABC-7890');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid phone number (e.g., (123) 456-7890 or 123-456-7890)');
    });

    test('should reject invalid format with special characters', () => {
      const result = validatePhone('123@456#7890');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid phone number (e.g., (123) 456-7890 or 123-456-7890)');
    });

    test('should reject incomplete format', () => {
      const result = validatePhone('(123) 456-');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number must contain at least 10 digits');
    });

    test('should reject format with only 3 digits', () => {
      const result = validatePhone('123');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number must contain at least 10 digits');
    });
  });

  describe('🔍 Edge Cases and Boundary Conditions', () => {
    test('should trim whitespace from phone number', () => {
      const result = validatePhone('  (123) 456-7890  ');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept exactly 10 digits', () => {
      const result = validatePhone('1234567890');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept exactly 15 digits', () => {
      const result = validatePhone('+123456789012345');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle number input by converting to string', () => {
      const result = validatePhone(1234567890);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle boolean input by converting to string', () => {
      const result = validatePhone(true);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number must contain at least 10 digits');
    });

    test('should handle object input by converting to string', () => {
      const result = validatePhone({ phone: '1234567890' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid phone number (e.g., (123) 456-7890 or 123-456-7890)');
    });
  });

  describe('🎯 Real-World Phone Formats', () => {
    test('should accept US mobile number', () => {
      const result = validatePhone('(555) 123-4567');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept UK phone number', () => {
      const result = validatePhone('+44 20 7946 0958');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept Australian phone number', () => {
      const result = validatePhone('+61 2 1234 5678');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept German phone number', () => {
      const result = validatePhone('+49 30 12345678');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });
});

/* ============================================================================
 * REQUIRED FIELD VALIDATION TESTS
 * ========================================================================== */

describe('validateRequired', () => {
  describe('✅ Valid Required Fields', () => {
    test('should accept non-empty string', () => {
      const result = validateRequired('John Doe');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept string with custom field name', () => {
      const result = validateRequired('John Doe', 'Name');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept number value', () => {
      const result = validateRequired(123);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept zero as valid', () => {
      const result = validateRequired(0);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept boolean true', () => {
      const result = validateRequired(true);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept boolean false', () => {
      const result = validateRequired(false);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept object', () => {
      const result = validateRequired({ key: 'value' });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept array', () => {
      const result = validateRequired([1, 2, 3]);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('❌ Invalid Required Fields', () => {
    test('should reject null with default field name', () => {
      const result = validateRequired(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    test('should reject undefined with default field name', () => {
      const result = validateRequired(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    test('should reject empty string with default field name', () => {
      const result = validateRequired('');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    test('should reject whitespace-only string with default field name', () => {
      const result = validateRequired('   ');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    test('should reject null with custom field name', () => {
      const result = validateRequired(null, 'Username');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    test('should reject undefined with custom field name', () => {
      const result = validateRequired(undefined, 'Email');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    test('should reject empty string with custom field name', () => {
      const result = validateRequired('', 'Password');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    test('should reject whitespace-only with custom field name', () => {
      const result = validateRequired('   ', 'Description');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Description is required');
    });
  });

  describe('🔍 Edge Cases and Type Coercion', () => {
    test('should trim whitespace before validation', () => {
      const result = validateRequired('  value  ');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should convert number to string', () => {
      const result = validateRequired(42, 'Age');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle negative numbers', () => {
      const result = validateRequired(-5);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle empty array as valid', () => {
      const result = validateRequired([]);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle empty object as valid', () => {
      const result = validateRequired({});
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle NaN as valid (converts to "NaN" string)', () => {
      const result = validateRequired(NaN);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });
});

/* ============================================================================
 * LENGTH VALIDATION TESTS
 * ========================================================================== */

describe('validateLength', () => {
  describe('✅ Valid Length Constraints', () => {
    test('should accept string within min and max bounds', () => {
      const result = validateLength('Hello', { min: 3, max: 10 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept string at minimum length', () => {
      const result = validateLength('Hi', { min: 2, max: 10 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept string at maximum length', () => {
      const result = validateLength('HelloWorld', { min: 2, max: 10 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept string with only min constraint', () => {
      const result = validateLength('Hello', { min: 3 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept string with only max constraint', () => {
      const result = validateLength('Hello', { max: 10 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept empty string with no constraints', () => {
      const result = validateLength('', {});
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should accept string with custom field name', () => {
      const result = validateLength('Hello', { min: 3, max: 10, fieldName: 'Message' });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('❌ Invalid Length Constraints', () => {
    test('should reject string below minimum length', () => {
      const result = validateLength('Hi', { min: 3, fieldName: 'Message' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message must be at least 3 characters');
    });

    test('should reject string above maximum length', () => {
      const result = validateLength('Very long text', { max: 10, fieldName: 'Name' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name must not exceed 10 characters');
    });

    test('should reject null value', () => {
      const result = validateLength(null, { min: 3 });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    test('should reject undefined value', () => {
      const result = validateLength(undefined, { min: 3 });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    test('should reject null with custom field name', () => {
      const result = validateLength(null, { min: 3, fieldName: 'Username' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });
  });

  describe('🔍 Edge Cases and Boundary Conditions', () => {
    test('should handle zero minimum length', () => {
      const result = validateLength('', { min: 0, max: 10 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle zero maximum length', () => {
      const result = validateLength('', { min: 0, max: 0 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle single character minimum (singular)', () => {
      const result = validateLength('', { min: 1, fieldName: 'Code' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Code must be at least 1 character');
    });

    test('should handle single character maximum (singular)', () => {
      const result = validateLength('AB', { max: 1, fieldName: 'Code' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Code must not exceed 1 character');
    });

    test('should convert number to string for length check', () => {
      const result = validateLength(12345, { min: 3, max: 10 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle boolean conversion', () => {
      const result = validateLength(true, { min: 3, max: 10 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should handle object conversion', () => {
      const result = validateLength({ key: 'value' }, { min: 5, max: 20 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('⚠️ Option Validation Errors', () => {
    test('should throw error for negative min', () => {
      expect(() => {
        validateLength('test', { min: -1 });
      }).toThrow('min must be a non-negative number');
    });

    test('should throw error for non-numeric min', () => {
      expect(() => {
        validateLength('test', { min: 'invalid' });
      }).toThrow('min must be a non-negative number');
    });

    test('should throw error for negative max', () => {
      expect(() => {
        validateLength('test', { max: -1 });
      }).toThrow('max must be a non-negative number');
    });

    test('should throw error for non-numeric max', () => {
      expect(() => {
        validateLength('test', { max: 'invalid' });
      }).toThrow('max must be a non-negative number');
    });

    test('should throw error when min > max', () => {
      expect(() => {
        validateLength('test', { min: 10, max: 5 });
      }).toThrow('min cannot be greater than max');
    });

    test('should accept when min equals max', () => {
      const result = validateLength('Hello', { min: 5, max: 5 });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('📝 Real-World Scenarios', () => {
    test('should validate password length (8-20 chars)', () => {
      const result = validateLength('SecurePass123', { 
        min: 8, 
        max: 20, 
        fieldName: 'Password' 
      });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should reject short password', () => {
      const result = validateLength('Pass1', { 
        min: 8, 
        max: 20, 
        fieldName: 'Password' 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters');
    });

    test('should validate username length (3-20 chars)', () => {
      const result = validateLength('john_doe', { 
        min: 3, 
        max: 20, 
        fieldName: 'Username' 
      });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    test('should validate tweet length (max 280 chars)', () => {
      const tweet = 'This is a sample tweet that is well within the character limit.';
      const result = validateLength(tweet, { 
        max: 280, 
        fieldName: 'Tweet' 
      });
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });
});

/* ============================================================================
 * VALIDATE ALL TESTS
 * ========================================================================== */

describe('validateAll', () => {
  describe('✅ Successful Validation', () => {
    test('should validate all fields successfully', () => {
      const result = validateAll({
        email: () => validateEmail('user@example.com'),
        phone: () => validatePhone('123-456-7890'),
        name: () => validateRequired('John Doe', 'Name'),
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.results.email.isValid).toBe(true);
      expect(result.results.phone.isValid).toBe(true);
      expect(result.results.name.isValid).toBe(true);
    });

    test('should return empty errors object when all valid', () => {
      const result = validateAll({
        field1: () => validateRequired('value1'),
        field2: () => validateRequired('value2'),
      });
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should handle single field validation', () => {
      const result = validateAll({
        email: () => validateEmail('test@example.com'),
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('❌ Failed Validation', () => {
    test('should collect all validation errors', () => {
      const result = validateAll({
        email: () => validateEmail('invalid-email'),
        phone: () => validatePhone('123'),
        name: () => validateRequired('', 'Name'),
      });
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phone).toBeDefined();
      expect(result.errors.name).toBeDefined();
    });

    test('should return partial errors when some fields fail', () => {
      const result = validateAll({
        email: () => validateEmail('valid@example.com'),
        phone: () => validatePhone('123'),
        name: () => validateRequired('John'),
      });
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(1);
      expect(result.errors.phone).toBe('Phone number must contain at least 10 digits');
      expect(result.errors.email).toBeUndefined();
      expect(result.errors.name).toBeUndefined();
    });

    test('should include error messages in results', () => {
      const result = validateAll({
        email: () => validateEmail(''),
      });
      
      expect(result.isValid).toBe(false);
      expect(result.results.email.isValid).toBe(false);
      expect(result.results.email.error).toBe('Email address is required');
    });
  });

  describe('⚠️ Input Validation Errors', () => {
    test('should throw error for null input', () => {
      expect(() => {
        validateAll(null);
      }).toThrow('validations must be an object');
    });

    test('should throw error for undefined input', () => {
      expect(() => {
        validateAll(undefined);
      }).toThrow('validations must be an object');
    });

    test('should throw error for non-object input', () => {
      expect(() => {
        validateAll('not an object');
      }).toThrow('validations must be an object');
    });

    test('should throw error for array input', () => {
      expect(() => {
        validateAll([]);
      }).toThrow('validations must be an object');
    });

    test('should handle non-function validation', () => {
      const result = validateAll({
        email: 'not a function',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('Validation for email must be a function');
    });

    test('should handle validation function returning invalid result', () => {
      const result = validateAll({
        email: () => 'invalid result',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('must return a ValidationResult object');
    });

    test('should handle validation function returning null', () => {
      const result = validateAll({
        email: () => null,
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('must return a ValidationResult object');
    });

    test('should handle validation function throwing error', () => {
      const result = validateAll({
        email: () => {
          throw new Error('Validation crashed');
        },
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('Validation error: Validation crashed');
    });
  });

  describe('🔍 Edge Cases', () => {
    test('should handle empty validations object', () => {
      const result = validateAll({});
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.results).toEqual({});
    });

    test('should handle multiple fields with same error', () => {
      const result = validateAll({
        field1: () => validateRequired(''),
        field2: () => validateRequired(''),
        field3: () => validateRequired(''),
      });
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });

    test('should preserve field order in results', () => {
      const result = validateAll({
        email: () => validateEmail('test@example.com'),
        phone: () => validatePhone('1234567890'),
        name: () => validateRequired('John'),
      });
      
      const resultKeys = Object.keys(result.results);
      expect(resultKeys).toEqual(['email', 'phone', 'name']);
    });
  });

  describe('📝 Real-World Form Validation', () => {
    test('should validate complete registration form', () => {
      const formData = {
        email: 'user@example.com',
        phone: '(555) 123-4567',
        username: 'johndoe',
        password: 'SecurePass123',
        bio: 'Software developer',
      };

      const result = validateAll({
        email: () => validateEmail(formData.email),
        phone: () => validatePhone(formData.phone),
        username: () => validateLength(formData.username, { 
          min: 3, 
          max: 20, 
          fieldName: 'Username' 
        }),
        password: () => validateLength(formData.password, { 
          min: 8, 
          max: 50, 
          fieldName: 'Password' 
        }),
        bio: () => validateLength(formData.bio, { 
          max: 500, 
          fieldName: 'Bio' 
        }),
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('should validate form with multiple errors', () => {
      const formData = {
        email: 'invalid-email',
        phone: '123',
        username: 'ab',
        password: 'short',
      };

      const result = validateAll({
        email: () => validateEmail(formData.email),
        phone: () => validatePhone(formData.phone),
        username: () => validateLength(formData.username, { 
          min: 3, 
          fieldName: 'Username' 
        }),
        password: () => validateLength(formData.password, { 
          min: 8, 
          fieldName: 'Password' 
        }),
      });
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phone).toBeDefined();
      expect(result.errors.username).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });

    test('should validate contact form', () => {
      const result = validateAll({
        name: () => validateRequired('John Doe', 'Name'),
        email: () => validateEmail('john@example.com'),
        subject: () => validateLength('Question about product', { 
          min: 5, 
          max: 100, 
          fieldName: 'Subject' 
        }),
        message: () => validateLength('I would like to know more...', { 
          min: 10, 
          max: 1000, 
          fieldName: 'Message' 
        }),
      });
      
      expect(result.isValid).toBe(true);
    });
  });
});

/* ============================================================================
 * INTERNAL TESTING UTILITIES TESTS
 * ========================================================================== */

describe('__testing__ exports', () => {
  describe('EMAIL_REGEX', () => {
    test('should export EMAIL_REGEX pattern', () => {
      expect(__testing__.EMAIL_REGEX).toBeDefined();
      expect(__testing__.EMAIL_REGEX).toBeInstanceOf(RegExp);
    });

    test('should match valid email format', () => {
      expect(__testing__.EMAIL_REGEX.test('user@example.com')).toBe(true);
    });

    test('should not match invalid email format', () => {
      expect(__testing__.EMAIL_REGEX.test('invalid-email')).toBe(false);
    });
  });

  describe('PHONE_PATTERNS', () => {
    test('should export PHONE_PATTERNS array', () => {
      expect(__testing__.PHONE_PATTERNS).toBeDefined();
      expect(Array.isArray(__testing__.PHONE_PATTERNS)).toBe(true);
    });

    test('should contain multiple regex patterns', () => {
      expect(__testing__.PHONE_PATTERNS.length).toBeGreaterThan(0);
      __testing__.PHONE_PATTERNS.forEach(pattern => {
        expect(pattern).toBeInstanceOf(RegExp);
      });
    });

    test('should match various phone formats', () => {
      const validPhones = [
        '(123) 456-7890',
        '123-456-7890',
        '123.456.7890',
        '1234567890',
        '+1 123 456 7890',
      ];

      validPhones.forEach(phone => {
        const matches = __testing__.PHONE_PATTERNS.some(pattern => 
          pattern.test(phone)
        );
        expect(matches).toBe(true);
      });
    });
  });
});

/* ============================================================================
 * PERFORMANCE AND STRESS TESTS
 * ========================================================================== */

describe('⚡ Performance Tests', () => {
  test('should validate email quickly (< 1ms)', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      validateEmail('user@example.com');
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // 1000 validations in < 100ms
  });

  test('should validate phone quickly (< 1ms)', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      validatePhone('123-456-7890');
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  test('should handle large validateAll efficiently', () => {
    const validations = {};
    for (let i = 0; i < 100; i++) {
      validations[`field${i}`] = () => validateRequired(`value${i}`);
    }
    
    const start = performance.now();
    const result = validateAll(validations);
    const duration = performance.now() - start;
    
    expect(result.isValid).toBe(true);
    expect(duration).toBeLessThan(50); // 100 fields in < 50ms
  });
});

/* ============================================================================
 * INTEGRATION TESTS
 * ========================================================================== */

describe('🔗 Integration Tests', () => {
  test('should validate complete user profile', () => {
    const profile = {
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      bio: 'Passionate software developer with 5 years of experience.',
    };

    const result = validateAll({
      email: () => validateEmail(profile.email),
      phone: () => validatePhone(profile.phone),
      firstName: () => validateRequired(profile.firstName, 'First Name'),
      lastName: () => validateRequired(profile.lastName, 'Last Name'),
      username: () => validateLength(profile.username, { 
        min: 3, 
        max: 20, 
        fieldName: 'Username' 
      }),
      bio: () => validateLength(profile.bio, { 
        max: 500, 
        fieldName: 'Bio' 
      }),
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('should chain multiple validations for single field', () => {
    const password = 'SecurePass123';

    const validations = {
      required: () => validateRequired(password, 'Password'),
      length: () => validateLength(password, { 
        min: 8, 
        max: 50, 
        fieldName: 'Password' 
      }),
    };

    const result = validateAll(validations);

    expect(result.isValid).toBe(true);
  });

  test('should validate nested form structure', () => {
    const formData = {
      personal: {
        email: 'user@example.com',
        phone: '1234567890',
      },
      account: {
        username: 'testuser',
        password: 'SecurePass123',
      },
    };

    const result = validateAll({
      email: () => validateEmail(formData.personal.email),
      phone: () => validatePhone(formData.personal.phone),
      username: () => validateLength(formData.account.username, { 
        min: 3, 
        max: 20 
      }),
      password: () => validateLength(formData.account.password, { 
        min: 8, 
        max: 50 
      }),
    });

    expect(result.isValid).toBe(true);
  });
});