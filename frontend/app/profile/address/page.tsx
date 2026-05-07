'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SavedAddress } from '../../../types';
import AddressModal from '../../../components/AddressModal/AddressModal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../../store/slices/addressSlice';

export default function AddressPage() {
  const dispatch = useAppDispatch();
  const { items: addresses, loading, saving, deleting, error } = useAppSelector(s => s.addresses);

  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [editingAddress,  setEditingAddress]  = useState<SavedAddress | undefined>(undefined);

  useEffect(() => { dispatch(fetchAddresses()); }, [dispatch]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleAddNew = () => { setEditingAddress(undefined); setIsModalOpen(true); };
  const handleEdit   = (a: SavedAddress) => { setEditingAddress(a); setIsModalOpen(true); };

  const handleSave = async (address: SavedAddress) => {
    if (editingAddress) {
      const r = await dispatch(updateAddress(address));
      if (updateAddress.fulfilled.match(r)) { toast.success('Address updated'); setIsModalOpen(false); }
    } else {
      const { id: _id, ...payload } = address;
      const r = await dispatch(addAddress(payload));
      if (addAddress.fulfilled.match(r)) { toast.success('Address saved'); setIsModalOpen(false); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    const r = await dispatch(deleteAddress(id));
    if (deleteAddress.fulfilled.match(r)) toast.success('Address deleted');
  };

  const handleSetDefault = async (id: string) => {
    const r = await dispatch(setDefaultAddress(id));
    if (setDefaultAddress.fulfilled.match(r)) toast.success('Default address updated');
  };

  // ── Shared classes ──────────────────────────────────────────────────────────
  const cardCls   = 'bg-[rgba(255,255,255,0.9)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.5)] rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] max-sm:p-5 max-sm:rounded-2xl';
  const editBtnCls = 'bg-[#f3f4f6] text-[#10b981] border-2 border-[#10b981] px-6 py-[10px] rounded-2xl font-bold cursor-pointer transition-all duration-300 hover:bg-[#10b981] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed';
  const cancelBtnCls = 'bg-transparent text-[#4a4a4a] border-2 border-[#e2e8f0] px-6 py-[10px] rounded-2xl font-bold cursor-pointer disabled:opacity-50';

  return (
    <div className={cardCls}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[1.8rem] font-black tracking-[-0.5px] max-sm:text-[1.2rem]">
          My Addresses
        </h3>
        <button className={editBtnCls} onClick={handleAddNew} disabled={saving}>
          + Add New
        </button>
      </div>

      {/* Address list */}
      <div className="flex flex-col gap-5">

        {/* Loading skeleton */}
        {loading && addresses.length === 0 && (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white border-2 border-[#e2e8f0] rounded-3xl p-6 flex justify-between items-start opacity-50 animate-pulse">
                <div className="flex flex-col gap-1">
                  <div className="h-5 w-32 bg-[#e2e8f0] rounded" />
                  <div className="h-4 w-48 bg-[#f1f5f9] rounded mt-1" />
                  <div className="h-4 w-36 bg-[#f1f5f9] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && addresses.length === 0 && (
          <div className="text-center py-[60px] px-5 text-[#4a4a4a]">
            <span className="text-[3rem] mb-4 block">📍</span>
            <p>You haven&apos;t saved any addresses yet.</p>
          </div>
        )}

        {/* Address cards */}
        {addresses.map(addr => (
          <div
            key={addr.id}
            className="bg-white border-2 border-[#e2e8f0] rounded-3xl p-6 flex justify-between items-start transition-all duration-300 hover:border-[#10b981] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5"
            style={{
              opacity:     deleting === addr.id ? 0.5 : 1,
              borderColor: addr.isDefault ? '#10b981' : undefined,
            }}
          >
            {/* Details */}
            <div className="flex flex-col gap-1">
              <p className="m-0 text-[0.95rem] text-[#4a4a4a] leading-[1.5]">
                <strong className="text-[#1a1a1a] text-[1.15rem] flex items-center gap-[10px] mb-[6px]">
                  {addr.label}
                  {addr.isDefault && (
                    <span className="bg-[#10b981] text-white text-[0.65rem] px-[10px] py-1 rounded-lg font-extrabold uppercase tracking-[0.5px]">
                      Default
                    </span>
                  )}
                </strong>
              </p>
              <p className="m-0 text-[0.95rem] text-[#4a4a4a] leading-[1.5]">{addr.fullName}</p>
              <p className="m-0 text-[0.95rem] text-[#4a4a4a] leading-[1.5]">{addr.line1}</p>
              {addr.line2 && <p className="m-0 text-[0.95rem] text-[#4a4a4a] leading-[1.5]">{addr.line2}</p>}
              <p className="m-0 text-[0.95rem] text-[#4a4a4a] leading-[1.5]">{addr.city}, {addr.postcode}</p>
              <p className="m-0 text-[0.95rem] text-[#4a4a4a] leading-[1.5]">{addr.phone}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                <button
                  className="bg-[#f3f4f6] text-[#10b981] border-2 border-[#10b981] px-[14px] py-[6px] rounded-2xl font-bold text-[0.85rem] cursor-pointer transition-all hover:bg-[#10b981] hover:text-white disabled:opacity-50"
                  onClick={() => handleEdit(addr)}
                  disabled={saving || deleting === addr.id}
                >
                  Edit
                </button>
                <button
                  className="bg-transparent text-[#4a4a4a] border-2 border-[#e2e8f0] px-[14px] py-[6px] rounded-2xl font-bold text-[0.85rem] cursor-pointer disabled:opacity-50"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deleting === addr.id}
                >
                  {deleting === addr.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="bg-none border-none text-[#10b981] text-[0.8rem] font-semibold cursor-pointer p-0 underline"
                >
                  Set as default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
