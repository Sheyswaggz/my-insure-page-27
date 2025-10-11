/**
 * Contact Form Component
 * 
 * Handles contact form validation, submission, and accessibility features.
 * Implements real-time validation with ARIA live regions for screen reader support.
 * 
 * @module contact-form
 * @version 1.0.0
 */

/* ============================================================================
 * CONSTANTS AND CONFIGURATION
 * ========================================================================== */

const VALIDATION_PATTERNS = Object.freeze({
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\d\s()+-]{10,}$/,
});

const VALIDATION_RULES = Object.freeze({
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  MESSAGE_MIN_LENGTH: 10,
  MESSAGE_MAX_LENGTH: 1000,
  PHONE_MIN_LENGTH: 10,
});

const ERROR_MESSAGES = Object.freeze({
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number (at least 10 digits)',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name must not exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  MESSAGE_TOO_SHORT: `Message must be at least ${VALIDATION_RULES.MESSAGE_MIN_LENGTH} characters`,
  MESSAGE_TOO_LONG: `Message must not exceed ${VALIDATION_RULES.MESSAGE_MAX_LENGTH} characters`,
});

const SUCCESS_MESSAGE = 'Thank you for your message! We will get back to you soon.';

const FORM_STATE = Object.freeze({
  IDLE: 'idle',
  VALIDATING: 'validating',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
});

/* ============================================================================
 * STATE MANAGEMENT
 * ========================================================================== */

const formState = {
  form: null,
  fields: {},
  liveRegion: null,
  currentState: FORM_STATE.IDLE,
  validationErrors: new Map(),
  cleanupFunctions: [],
};

/* ============================================================================
 * LOGGING UTILITIES
 * ========================================================================== */

const logger = {
  info: (message, context = {}) => {
    /* eslint-disable-next-line no-console */
    console.warn('[ContactForm:INFO]', message, context);
  },
  error: (message, error, context = {}) => {
    /* eslint-disable-next-line no-console */
    console.error('[ContactForm:ERROR]', message, error, context);
  },
  warn: (message, context = {}) => {
    /* eslint-disable-next-line no-console */
    console.warn('[ContactForm:WARN]', message, context);
  },
};

/* ============================================================================
 * VALIDATION FUNCTIONS
 * ========================================================================== */

/**
 * Validates email format using regex pattern
 * @param {string} email - Email address to validate
 * @returns {{valid: boolean, error: string|null}}
 */
function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.REQUIRED };
  }

  const trimmedEmail = email.trim();
  
  if (!VALIDATION_PATTERNS.EMAIL.test(trimmedEmail)) {
    return { valid: false, error: ERROR_MESSAGES.EMAIL_INVALID };
  }

  return { valid: true, error: null };
}

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, error: string|null}}
 */
function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.REQUIRED };
  }

  const trimmedPhone = phone.trim();
  const digitsOnly = trimmedPhone.replace(/\D/g, '');

  if (digitsOnly.length < VALIDATION_RULES.PHONE_MIN_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.PHONE_INVALID };
  }

  if (!VALIDATION_PATTERNS.PHONE.test(trimmedPhone)) {
    return { valid: false, error: ERROR_MESSAGES.PHONE_INVALID };
  }

  return { valid: true, error: null };
}

/**
 * Validates required text field
 * @param {string} value - Field value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{valid: boolean, error: string|null}}
 */
function validateRequired(value, fieldName = 'field') {
  if (!value || value.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.REQUIRED };
  }

  return { valid: true, error: null };
}

/**
 * Validates name field with length constraints
 * @param {string} name - Name to validate
 * @returns {{valid: boolean, error: string|null}}
 */
function validateName(name) {
  const requiredCheck = validateRequired(name, 'name');
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.NAME_TOO_SHORT };
  }

  if (trimmedName.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.NAME_TOO_LONG };
  }

  return { valid: true, error: null };
}

/**
 * Validates message field with length constraints
 * @param {string} message - Message to validate
 * @returns {{valid: boolean, error: string|null}}
 */
function validateMessage(message) {
  const requiredCheck = validateRequired(message, 'message');
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length < VALIDATION_RULES.MESSAGE_MIN_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.MESSAGE_TOO_SHORT };
  }

  if (trimmedMessage.length > VALIDATION_RULES.MESSAGE_MAX_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.MESSAGE_TOO_LONG };
  }

  return { valid: true, error: null };
}

/**
 * Validates a single form field based on its type
 * @param {HTMLElement} field - Form field element
 * @returns {{valid: boolean, error: string|null}}
 */
function validateField(field) {
  const fieldName = field.name;
  const fieldValue = field.value;

  try {
    switch (fieldName) {
      case 'name':
        return validateName(fieldValue);
      case 'email':
        return validateEmail(fieldValue);
      case 'phone':
        return validatePhone(fieldValue);
      case 'insurance-type':
        return validateRequired(fieldValue, 'insurance type');
      case 'message':
        return validateMessage(fieldValue);
      default:
        logger.warn('Unknown field type', { fieldName });
        return { valid: true, error: null };
    }
  } catch (error) {
    logger.error('Field validation error', error, { fieldName });
    return { valid: false, error: 'Validation error occurred' };
  }
}

/* ============================================================================
 * UI UPDATE FUNCTIONS
 * ========================================================================== */

/**
 * Displays error message for a field
 * @param {HTMLElement} field - Form field element
 * @param {string} errorMessage - Error message to display
 */
function showFieldError(field, errorMessage) {
  const fieldContainer = field.closest('.form-group');
  if (!fieldContainer) {
    logger.warn('Field container not found', { fieldName: field.name });
    return;
  }

  /* Remove existing error */
  clearFieldError(field);

  /* Add error class */
  fieldContainer.classList.add('has-error');
  field.setAttribute('aria-invalid', 'true');

  /* Create and insert error message */
  const errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.id = `${field.id}-error`;
  errorElement.textContent = errorMessage;
  errorElement.setAttribute('role', 'alert');

  fieldContainer.appendChild(errorElement);

  /* Link error to field for screen readers */
  field.setAttribute('aria-describedby', errorElement.id);

  /* Store error in state */
  formState.validationErrors.set(field.name, errorMessage);

  logger.info('Field error displayed', { 
    fieldName: field.name, 
    error: errorMessage,
  });
}

/**
 * Clears error message for a field
 * @param {HTMLElement} field - Form field element
 */
function clearFieldError(field) {
  const fieldContainer = field.closest('.form-group');
  if (!fieldContainer) {
    return;
  }

  /* Remove error class */
  fieldContainer.classList.remove('has-error');
  field.setAttribute('aria-invalid', 'false');

  /* Remove error message element */
  const errorElement = fieldContainer.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }

  /* Remove aria-describedby if it was only for error */
  const describedBy = field.getAttribute('aria-describedby');
  if (describedBy && describedBy.includes('-error')) {
    field.removeAttribute('aria-describedby');
  }

  /* Remove from state */
  formState.validationErrors.delete(field.name);
}

/**
 * Updates ARIA live region for screen reader announcements
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
function updateLiveRegion(message, priority = 'polite') {
  if (!formState.liveRegion) {
    logger.warn('Live region not initialized');
    return;
  }

  formState.liveRegion.setAttribute('aria-live', priority);
  formState.liveRegion.textContent = message;

  logger.info('Live region updated', { message, priority });
}

/**
 * Displays success message after form submission
 */
function showSuccessMessage() {
  const form = formState.form;
  if (!form) {
    return;
  }

  /* Create success message element */
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.setAttribute('role', 'status');
  successElement.setAttribute('aria-live', 'polite');
  successElement.textContent = SUCCESS_MESSAGE;

  /* Insert before form */
  form.parentNode.insertBefore(successElement, form);

  /* Hide form temporarily */
  form.style.display = 'none';

  /* Update live region */
  updateLiveRegion(SUCCESS_MESSAGE, 'polite');

  /* Show form again after delay */
  setTimeout(() => {
    successElement.remove();
    form.style.display = '';
  }, 5000);

  logger.info('Success message displayed');
}

/* ============================================================================
 * FORM HANDLING FUNCTIONS
 * ========================================================================== */

/**
 * Handles real-time validation on field blur
 * @param {Event} event - Blur event
 */
function handleFieldBlur(event) {
  const field = event.target;
  
  if (!field.name) {
    return;
  }

  try {
    const validation = validateField(field);

    if (!validation.valid) {
      showFieldError(field, validation.error);
    } else {
      clearFieldError(field);
    }
  } catch (error) {
    logger.error('Error during field blur validation', error, {
      fieldName: field.name,
    });
  }
}

/**
 * Handles field input to clear errors on typing
 * @param {Event} event - Input event
 */
function handleFieldInput(event) {
  const field = event.target;
  
  if (!field.name) {
    return;
  }

  /* Clear error when user starts typing */
  if (formState.validationErrors.has(field.name)) {
    clearFieldError(field);
  }
}

/**
 * Validates all form fields
 * @returns {boolean} True if all fields are valid
 */
function validateAllFields() {
  let isValid = true;
  const fields = Object.values(formState.fields);

  /* Clear previous errors */
  formState.validationErrors.clear();

  for (const field of fields) {
    const validation = validateField(field);

    if (!validation.valid) {
      showFieldError(field, validation.error);
      isValid = false;
    } else {
      clearFieldError(field);
    }
  }

  return isValid;
}

/**
 * Collects form data using FormData API
 * @returns {Object} Form data as plain object
 */
function collectFormData() {
  const formData = new FormData(formState.form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  /* Add metadata */
  data.timestamp = new Date().toISOString();
  data.userAgent = navigator.userAgent;

  return data;
}

/**
 * Resets form to initial state
 */
function resetForm() {
  if (!formState.form) {
    return;
  }

  try {
    /* Reset form fields */
    formState.form.reset();

    /* Clear all errors */
    Object.values(formState.fields).forEach(field => {
      clearFieldError(field);
    });

    /* Clear validation errors */
    formState.validationErrors.clear();

    /* Reset state */
    formState.currentState = FORM_STATE.IDLE;

    logger.info('Form reset completed');
  } catch (error) {
    logger.error('Error resetting form', error);
  }
}

/**
 * Handles form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  if (formState.currentState === FORM_STATE.SUBMITTING) {
    logger.warn('Form submission already in progress');
    return;
  }

  try {
    formState.currentState = FORM_STATE.VALIDATING;

    logger.info('Form submission started');

    /* Validate all fields */
    const isValid = validateAllFields();

    if (!isValid) {
      formState.currentState = FORM_STATE.ERROR;
      
      const errorCount = formState.validationErrors.size;
      const errorMessage = `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting`;
      
      updateLiveRegion(errorMessage, 'assertive');
      
      /* Focus first error field */
      const firstErrorField = Object.values(formState.fields).find(
        field => formState.validationErrors.has(field.name)
      );
      
      if (firstErrorField) {
        firstErrorField.focus();
      }

      logger.warn('Form validation failed', {
        errorCount,
        errors: Array.from(formState.validationErrors.entries()),
      });

      return;
    }

    /* Collect form data */
    formState.currentState = FORM_STATE.SUBMITTING;
    const formData = collectFormData();

    /* Log submission data (no backend integration yet) */
    /* eslint-disable-next-line no-console */
    console.warn('=== CONTACT FORM SUBMISSION ===');
    /* eslint-disable-next-line no-console */
    console.warn('Form Data:', formData);
    /* eslint-disable-next-line no-console */
    console.warn('Validation Status: All fields valid');
    /* eslint-disable-next-line no-console */
    console.warn('================================');

    logger.info('Form submitted successfully', {
      fields: Object.keys(formData),
      timestamp: formData.timestamp,
    });

    /* Simulate async submission */
    await new Promise(resolve => setTimeout(resolve, 500));

    /* Update state and show success */
    formState.currentState = FORM_STATE.SUCCESS;
    showSuccessMessage();

    /* Reset form after delay */
    setTimeout(() => {
      resetForm();
    }, 5000);

  } catch (error) {
    formState.currentState = FORM_STATE.ERROR;
    logger.error('Form submission error', error);
    
    updateLiveRegion('An error occurred. Please try again.', 'assertive');
  }
}

/* ============================================================================
 * INITIALIZATION FUNCTIONS
 * ========================================================================== */

/**
 * Caches form field elements
 * @param {HTMLFormElement} form - Form element
 */
function cacheFormFields(form) {
  const fieldNames = ['name', 'email', 'phone', 'insurance-type', 'message'];

  for (const fieldName of fieldNames) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    
    if (!field) {
      logger.warn('Form field not found', { fieldName });
      continue;
    }

    formState.fields[fieldName] = field;
  }

  logger.info('Form fields cached', {
    fieldCount: Object.keys(formState.fields).length,
  });
}

/**
 * Sets up ARIA live region for screen reader announcements
 * @param {HTMLFormElement} form - Form element
 */
function setupLiveRegion(form) {
  /* Check if live region already exists */
  let liveRegion = form.querySelector('.sr-only[aria-live]');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    form.appendChild(liveRegion);
  }

  formState.liveRegion = liveRegion;

  logger.info('ARIA live region initialized');
}

/**
 * Sets up event listeners for form and fields
 */
function setupEventListeners() {
  const form = formState.form;

  /* Form submit listener */
  const submitHandler = handleFormSubmit.bind(null);
  form.addEventListener('submit', submitHandler);
  formState.cleanupFunctions.push(() => {
    form.removeEventListener('submit', submitHandler);
  });

  /* Field blur listeners for real-time validation */
  Object.values(formState.fields).forEach(field => {
    const blurHandler = handleFieldBlur.bind(null);
    const inputHandler = handleFieldInput.bind(null);

    field.addEventListener('blur', blurHandler);
    field.addEventListener('input', inputHandler);

    formState.cleanupFunctions.push(() => {
      field.removeEventListener('blur', blurHandler);
      field.removeEventListener('input', inputHandler);
    });
  });

  logger.info('Event listeners attached', {
    fieldCount: Object.keys(formState.fields).length,
  });
}

/**
 * Validates form structure and required elements
 * @param {HTMLFormElement} form - Form element to validate
 * @throws {Error} If form structure is invalid
 */
function validateFormStructure(form) {
  if (!form) {
    throw new Error('Form element is required');
  }

  if (!(form instanceof HTMLFormElement)) {
    throw new Error('Element must be a form element');
  }

  const requiredFields = ['name', 'email', 'phone', 'insurance-type', 'message'];
  const missingFields = [];

  for (const fieldName of requiredFields) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) {
      missingFields.push(fieldName);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(`Missing required form fields: ${missingFields.join(', ')}`);
  }

  logger.info('Form structure validated successfully');
}

/* ============================================================================
 * PUBLIC API
 * ========================================================================== */

/**
 * Initializes the contact form component
 * @param {string|HTMLFormElement} selector - Form selector or element
 * @returns {Function} Cleanup function to remove event listeners
 * @throws {Error} If form element not found or invalid
 */
export function initContactForm(selector = '#contact-form') {
  try {
    logger.info('Initializing contact form', { selector });

    /* Get form element */
    const form = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!form) {
      throw new Error(`Contact form not found with selector: ${selector}`);
    }

    /* Validate form structure */
    validateFormStructure(form);

    /* Store form reference */
    formState.form = form;

    /* Cache form fields */
    cacheFormFields(form);

    /* Setup ARIA live region */
    setupLiveRegion(form);

    /* Setup event listeners */
    setupEventListeners();

    /* Set initial state */
    formState.currentState = FORM_STATE.IDLE;

    logger.info('Contact form initialized successfully', {
      fieldCount: Object.keys(formState.fields).length,
      state: formState.currentState,
    });

    /* Return cleanup function */
    return () => {
      logger.info('Cleaning up contact form');

      /* Execute all cleanup functions */
      formState.cleanupFunctions.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          logger.error('Error during cleanup', error);
        }
      });

      /* Clear state */
      formState.form = null;
      formState.fields = {};
      formState.liveRegion = null;
      formState.currentState = FORM_STATE.IDLE;
      formState.validationErrors.clear();
      formState.cleanupFunctions = [];

      logger.info('Contact form cleanup completed');
    };

  } catch (error) {
    logger.error('Failed to initialize contact form', error);
    throw error;
  }
}

/* ============================================================================
 * TESTING EXPORTS
 * ========================================================================== */

export const __testing__ = {
  validateEmail,
  validatePhone,
  validateName,
  validateMessage,
  validateRequired,
  validateField,
  validateAllFields,
  showFieldError,
  clearFieldError,
  updateLiveRegion,
  collectFormData,
  resetForm,
  handleFieldBlur,
  handleFieldInput,
  handleFormSubmit,
  formState,
  VALIDATION_PATTERNS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  FORM_STATE,
};