# Debug Guide: Phone Number Not Saving from GPS Location

## Issue

When a user enters a phone number (e.g., `8787571234`) in the GPS location card and clicks "Continue to Payment", the phone number is not appearing on the admin order details page.

## Debug Logs Added

### 1. Address Page - When Setting Shipping Address

**File**: `frontend/app/checkout/address/page.tsx`

**Location**: In `handleContinue` function, before `setShippingAddress`

**Log**:
```javascript
console.log('🚀 Setting shipping address:', {
  gpsPhone,
  chosenPhone: chosen.phone,
  finalPhone: gpsPhone || chosen.phone,
  gpsLat,
  gpsLng,
  gpsAddress,
});
```

**What to check**:
- `gpsPhone` should be `"8787571234"` (the number you entered)
- `finalPhone` should be `"8787571234"`
- If `gpsPhone` is empty or undefined, the input is not updating state

### 2. Payment Page - When Building Order

**File**: `frontend/app/checkout/payment/page.tsx`

**Location**: In `buildShippingAddress` function (both Card and COD versions)

**Logs**:
```javascript
console.log('📦 [Card Payment] Building shipping address:', address);
// or
console.log('📦 [COD] Building shipping address:', address);
```

**What to check**:
- `phone` field should be `"8787571234"`
- If it's empty, the CartContext didn't save it properly

### 3. Admin Page - When Displaying Order

**File**: `admin/src/app/(admin)/admin/orders/[id]/page.tsx`

**Location**: In `useEffect` when order loads

**Log**:
```javascript
console.log('📦 Order Data:', {
  orderId: currentOrder.orderId,
  orderType: currentOrder.orderType,
  shippingAddress: currentOrder.shippingAddress,
  user: currentOrder.user,
});
console.log('📞 Phone Numbers:', {
  'shippingAddress.phone': currentOrder.shippingAddress?.phone,
  'user.phone': currentOrder.user?.phone,
});
```

**What to check**:
- `shippingAddress.phone` should be `"8787571234"`
- If it's empty, the backend didn't save it

## Testing Steps

### Step 1: Clear Browser Cache

1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Refresh page (Ctrl+F5)

### Step 2: Place a Test Order

1. **Frontend**: Go to checkout
2. Click "📍 Pin Exact Location on Map"
3. Confirm location
4. **Enter phone number**: `8787571234`
5. **Open Console** (F12) - keep it open!
6. Click "Continue to Payment"
7. **Check Console Log 1**: Look for `🚀 Setting shipping address:`
   ```
   🚀 Setting shipping address: {
     gpsPhone: "8787571234",  // ✅ Should have value
     chosenPhone: "...",
     finalPhone: "8787571234", // ✅ Should be your entered number
     gpsLat: 53.xxx,
     gpsLng: -0.xxx,
     gpsAddress: "..."
   }
   ```

8. Complete payment (use test card or COD)
9. **Check Console Log 2**: Look for `📦 [COD] Building shipping address:` or `📦 [Card Payment] Building shipping address:`
   ```
   📦 [COD] Building shipping address: {
     fullName: "...",
     line1: "...",
     city: "...",
     postcode: "...",
     phone: "8787571234",  // ✅ Should have value
     lat: 53.xxx,
     lng: -0.xxx,
     formattedAddress: "..."
   }
   ```

10. **Admin**: Open the order details page
11. **Check Console Log 3**: Look for `📦 Order Data:` and `📞 Phone Numbers:`
    ```
    📦 Order Data: {
      orderId: "ORD-...",
      orderType: "delivery",
      shippingAddress: {
        fullName: "...",
        line1: "...",
        phone: "8787571234",  // ✅ Should have value
        ...
      },
      user: { ... }
    }
    📞 Phone Numbers: {
      'shippingAddress.phone': "8787571234",  // ✅ Should have value
      'user.phone': "9897778932"
    }
    ```

12. **Verify UI**: Contact Number section should show `8787571234`

## Possible Issues & Solutions

### Issue 1: `gpsPhone` is empty in Log 1

**Symptom**: Console shows `gpsPhone: ""`

**Cause**: Input is not updating state

**Solution**: Check if there's a JavaScript error preventing state update

**Fix**: Verify the input field has `onChange={(e) => setGpsPhone(e.target.value)}`

### Issue 2: `phone` is empty in Log 2

**Symptom**: Console shows `phone: ""`

**Cause**: CartContext didn't save the phone

**Solution**: Check if `setShippingAddress` was called with correct data

**Fix**: Verify Log 1 shows correct `gpsPhone` value

### Issue 3: `shippingAddress.phone` is empty in Log 3

**Symptom**: Console shows `'shippingAddress.phone': undefined`

**Cause**: Backend didn't save the phone

**Solution**: Check backend logs for the order creation

**Backend Log to Check**:
```bash
cd Backend
# Check the console output when order is created
# Should see the shippingAddress with phone field
```

### Issue 4: Phone shows but it's the wrong number

**Symptom**: Shows `9897778932` instead of `8787571234`

**Cause**: Using fallback to `user.phone`

**Solution**: This was the old code - should be fixed now

**Verify**: Check that admin code doesn't have `|| currentOrder.user?.phone`

## Expected Console Output (Complete Flow)

```
// 1. When clicking "Continue to Payment"
🚀 Setting shipping address: {
  gpsPhone: "8787571234",
  chosenPhone: "9897778932",
  finalPhone: "8787571234",
  gpsLat: 53.234567,
  gpsLng: -0.543210,
  gpsAddress: "The Modern Indian Cuisine, 370, High Street..."
}

// 2. When placing order
📦 [COD] Building shipping address: {
  fullName: "avirag",
  line1: "The Modern Indian Cuisine, 370, High Street",
  line2: "",
  city: "Lincoln",
  postcode: "LN5 7RU",
  phone: "8787571234",  // ✅ Correct!
  instructions: "",
  lat: 53.234567,
  lng: -0.543210,
  formattedAddress: "The Modern Indian Cuisine, 370, High Street..."
}

// 3. When viewing order in admin
📦 Order Data: {
  orderId: "ORD-202605-0049",
  orderType: "delivery",
  shippingAddress: {
    fullName: "avirag",
    line1: "The Modern Indian Cuisine, 370, High Street",
    city: "Lincoln",
    postcode: "LN5 7RU",
    phone: "8787571234",  // ✅ Correct!
    lat: 53.234567,
    lng: -0.543210,
    formattedAddress: "..."
  },
  user: {
    name: "avirag",
    email: "avirag@gmail.com",
    phone: "9897778932"  // Different - this is profile phone
  }
}
📞 Phone Numbers: {
  'shippingAddress.phone': "8787571234",  // ✅ Delivery contact
  'user.phone': "9897778932"              // Profile phone
}
```

## Quick Test

1. Clear cache
2. Place order with GPS + phone `8787571234`
3. Check all 3 console logs
4. Take screenshots of console output
5. Share screenshots if issue persists

## Files Modified

1. ✅ `frontend/app/checkout/address/page.tsx` - Added Log 1
2. ✅ `frontend/app/checkout/payment/page.tsx` - Added Log 2 (both versions)
3. ✅ `admin/src/app/(admin)/admin/orders/[id]/page.tsx` - Added Log 3

## Next Steps

After testing with the debug logs:

1. If all logs show correct phone → Issue is in UI display (check CSS/visibility)
2. If Log 1 is wrong → Issue is in address page state management
3. If Log 2 is wrong → Issue is in CartContext
4. If Log 3 is wrong → Issue is in backend save

Share the console output and we can pinpoint the exact issue!
