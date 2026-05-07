/**
 * authService — legacy helpers kept for backward compatibility.
 *
 * New code should use userAuthSlice thunks directly.
 * getCurrentUser() now reads from the Redux store via a module-level getter
 * so the cart/address sessionId logic still works.
 */

import type { User } from '../types';

const SESSION_KEY = 'cocospice_session_v2';

/** Write the current user to sessionStorage so non-Redux code can read it */
export function persistUserSession(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

/** Read the current user — used by addressSlice / cartSlice for sessionId */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? (JSON.parse(data) as User) : null;
}

/** Called by AuthContext after successful login/register/checkAuth */
export function logOut(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}
