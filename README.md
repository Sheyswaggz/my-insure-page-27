## Contact Form

The contact form provides a user-friendly interface for visitors to submit inquiries with comprehensive validation and accessibility features.

### Features

- **Real-time Validation**: Instant feedback as users fill out the form
- **Client-side Validation**: No page reload required for validation
- **Accessibility**: WCAG 2.1 AA compliant with ARIA attributes
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Success Feedback**: Clear confirmation message on successful submission
- **Error Handling**: Detailed error messages for invalid inputs

### Form Fields

| Field | Type | Validation Rules |
|-------|------|------------------|
| Name | Text | Required, 2-100 characters |
| Email | Email | Required, valid email format |
| Phone | Tel | Required, valid phone format (US/International) |
| Insurance Type | Select | Required, one of: Auto, Home, Life, Health, Business |
| Message | Textarea | Required, 10-1000 characters |

### Validation Rules

#### Email Validation
- Format: `user@domain.com`
- Regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Examples:
  - ✅ Valid: `john.doe@example.com`, `user+tag@domain.co.uk`
  - ❌ Invalid: `invalid@`, `@domain.com`, `user@domain`

#### Phone Validation
- Accepts multiple formats:
  - US: `(555) 123-4567`, `555-123-4567`, `5551234567`
  - International: `+1-555-123-4567`, `+44 20 1234 5678`
- Regex pattern: `/^[\d\s\-\+\(\)]+$/`
- Minimum 10 digits required

#### Name Validation
- Minimum 2 characters
- Maximum 100 characters
- Allows letters, spaces, hyphens, and apostrophes

#### Message Validation
- Minimum 10 characters
- Maximum 1000 characters
- Prevents empty or whitespace-only submissions

### Usage

The contact form is accessible at `http://localhost:5173#contact` and automatically initializes on page load.

#### Accessing the Form