export interface ValidationResult {
  success: boolean;
  message: string;
}

export const validateAuthData = (username: string, email: string, password: string): ValidationResult => {
  // Validate username
  if (!username || username.trim().length < 3) {
    return {
      success: false,
      message: 'Username must be at least 3 characters long'
    };
  }

  if (username.length > 50) {
    return {
      success: false,
      message: 'Username must be less than 50 characters'
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      success: false,
      message: 'Username can only contain letters, numbers, and underscores'
    };
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email address'
    };
  }

  // Validate password
  if (!password || password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  return {
    success: true,
    message: 'Validation successful'
  };
};

export const validateLoginData = (email: string, password: string): ValidationResult => {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email address'
    };
  }

  // Validate password
  if (!password) {
    return {
      success: false,
      message: 'Password is required'
    };
  }

  return {
    success: true,
    message: 'Validation successful'
  };
};