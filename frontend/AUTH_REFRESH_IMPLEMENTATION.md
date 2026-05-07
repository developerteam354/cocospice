# User Authentication Auto-Refresh Implementation

## Overview
This document describes the implementation of JWT auto-refresh for user authentication, aligned with the Admin authentication architecture. This fixes the issue where users were logged out upon page refresh.

## Architecture

### Token Storage Policy
- **Access Token**: Stored in memory only (Redux state + module-level variable)
- **Refresh Token**: Stored in HttpOnly, Secure cookie (survives page refreshes)
- **NEVER** store tokens in localStorage for security reasons

### Key Components

#### 1. API Service (`frontend/lib/api.ts`)
- **Purpose**: Centralized axios instance with interceptors
- **Features**:
  - `publicApi`: For unauthenticated requests (login, register, refresh)
  - `privateApi`: For authenticated requests (automatically adds Bearer token)
  - **Request Interceptor**: Adds access token to Authorization header
  - **Response Interceptor**: Handles 401 errors with automatic token refresh
  - **Queue Pattern**: Prevents multiple simultaneous refresh calls

#### 2. User Auth Slice (`frontend/store/slices/userAuthSlice.ts`)
- **New Thunks**:
  - `checkAuth`: Restores session via `/auth/me` endpoint
  - `refreshToken`: Gets new access token via `/auth/refresh` endpoint
  - `loginUser`: User login
  - `registerUser`: User registration
  - `logoutUser`: User logout

- **State**:
  - `isInitialized`: Flag indicating auth check has completed
  - `isLoading`: Loading state during auth operations
  - `isAuthenticated`: Whether user is logged in
  - `user`: Current user data

#### 3. Auth Initializer (`frontend/store/AuthInitializer.tsx`)
- **Purpose**: Restores user session on app load/refresh
- **Workflow**:
  1. Checks if access token exists in memory
  2. If yes, calls `checkAuth` to validate and restore session
  3. If `checkAuth` fails, attempts `refreshToken` using HttpOnly cookie
  4. If no access token, directly attempts `refreshToken`
- **Placement**: Inside ReduxProvider but OUTSIDE PersistGate for early execution

#### 4. Auth Loading Wrapper (`frontend/components/AuthLoadingWrapper.tsx`)
- **Purpose**: Shows loading screen while auth is initializing
- **Prevents**: UI flickering to "Logged Out" state during page refresh
- **Condition**: Shows loading when `!isInitialized && isLoading`

#### 5. Redux Provider (`frontend/store/ReduxProvider.tsx`)
- **Updated**: Now includes `<AuthInitializer />` component
- **Order**: Provider → AuthInitializer → PersistGate → children

#### 6. Providers (`frontend/components/Providers.tsx`)
- **Updated**: Wraps children with `<AuthLoadingWrapper>`
- **Order**: ReduxProvider → AuthLoadingWrapper → AuthProvider → CartProvider → children

## Backend Endpoints

### `/api/user/auth/refresh` (POST)
- **Purpose**: Issues new access token using refresh token from HttpOnly cookie
- **Input**: Reads `userRefreshToken` from cookies
- **Output**: 
  ```json
  {
    "user": { ... },
    "accessToken": "..."
  }
  ```
- **Cookie**: Sets new `userRefreshToken` HttpOnly cookie
- **Security**: Does NOT send refresh token in response body

### `/api/user/auth/me` (GET)
- **Purpose**: Validates session and returns user data
- **Input**: Reads `userRefreshToken` from cookies
- **Output**: Same as refresh endpoint
- **Note**: Also performs token refresh internally

## Flow Diagrams

### Page Load/Refresh Flow
```
1. App loads → ReduxProvider mounts
2. AuthInitializer runs
3. Check if accessToken exists in memory
   ├─ YES → Call checkAuth (/auth/me)
   │   ├─ SUCCESS → User authenticated
   │   └─ FAIL → Call refreshToken (/auth/refresh)
   │       ├─ SUCCESS → User authenticated
   │       └─ FAIL → User not authenticated
   └─ NO → Call refreshToken (/auth/refresh)
       ├─ SUCCESS → User authenticated
       └─ FAIL → User not authenticated
4. Set isInitialized = true
5. AuthLoadingWrapper hides loading screen
6. App renders with correct auth state
```

### 401 Error Handling Flow
```
1. API call returns 401 Unauthorized
2. Response interceptor catches error
3. Check if refresh is already in progress
   ├─ YES → Queue this request
   └─ NO → Start refresh process
4. Call refreshToken thunk
5. Get new access token
6. Process queued requests with new token
7. Retry original failed request
8. If refresh fails → logout user
```

## Security Features

1. **HttpOnly Cookies**: Refresh token not accessible via JavaScript
2. **Secure Flag**: Cookies only sent over HTTPS in production
3. **SameSite**: CSRF protection
4. **Token Rotation**: New refresh token issued on each refresh
5. **Memory-Only Access Token**: Lost on page refresh (by design)
6. **No localStorage**: Prevents XSS token theft

## Testing Checklist

- [ ] User can log in successfully
- [ ] User stays logged in after page refresh
- [ ] Access token is NOT in localStorage
- [ ] Refresh token is in HttpOnly cookie
- [ ] 401 errors trigger automatic token refresh
- [ ] Multiple simultaneous 401s don't cause multiple refresh calls
- [ ] User is logged out when refresh token expires
- [ ] Loading screen shows during initial auth check
- [ ] No "logged out flash" on page refresh

## Migration Notes

### Changes from Previous Implementation
1. **Removed**: fetch-based API calls in userAuthSlice
2. **Added**: axios-based API service with interceptors
3. **Added**: `refreshToken` thunk
4. **Added**: `isInitialized` state flag
5. **Added**: AuthLoadingWrapper component
6. **Updated**: AuthInitializer to use refresh-first strategy
7. **Updated**: Store to inject itself into API service

### Backward Compatibility
- AuthContext API remains unchanged
- Existing components using `useAuth()` work without modification
- sessionStorage sync maintained for cart/address features

## Environment Variables

Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Backend `.env`:
```
ACCESS_TOKEN_SECRET=your-secret-here
REFRESH_TOKEN_SECRET=your-secret-here
NODE_ENV=development
```

## Dependencies Added
- `axios`: HTTP client with interceptor support

## Files Modified
1. `frontend/lib/api.ts` (NEW)
2. `frontend/store/slices/userAuthSlice.ts`
3. `frontend/store/store.ts`
4. `frontend/store/AuthInitializer.tsx`
5. `frontend/store/ReduxProvider.tsx`
6. `frontend/contexts/AuthContext.tsx`
7. `frontend/components/Providers.tsx`
8. `frontend/components/AuthLoadingWrapper.tsx` (NEW)
9. `frontend/package.json`

## Troubleshooting

### User still logged out on refresh
- Check browser cookies for `userRefreshToken`
- Verify backend `/auth/refresh` endpoint is working
- Check browser console for errors
- Verify `withCredentials: true` in axios config

### 401 errors not triggering refresh
- Check response interceptor is registered
- Verify store is injected into API service
- Check `_retry` flag is working

### Loading screen stuck
- Check `isInitialized` is being set to true
- Verify refresh endpoint is responding
- Check for infinite loops in auth logic
