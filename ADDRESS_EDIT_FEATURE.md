# Address Edit Feature Implementation

## Overview
Added the ability to edit saved addresses directly from the `/checkout/address` page. Users can now update their address details without having to delete and re-add addresses.

## Changes Made

### 1. Frontend - Address Page (`frontend/app/checkout/address/page.tsx`)

#### New State Variables:
```typescript
const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
```
- Tracks which address is currently being edited

#### New Functions:

**`handleEdit(addr: SavedAddress)`**
- Opens the AddressModal with the selected address pre-filled
- Sets the editing state

**`handleUpdate(updatedAddr: SavedAddress)`**
- Dispatches the `updateAddress` Redux action
- Shows success toast on completion
- Clears editing state

**`handleModalSave(addr: SavedAddress)`**
- Unified handler for both add and update operations
- Determines whether to call `handleAddNew` or `handleUpdate` based on editing state

#### UI Changes:

**Edit Button on Each Address Card:**
```typescript
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation(); // Prevent selecting the address
    handleEdit(addr);
  }}
  style={{
    position: 'absolute',
    top: 12,
    right: 12,
    background: '#f3f4f6',
    border: '1.5px solid #e5e7eb',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.2s',
  }}
>
  <svg>...</svg>
  Edit
</button>
```

**Features:**
- ✅ Positioned in top-right corner of each address card
- ✅ Hover effect (changes to green)
- ✅ Prevents address selection when clicked (using `e.stopPropagation()`)
- ✅ Shows edit icon + "Edit" text

**Address Card Styling:**
- Added `position: 'relative'` to address cards for proper edit button positioning

**Modal Integration:**
```typescript
<AddressModal
  address={editingAddress || undefined} // Pass address when editing
  onClose={() => {
    setShowModal(false);
    setEditingAddress(null); // Clear editing state
  }}
  onSave={handleModalSave} // Unified save handler
  saving={saving}
/>
```

### 2. Redux Integration

**Import Added:**
```typescript
import { fetchAddresses, addAddress, updateAddress } from '@/store/slices/addressSlice';
```

**Redux Action Used:**
- `updateAddress(payload: SavedAddress)` - Already implemented in the slice

### 3. Backend (Already Implemented)

The backend already has full support for address updates:

**Endpoint:** `PATCH /api/user/addresses/:id`

**Controller:** `Backend/src/controllers/user/address.controller.ts`
- `updateAddress()` function handles the update logic
- Uses MongoDB transactions for atomicity
- Validates ownership via `sessionId`
- Handles default address switching

**Features:**
- ✅ Validates `sessionId` for security
- ✅ Atomic updates using MongoDB transactions
- ✅ Automatically handles default address switching
- ✅ Returns updated address in response

**Request Body:**
```typescript
{
  sessionId: string;
  label?: string;
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postcode?: string;
  phone?: string;
  isDefault?: boolean;
}
```

**Response:**
```typescript
{
  address: {
    _id: string;
    label: string;
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    phone: string;
    isDefault: boolean;
  },
  message: "Address updated successfully"
}
```

## User Flow

### Editing an Address:

1. **User navigates to `/checkout/address`**
   - Sees all saved addresses with "Edit" buttons

2. **User clicks "Edit" button on an address**
   - Modal opens with address details pre-filled
   - All fields are editable

3. **User modifies address details**
   - Can change label, name, address lines, city, postcode, phone
   - Can toggle "Set as default" checkbox

4. **User clicks "Update Address"**
   - Redux action dispatched to backend
   - Backend validates and updates the address
   - Success toast shown: "Address updated successfully"
   - Modal closes automatically
   - Address list refreshes with updated data

5. **Updated address is immediately visible**
   - Changes reflected in the address card
   - If set as default, other addresses lose default status

## Technical Details

### State Management Flow:
```
User clicks Edit
  ↓
setEditingAddress(addr)
  ↓
setShowModal(true)
  ↓
AddressModal opens with pre-filled data
  ↓
User modifies and saves
  ↓
handleModalSave() called
  ↓
Checks if editingAddress exists
  ↓
If yes: handleUpdate() → dispatch(updateAddress())
If no: handleAddNew() → dispatch(addAddress())
  ↓
Backend processes request
  ↓
Redux state updated
  ↓
UI refreshes
  ↓
Modal closes, editingAddress cleared
```

### Security:
- ✅ `sessionId` required for all operations
- ✅ Backend validates ownership before allowing updates
- ✅ MongoDB transactions ensure data consistency
- ✅ No address can be updated by unauthorized users

### Error Handling:
- ✅ Backend validation errors shown via toast
- ✅ Network errors caught and displayed
- ✅ Loading states prevent duplicate submissions
- ✅ Modal stays open on error for user to retry

## Testing Checklist

### Basic Edit Flow:
- [ ] Click "Edit" on an address
- [ ] Modal opens with correct pre-filled data
- [ ] Modify address label
- [ ] Save and verify update appears
- [ ] Toast notification shows success

### Phone Number Edit:
- [ ] Edit an address and change phone number
- [ ] Save the address
- [ ] Place an order using that address
- [ ] Verify admin side shows updated phone number

### Default Address Switching:
- [ ] Edit a non-default address
- [ ] Check "Set as default"
- [ ] Save and verify it becomes default
- [ ] Verify previous default is no longer default

### Multiple Fields Edit:
- [ ] Edit multiple fields at once (name, address, phone, etc.)
- [ ] Save and verify all changes persist
- [ ] Refresh page and verify changes are still there

### Validation:
- [ ] Try to save with empty required fields
- [ ] Verify validation errors appear
- [ ] Fill in required fields and save successfully

### Cancel/Close:
- [ ] Open edit modal
- [ ] Make changes but click close/cancel
- [ ] Verify changes are not saved
- [ ] Verify modal closes properly

### Edit Button Interaction:
- [ ] Click edit button doesn't select the address
- [ ] Hover effect works (button turns green)
- [ ] Button is visible on all address cards
- [ ] Button positioned correctly in top-right corner

## Benefits

1. **Better UX**: Users can fix typos or update details without deleting and re-adding
2. **Faster**: No need to re-enter all fields for small changes
3. **Safer**: Preserves address ID and order history
4. **Consistent**: Uses the same modal component for add and edit
5. **Intuitive**: Edit button clearly visible on each address card

## Future Enhancements (Optional)

- Add delete button alongside edit button
- Add confirmation dialog before deleting
- Add address validation (postcode format, etc.)
- Add address autocomplete using Google Places API
- Add bulk edit/delete operations
- Add address import from previous orders
