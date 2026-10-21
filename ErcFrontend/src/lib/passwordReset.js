import { api } from './api';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DEFAULT_CODE_LENGTH = 6;
export const PASSWORD_HINT = 'At least 8 characters, with a letter and a number.';

// Same rules as the server (ErcBackend/src/passwordReset.js). Keep both in sync.
export function passwordProblem(password) {
  if (!password || password.length < 8) return 'Use at least 8 characters.';
  if (password.length > 128) return 'Use 128 characters or fewer.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Use at least one letter and one number.';
  }
  return null;
}

// Turns an axios error into { code, message, retryAfterSeconds?, attemptsLeft? }.
export function resetError(error) {
  const data = error?.response?.data;
  if (data?.error) {
    return {
      code: data.error,
      message: data.message || 'Something went wrong. Please try again.',
      retryAfterSeconds: data.retryAfterSeconds,
      attemptsLeft: data.attemptsLeft,
    };y
    
  }
  if (error?.code === 'ECONNABORTED') {
    return { code: 'TIMEOUT', message: 'The server took too long to respond. Please try again.' };
  }
  if (!error?.response) {
    return { code: 'NETWORK', message: 'Cannot reach the server. Check your connection and try again.' };
  }
  return { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' };
}

export async function requestResetCode(email) {
  const { data } = await api.post('/api/auth/password-reset/request', { email: email.trim() });
  return data;
}

export async function verifyResetCode(email, code) {
  const { data } = await api.post('/api/auth/password-reset/verify', {
    email: email.trim(),
    code: code.trim(),
  });
  return data;
}

export async function confirmPasswordReset(resetToken, password) {
  const { data } = await api.post('/api/auth/password-reset/confirm', { resetToken, password });
  return data;
}

export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}
