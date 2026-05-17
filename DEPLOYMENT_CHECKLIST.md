# Deployment Checklist - Cookie Authentication Fix

## ✅ Changes Completed

### Backend Changes
- [x] Cookie path isolation (`/api/user` and `/api/admin`)
- [x] Dynamic cookie configuration (development vs production)
- [x] Enhanced logging for debugging
- [x] Mongoose configuration updated

### Documentation Created
- [x] `USER_LOGOUT_FIX.md` - Detailed technical explanation
- [x] `VERCEL_DEPLOYMENT_FIX.md` - Complete deployment guide
- [x] `QUICK_FIX_SUMMARY.md` - Quick reference
- [x] Environment variable templates for production

## 🎯 Current Status

### Local Development ✅
Your local setup is **working correctly**! The logs show:
- ✅ User auth controller is being called (not admin)
- ✅ Correct endpoints are being hit
- ✅ Refresh token is present
- ✅ User stays logged in on page refresh

### Production Deployment ⏳
Needs environment variable configuration (see below)

## 📋 Deployment Steps

### Step 1: Backend Deployment

#### Option A: Render.com
1. Create new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables (see below)

#### Option B: Railway.app
1. Create new project
2. Connect your GitHub repository
3. Add environment variables (see below)
4. Deploy

#### Option C: Heroku
1. Create new app
2. Connect your GitHub repository
3. Add environment variables (see below)
4. Deploy

#### Backend Environment Variables
```
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=your_production_mongodb_uri

# JWT Secrets (generate strong random strings)
ACCESS_TOKEN_SECRET=your_strong_random_secret_min_32_chars
REFRESH_TOKEN_SECRET=your_strong_random_secret_min_32_chars

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your_s3_bucket_name

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Shop Location
SHOP_LAT=53.2215
SHOP_LNG=-0.5422
DELIVERY_RADIUS_KM=11

# Frontend URLs (UPDATE AFTER DEPLOYING FRONTEND)
USER_FRONTEND_URL=https://your-user-app.vercel.app
ADMIN_FRONTEND_URL=https://your-admin-app.vercel.app
```

**Note**: After deploying frontend and admin, come back and update these URLs, then redeploy backend.

### Step 2: Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import your frontend repository
3. Set root directory to `frontend`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TStmhI0tkjrsU1ZXarvvMSjXeIz3TAdeUspZBOnCqAF3WiCydCcE0WDqyNImf5LwLiFTT1pOTD7DJctssmnE6qd00p9P9nxAC
   NEXT_PUBLIC_SHOP_LAT=53.2215
   NEXT_PUBLIC_SHOP_LNG=-0.5422
   NEXT_PUBLIC_DELIVERY_RADIUS_KM=11
   ```
5. Deploy
6. Copy the Vercel URL (e.g., `https://cocospice-user.vercel.app`)

### Step 3: Admin Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import your admin repository (or same repo, different project)
3. Set root directory to `admin`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
5. Deploy
6. Copy the Vercel URL (e.g., `https://cocospice-admin.vercel.app`)

### Step 4: Update Backend CORS

1. Go back to your backend hosting platform
2. Update environment variables:
   ```
   USER_FRONTEND_URL=https://cocospice-user.vercel.app
   ADMIN_FRONTEND_URL=https://cocospice-admin.vercel.app
   ```
3. **Redeploy backend** to apply CORS changes

### Step 5: Configure Stripe Webhook (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-backend.onrender.com/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Copy the webhook signing secret
5. Update backend environment variable:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   ```
6. Redeploy backend

## 🧪 Testing Production Deployment

### Test 1: Backend Health Check
```bash
curl https://your-backend.onrender.com/
```
Expected response:
```json
{"status":"ok","message":"API is running"}
```

### Test 2: User Login & Refresh
1. Go to `https://your-user-app.vercel.app`
2. Register/Login as a user
3. Open DevTools (F12) → Application → Cookies
4. Verify `userRefreshToken` cookie:
   - ✅ HttpOnly: true
   - ✅ Secure: true
   - ✅ SameSite: None
   - ✅ Path: /api/user
5. Refresh the page (F5)
6. **User should stay logged in** ✅

### Test 3: Admin Login & Refresh
1. Go to `https://your-admin-app.vercel.app`
2. Login as admin
3. Check cookies - verify `refreshToken`:
   - ✅ HttpOnly: true
   - ✅ Secure: true
   - ✅ SameSite: None
   - ✅ Path: /api/admin
4. Refresh the page (F5)
5. **Admin should stay logged in** ✅

### Test 4: Place Order (End-to-End)
1. Browse products on user frontend
2. Add items to cart
3. Proceed to checkout
4. Add delivery address
5. Complete payment with test card: `4242 4242 4242 4242`
6. Verify order appears in admin panel
7. Check Stripe dashboard for payment

## 🐛 Troubleshooting

### Issue: "CORS: origin not allowed"
**Cause**: Backend CORS URLs don't match frontend URLs
**Fix**: 
1. Check exact URLs in backend environment variables
2. Make sure they include `https://` and no trailing slash
3. Redeploy backend after updating

### Issue: Cookies not being set
**Cause**: `NODE_ENV` not set to `production` or backend not using HTTPS
**Fix**:
1. Verify `NODE_ENV=production` in backend
2. Verify backend URL starts with `https://`
3. Check browser console for cookie warnings

### Issue: Cookies not being sent with requests
**Cause**: CORS credentials not configured
**Fix**:
1. Verify `credentials: true` in backend CORS (already set)
2. Verify `withCredentials: true` in frontend API (already set)
3. Clear browser cookies and try again

### Issue: User logged out on refresh
**Cause**: Cookie not persisting or not being sent
**Fix**:
1. Check browser DevTools → Network tab
2. Look for `/api/user/auth/me` or `/api/user/auth/refresh` request
3. Check if `userRefreshToken` cookie is being sent
4. Check backend logs for errors
5. Verify cookie settings (Secure, SameSite, Path)

### Issue: Mongoose deprecation warning
**Cause**: Mongoose internal default behavior
**Fix**: Already handled in `Backend/src/config/db.ts`
**Note**: This warning doesn't affect functionality

## 📊 Monitoring

### Backend Logs
Monitor your backend logs for:
- ✅ Successful auth requests
- ❌ CORS errors
- ❌ Cookie errors
- ❌ Database errors

### Frontend Errors
Check browser console for:
- ❌ Network errors (401, 403, 500)
- ❌ CORS errors
- ❌ Cookie warnings

### Stripe Dashboard
Monitor for:
- ✅ Successful payments
- ❌ Failed payments
- ✅ Webhook deliveries

## 🔒 Security Checklist

- [x] HttpOnly cookies (prevents XSS)
- [x] Secure flag in production (HTTPS only)
- [x] SameSite: 'none' for cross-domain (with Secure flag)
- [x] Path isolation (prevents cookie conflicts)
- [x] CORS restricted to specific origins
- [x] JWT secrets are strong and unique
- [ ] Use production Stripe keys (not test keys)
- [ ] Enable rate limiting (optional, recommended)
- [ ] Set up monitoring/alerts (optional, recommended)

## 📚 Additional Resources

- [Render Deployment Guide](https://render.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Backend health check returns 200 OK
- ✅ User can login and stays logged in on refresh
- ✅ Admin can login and stays logged in on refresh
- ✅ Orders can be placed and appear in admin panel
- ✅ Stripe payments work correctly
- ✅ No CORS errors in browser console
- ✅ Cookies have correct settings (HttpOnly, Secure, SameSite)

## 🎉 You're Done!

Once all tests pass, your application is successfully deployed with working authentication!

## 📞 Support

If you encounter issues not covered in this guide:
1. Check browser DevTools → Console for errors
2. Check browser DevTools → Network for failed requests
3. Check backend logs for errors
4. Review the detailed guides:
   - `USER_LOGOUT_FIX.md` - Technical details
   - `VERCEL_DEPLOYMENT_FIX.md` - Deployment specifics
   - `QUICK_FIX_SUMMARY.md` - Quick reference
