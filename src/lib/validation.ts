export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = [];
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

  if (phone && !phoneRegex.test(phone)) {
    errors.push('Invalid phone number format');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateMedicalRecordNumber(mrn: string): ValidationResult {
  const errors: string[] = [];

  if (!mrn || !mrn.trim()) {
    errors.push('Medical Record Number is required');
  } else if (mrn.length < 3 || mrn.length > 50) {
    errors.push('Medical Record Number must be between 3 and 50 characters');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  const errors: string[] = [];

  if (!name || !name.trim()) {
    errors.push(`${fieldName} is required`);
  } else if (name.length < 2 || name.length > 100) {
    errors.push(`${fieldName} must be between 2 and 100 characters`);
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }

  return { isValid: errors.length === 0, errors };
}

export function validateDateOfBirth(dob: string): ValidationResult {
  const errors: string[] = [];

  if (!dob) {
    errors.push('Date of birth is required');
    return { isValid: false, errors };
  }

  const date = new Date(dob);
  const today = new Date();
  const minDate = new Date(1900, 0, 1);

  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
  } else if (date > today) {
    errors.push('Date of birth cannot be in the future');
  } else if (date < minDate) {
    errors.push('Date of birth cannot be before 1900');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateNumericRange(
  value: number | string | null | undefined,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];

  if (value === null || value === undefined || value === '') {
    return { isValid: true, errors };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (numValue < min || numValue > max) {
    errors.push(`${fieldName} must be between ${min} and ${max}`);
  }

  return { isValid: errors.length === 0, errors };
}

export function validateLSM(lsm: number | null): ValidationResult {
  return validateNumericRange(lsm, 0, 75, 'Liver Stiffness Measurement (LSM)');
}

export function validateCAP(cap: number | null): ValidationResult {
  return validateNumericRange(cap, 100, 400, 'Controlled Attenuation Parameter (CAP)');
}

export function validateAST(ast: number | null): ValidationResult {
  return validateNumericRange(ast, 0, 1000, 'AST');
}

export function validateALT(alt: number | null): ValidationResult {
  return validateNumericRange(alt, 0, 1000, 'ALT');
}

export function validatePlatelets(platelets: number | null): ValidationResult {
  return validateNumericRange(platelets, 0, 1000, 'Platelet count');
}

export function validateAlbumin(albumin: number | null): ValidationResult {
  return validateNumericRange(albumin, 0, 100, 'Albumin');
}

export function validateGGT(ggt: number | null): ValidationResult {
  return validateNumericRange(ggt, 0, 2000, 'GGT');
}

export function validateHbA1c(hba1c: number | null): ValidationResult {
  return validateNumericRange(hba1c, 0, 20, 'HbA1c');
}

export function validateBMI(bmi: number | null): ValidationResult {
  return validateNumericRange(bmi, 10, 70, 'BMI');
}

export function validateAge(age: number | null): ValidationResult {
  return validateNumericRange(age, 0, 120, 'Age');
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeNumericInput(input: string): string {
  return input.replace(/[^0-9.-]/g, '');
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateAllPatientData(data: {
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
  dateOfBirth: string;
  gender: string;
  contactPhone?: string;
  contactEmail?: string;
}): ValidationResult {
  const allErrors: string[] = [];

  const firstNameValidation = validateName(data.firstName, 'First name');
  allErrors.push(...firstNameValidation.errors);

  const lastNameValidation = validateName(data.lastName, 'Last name');
  allErrors.push(...lastNameValidation.errors);

  const mrnValidation = validateMedicalRecordNumber(data.medicalRecordNumber);
  allErrors.push(...mrnValidation.errors);

  const dobValidation = validateDateOfBirth(data.dateOfBirth);
  allErrors.push(...dobValidation.errors);

  if (!data.gender) {
    allErrors.push('Gender is required');
  }

  if (data.contactPhone) {
    const phoneValidation = validatePhone(data.contactPhone);
    allErrors.push(...phoneValidation.errors);
  }

  if (data.contactEmail) {
    const emailValidation = validateEmail(data.contactEmail);
    allErrors.push(...emailValidation.errors);
  }

  return { isValid: allErrors.length === 0, errors: allErrors };
}
