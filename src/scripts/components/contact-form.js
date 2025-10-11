import { validateEmail, validatePhone, validateRequired } from '../utils/validators.js';

/**
 * ContactForm class handles form validation, submission, and user feedback
 */
class ContactForm {
  constructor(formElement) {
    this.form = formElement;
    this.submitButton = this.form.querySelector('button[type="submit"]');
    this.successMessage = this.form.querySelector('.form-success');
    this.errorMessage = this.form.querySelector('.form-error');

    /*
     * Field configurations with validation rules
     */
    this.fields = {
      name: {
        element: this.form.querySelector('#name'),
        validators: [validateRequired],
        errorElement: this.form.querySelector('#name-error'),
      },
      email: {
        element: this.form.querySelector('#email'),
        validators: [validateRequired, validateEmail],
        errorElement: this.form.querySelector('#email-error'),
      },
      phone: {
        element: this.form.querySelector('#phone'),
        validators: [validateRequired, validatePhone],
        errorElement: this.form.querySelector('#phone-error'),
      },
      insuranceType: {
        element: this.form.querySelector('#insurance-type'),
        validators: [validateRequired],
        errorElement: this.form.querySelector('#insurance-type-error'),
      },
      message: {
        element: this.form.querySelector('#message'),
        validators: [validateRequired],
        errorElement: this.form.querySelector('#message-error'),
      },
    };

    this.init();
  }

  init() {
    // Add real-time validation on blur
    Object.values(this.fields).forEach(field => {
      field.element.addEventListener('blur', () => this.validateField(field));
      field.element.addEventListener('input', () => {
        if (field.errorElement.textContent) {
          this.validateField(field);
        }
      });
    });

    // Handle form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    const value = field.element.value.trim();
    let isValid = true;
    let errorMessage = '';

    for (const validator of field.validators) {
      const result = validator(value);
      if (!result.isValid) {
        isValid = false;
        errorMessage = result.error;
        break;
      }
    }

    this.updateFieldUI(field, isValid, errorMessage);
    return isValid;
  }

  updateFieldUI(field, isValid, errorMessage) {
    if (isValid) {
      field.element.classList.remove('error');
      field.element.classList.add('valid');
      field.errorElement.textContent = '';
      field.errorElement.setAttribute('aria-hidden', 'true');
    } else {
      field.element.classList.remove('valid');
      field.element.classList.add('error');
      field.errorElement.textContent = errorMessage;
      field.errorElement.setAttribute('aria-hidden', 'false');
    }
  }

  validateForm() {
    let isValid = true;

    Object.values(this.fields).forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Hide previous messages
    this.hideMessages();

    // Validate all fields
    if (!this.validateForm()) {
      this.showError('Please fix the errors above before submitting.');
      return;
    }

    // Disable submit button and show loading state
    this.setSubmitting(true);

    try {
      // Simulate API call (replace with actual endpoint)
      await this.submitFormData();

      // Show success message
      this.showSuccess('Thank you for your message! We\'ll get back to you soon.');

      // Reset form after successful submission
      setTimeout(() => {
        this.resetForm();
      }, 3000);
    } catch (error) {
      this.showError('Something went wrong. Please try again later.');
    } finally {
      this.setSubmitting(false);
    }
  }

  async submitFormData() {
    // Simulate API call with delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, replace with actual API call:
        // const response = await fetch('/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(this.getFormData())
        // });
        // if (!response.ok) throw new Error('Submission failed');
        resolve();
      }, 1500);
    });
  }

  getFormData() {
    return {
      name: this.fields.name.element.value.trim(),
      email: this.fields.email.element.value.trim(),
      phone: this.fields.phone.element.value.trim(),
      insuranceType: this.fields.insuranceType.element.value,
      message: this.fields.message.element.value.trim(),
      timestamp: new Date().toISOString(),
    };
  }

  setSubmitting(isSubmitting) {
    this.submitButton.disabled = isSubmitting;
    this.submitButton.textContent = isSubmitting ? 'Sending...' : 'Send Message';
    this.submitButton.setAttribute('aria-busy', isSubmitting.toString());
  }

  showSuccess(message) {
    this.successMessage.textContent = message;
    this.successMessage.classList.add('visible');
    this.successMessage.setAttribute('role', 'status');
    this.successMessage.setAttribute('aria-live', 'polite');

    // Announce to screen readers
    this.successMessage.focus();
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add('visible');
    this.errorMessage.setAttribute('role', 'alert');
    this.errorMessage.setAttribute('aria-live', 'assertive');

    // Announce to screen readers
    this.errorMessage.focus();
  }

  hideMessages() {
    this.successMessage.classList.remove('visible');
    this.errorMessage.classList.remove('visible');
  }

  resetForm() {
    this.form.reset();

    // Clear validation states
    Object.values(this.fields).forEach(field => {
      field.element.classList.remove('valid', 'error');
      field.errorElement.textContent = '';
      field.errorElement.setAttribute('aria-hidden', 'true');
    });

    this.hideMessages();
  }
}

export default ContactForm;