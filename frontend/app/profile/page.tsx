'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/userAuthSlice';
import { privateApi } from '@/lib/api';
import type { RootState } from '@/store/store';

// ─── Style tokens ─────────────────────────────────────────────────────────────

const cardCls      = 'bg-[rgba(255,255,255,0.92)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.5)] rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] max-sm:p-5 max-sm:rounded-2xl';
const labelCls     = 'text-[0.85rem] font-bold text-[#4a4a4a] ml-1 mb-1 block max-sm:text-[0.75rem]';
const inputBase    = 'bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl px-5 py-[13px] text-[0.95rem] font-semibold transition-all duration-300 focus:outline-none focus:border-[#10b981] focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] w-full max-sm:px-3 max-sm:py-[10px] max-sm:text-[0.9rem]';
const inputRO      = 'bg-transparent border-transparent pl-0 cursor-default text-[#374151]';

// ─── S3 / proxy helpers ───────────────────────────────────────────────────────
// NEXT_PUBLIC_API_URL = "http://localhost:5000/api"
// Backend user upload proxy: GET /api/user/upload/image?key=...
// So the full URL is:  NEXT_PUBLIC_API_URL + "/user/upload/image?key=..."

const S3_BUCKET = 'hokz-media-storage';
const S3_REGION = 'eu-north-1';

const keyToS3Url = (key: string) =>
  `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

/**
 * Convert a stored S3 URL or raw key into the backend proxy URL.
 * NEXT_PUBLIC_API_URL already contains "/api", so we append "/user/upload/image".
 */
const toProxyUrl = (urlOrKey: string): string => {
  if (!urlOrKey) return '';
  // Already a proxy URL — return as-is
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  // Extract key from a full S3 URL
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${process.env.NEXT_PUBLIC_API_URL}/api/user/upload/image?key=${encodeURIComponent(key)}`;
};

// ─── Validation ───────────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileDetailsPage() {
  const dispatch = useAppDispatch();
  const { user, isUpdating } = useAppSelector((s: RootState) => s.userAuth);

  const [isEditing, setIsEditing]           = useState(false);
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');

  // Image state
  const [displayUrl, setDisplayUrl]         = useState('');  // shown in <img>
  const [pendingKey, setPendingKey]         = useState('');  // S3 key from upload
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Sync form from Redux user ─────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setName(user.name   ?? '');
      setEmail(user.email ?? '');
      setPhone(user.phone ?? '');
      setDisplayUrl(user.profileImage ? toProxyUrl(user.profileImage) : '');
    }
  }, [user]);

  // ── Image pick & upload ───────────────────────────────────────────────────

  const handleImageClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    // Show local preview immediately so the user sees feedback right away
    const localPreview = URL.createObjectURL(file);
    setDisplayUrl(localPreview);

    setIsUploadingImg(true);
    const toastId = toast.loading('Uploading image…');

    try {
      const fd = new FormData();
      fd.append('image', file);

      // POST /api/user/upload?folder=user/profiles
      // privateApi base = NEXT_PUBLIC_API_URL + "/user"
      // → full URL: http://localhost:5000/api/user/upload?folder=user%2Fprofiles
      const { data } = await privateApi.post<{ url: string; key: string }>(
        `/upload?folder=${encodeURIComponent('user/profiles')}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Replace local blob preview with the real proxy URL
      URL.revokeObjectURL(localPreview);
      setPendingKey(data.key);
      setDisplayUrl(toProxyUrl(data.key));
      toast.success('Image ready — click Save to apply', { id: toastId });
    } catch (err: unknown) {
      // Revert preview on failure
      URL.revokeObjectURL(localPreview);
      setDisplayUrl(user?.profileImage ? toProxyUrl(user.profileImage) : '');
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Image upload failed';
      toast.error(msg, { id: toastId });
    } finally {
      setIsUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    if (!isValidEmail(email)) { toast.error('Please enter a valid email address'); return; }

    // Only send fields that actually changed
    const payload: Record<string, string> = {};
    if (name.trim()  !== (user?.name  ?? '')) payload.name  = name.trim();
    if (email.trim() !== (user?.email ?? '')) payload.email = email.trim();
    if (phone.trim() !== (user?.phone ?? '')) payload.phone = phone.trim();
    // Construct full S3 URL from the key (same as admin handleSave)
    if (pendingKey) payload.profileImage = keyToS3Url(pendingKey);

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    const toastId = toast.loading('Saving profile…');
    try {
      await dispatch(updateProfile(payload)).unwrap();
      // Redux state.user is now updated with the fresh user from the server.
      // The useEffect above will re-sync displayUrl from user.profileImage.
      toast.success('Profile updated successfully', { id: toastId });
      setIsEditing(false);
      setPendingKey('');
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : 'Failed to update profile';
      toast.error(msg, { id: toastId });
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────

  const handleCancel = () => {
    setName(user?.name   ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    setDisplayUrl(user?.profileImage ? toProxyUrl(user.profileImage) : '');
    setPendingKey('');
    setIsEditing(false);
  };

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className={cardCls}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8 max-sm:mb-5">
        <div>
          <h3 className="text-[1.7rem] font-black tracking-[-0.5px] text-[#111827] max-sm:text-[1.2rem]">
            Profile Information
          </h3>
          <p className="text-[0.85rem] text-[#6b7280] mt-1">
            {isEditing ? 'Update your personal details below' : 'View and manage your account details'}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#f3f4f6] text-[#10b981] border-2 border-[#10b981] px-6 py-[10px] rounded-2xl font-bold cursor-pointer transition-all duration-300 hover:bg-[#10b981] hover:text-white max-sm:px-3 max-sm:py-[6px] max-sm:text-[0.8rem]"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-8 max-sm:mb-5">
        <div className="flex flex-col items-center gap-2">
          <div
            onClick={handleImageClick}
            className={`relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center select-none ${isEditing ? 'cursor-pointer' : ''}`}
          >
            {/* Upload spinner overlay */}
            {isUploadingImg && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="w-8 h-8 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Image or initials */}
            {displayUrl ? (
              <img
                src={displayUrl}
                alt={name || 'Profile'}
                className="w-full h-full object-cover"
                onError={() => setDisplayUrl('')}
              />
            ) : (
              <span className="text-4xl font-black text-white">{initials}</span>
            )}

            {/* Camera hover overlay — edit mode only */}
            {isEditing && !isUploadingImg && (
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="text-white text-[0.65rem] font-bold mt-1">Change</span>
              </div>
            )}
          </div>

          {isEditing && (
            <p className="text-[0.72rem] text-[#9ca3af]">
              Click photo to change · Max 5 MB
            </p>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-sm:gap-4">

        <div className="flex flex-col">
          <label className={labelCls}>Full Name</label>
          <input
            type="text"
            className={`${inputBase} ${!isEditing ? inputRO : ''}`}
            value={name}
            onChange={e => setName(e.target.value)}
            readOnly={!isEditing}
            placeholder="Your full name"
          />
        </div>

        <div className="flex flex-col">
          <label className={labelCls}>Email Address</label>
          <input
            type="email"
            className={`${inputBase} ${!isEditing ? inputRO : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            readOnly={!isEditing}
            placeholder="your@email.com"
          />
        </div>

        <div className="flex flex-col">
          <label className={labelCls}>Phone Number</label>
          <input
            type="tel"
            className={`${inputBase} ${!isEditing ? inputRO : ''}`}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            readOnly={!isEditing}
            placeholder="e.g. 07890 123456"
          />
        </div>

        {/* Save / Cancel */}
        {isEditing && (
          <div className="col-span-2 flex gap-4 mt-2 max-md:col-span-1 max-sm:flex-col">
            <button
              onClick={handleSave}
              disabled={isUpdating || isUploadingImg}
              className="flex-1 flex items-center justify-center gap-2 bg-[#10b981] text-white px-8 py-[14px] rounded-2xl font-extrabold cursor-pointer shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:bg-[#059669] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating || isUploadingImg}
              className="flex-1 bg-transparent text-[#4a4a4a] border-2 border-[#e2e8f0] px-8 py-[14px] rounded-2xl font-bold cursor-pointer hover:border-[#d1d5db] hover:bg-[#f9fafb] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Info note — view mode */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 rounded-2xl bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)] px-5 py-4"
        >
          <p className="text-[0.82rem] text-[#6b7280] text-center leading-relaxed">
            Click <strong className="text-[#10b981]">Edit Profile</strong> to update your name, email, phone number, or profile photo.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
