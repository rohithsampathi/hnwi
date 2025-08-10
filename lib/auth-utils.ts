// lib/auth-utils.ts - Authentication utility functions

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // Decode JWT payload (second part of token)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token has expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export const getValidToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  return isTokenValid(token) ? token : null;
};

export const clearInvalidToken = (): void => {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  if (token && !isTokenValid(token)) {
    localStorage.removeItem('token');
    console.log('Cleared expired/invalid token');
  }
};

export const isAuthenticated = (): boolean => {
  return getValidToken() !== null;
};