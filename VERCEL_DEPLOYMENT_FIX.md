# Vercel Deployment - Cookie Authentication Fix

## Problem
Users get logged out when refreshing the page on Vercel (production), but it works fine locally.

## Root Cause
Cookie configuration issues in production:
1. **`secure` flag**: Must be `true` for HTTPS (Vercel uses HTTPS)
2. **`sameSite` flag**: Must be `'none'` when frontend and backend are on different domains
3. **CORS configuration**: Must allow credentials from production frontend URLs

## Solution Implemented

### 1. Dynamic Cookie Configuration Based on Environment

#### Backend - User Auth Controller
```typescript
const isProduction = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isProduction,  // true in production (HTTPS), false in development
  sameSite: isProduction ? 'none' as const : 'lax' as const,  // 'none' for cross-domain
  path:     '/api/user',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};
```

#### Backend - Admin Auth Controller
```typescript
const isProduction = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isProduction,  // true in production (HTTPS), false in development
  sameSite: isProduction ? 'none' as const : 'lax' as const,  // 'none' for cross-domain
  path:     '/api/admin',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};
```

### 2. Cookie Settings Explanation

#### Development (localhost)
- `secure: false` - HTTP is allowed
- `sameSite: 'lax'` - Same-site requests only
- Works because frontend and backend are on same domain (localhost)

#### Production (Vercel + Backend)
- `secure: true` - HTTPS required (Vercel uses HTTPS)
- `sameSite: 'none'` - Cross-site requests allowed (frontend and backend on different domains)
- Required because:
  - Frontend: `https://your-app.vercel.app`
  - Backend: `https://your-backend.com`
  - Different domains = cross-site

### 3. CORS Configuration

The backend already has CORS configured in `Backend/src/index.ts`:
```typescript
const allowedOrigins = [
  process.env.USER_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,  // ✅ Required for cookies
}));
```

## Deployment Steps

### Step 1: Backend Deployment (Render/Railway/Heroku)

1. **Set Environment Variables** in your backend hosting platform:
   ```
   NODE_ENV=production
   MONGO_URI=your_production_mongodb_uri
   ACCESS_TOKEN_SECRET=your_strong_secret
   REFRESH_TOKEN_SECRET=your_strong_secret
   USER_FRONTEND_URL=https://your-user-app.vercel.app
   ADMIN_FRONTEND_URL=https://your-admin-app.vercel.app
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET=your_bucket
   STRIPE_SECRET_KEY=your_stripe_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   SHOP_LAT=53.2215
   SHOP_LNG=-0.5422
   DELIVERY_RADIUS_KM=11
   ```

2. **Deploy backend** and note the URL (e.g., `https://your-backend.onrender.com`)

### Step 2: Frontend Deployment (Vercel)

1. **Set Environment Variables** in Vercel project settings:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   NEXT_PUBLIC_SHOP_LAT=53.2215
   NEXT_PUBLIC_SHOP_LNG=-0.5422
   NEXT_PUBLIC_DELIVERY_RADIUS_KM=11
   ```

2. **Deploy frontend** to Vercel

### Step 3: Admin Panel Deployment (Vercel)

1. **Set Environment Variables** in Vercel project settings:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

2. **Deploy admin panel** to Vercel

### Step 4: Update Backend Environment Variables

After deploying frontend and admin to Vercel, update backend environment variables with the actual Vercel URLs:
```
USER_FRONTEND_URL=https://your-user-app.vercel.app
ADMIN_FRONTEND_URL=https://your-admin-app.vercel.app
```

Then **redeploy the backend** to apply the CORS changes.

## Testing in Production

### 1. Test User Login & Refresh
1. Go to your production user frontend (https://your-user-app.vercel.app)
2. Login as a user
3. Open DevTools → Application → Cookies
4. Verify `userRefreshToken` cookie exists with:
   - `HttpOnly: true`
   - `Secure: true`
   - `SameSite: None`
   - `Path: /api/user`
5. Refresh the page (F5)
6. User should stay logged in ✅

### 2. Test Admin Login & Refresh
1. Go to your production admin panel (https://your-admin-app.vercel.app)
2. Login as admin
3. Check cookies - should see `refreshToken` with:
   - `HttpOnly: true`
   - `Secure: true`
   - `SameSite: None`
   - `Path: /api/admin`
4. Refresh the page (F5)
5. Admin should stay logged in ✅

## Common Issues & Solutions

### Issue 1: "CORS: origin not allowed"
**Solution**: Make sure `USER_FRONTEND_URL` and `ADMIN_FRONTEND_URL` in backend .env match your Vercel URLs exactly (including https://)

### Issue 2: Cookies not being set
**Solution**: 
- Verify `NODE_ENV=production` is set in backend
- Verify backend is using HTTPS (not HTTP)
- Check browser console for cookie warnings

### Issue 3: Cookies not being sent with requests
**Solution**:
- Verify `withCredentials: true` in frontend API configuration (already set in `frontend/lib/api.ts`)
- Verify `credentials: true` in backend CORS config (already set in `Backend/src/index.ts`)

### Issue 4: Still getting logged out on refresh
**Solution**:
1. Clear all cookies in browser
2. Check backend logs to see if `/api/user/auth/me` or `/api/user/auth/refresh` is being called
3. Verify `userRefreshToken` cookie is being sent with the request
4. Check for any errors in backend logs

## Why This Fix Works

### Development (localhost)
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Same domain (localhost), so `sameSite: 'lax'` works
- HTTP is allowed, so `secure: false` works

### Production (Vercel)
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.com`
- Different domains, so `sameSite: 'none'` is required
- HTTPS only, so `secure: true` is required
- Browser enforces: `sameSite: 'none'` requires `secure: true`

## Security Notes

1. **HttpOnly cookies**: Prevent XSS attacks (JavaScript cannot access the cookie)
2. **Secure flag**: Ensures cookies are only sent over HTTPS
3. **SameSite: 'none'**: Required for cross-domain, but secure flag must be true
4. **Path isolation**: `/api/user` and `/api/admin` prevent cookie conflicts
5. **CORS credentials**: Only allowed origins can send cookies

## Files Modified

- `Backend/src/controllers/user/auth.controller.ts` - Dynamic cookie config
- `Backend/src/controllers/admin/auth.controller.ts` - Dynamic cookie config
- `Backend/.env.production.example` - Production environment template
- `frontend/.env.production.example` - Production environment template
- `admin/.env.production.example` - Production environment template

## Next Steps

1. ✅ Cookie configuration updated (done)
2. ⏳ Deploy backend with `NODE_ENV=production`
3. ⏳ Deploy frontend with production API URL
4. ⏳ Deploy admin with production API URL
5. ⏳ Update backend CORS with actual Vercel URLs
6. ⏳ Test login and refresh in production

## Additional Resources

- [MDN: SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Chrome: SameSite cookie changes](https://www.chromium.org/updates/same-site/)
- [Vercel: Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
