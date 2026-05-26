'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Loader2, Camera, Save, X, Edit } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { getMe, updateProfile } from '@/store/slices/authSlice';
import productService, { toProxyUrl } from '@/services/productService';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { admin, isRefreshing, loading } = useAppSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [profileImageKey, setProfileImageKey] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!admin) {
      dispatch(getMe());
    }
  }, [admin, dispatch]);

  useEffect(() => {
    if (admin) {
      setFullName(admin.fullName);
      setProfileImage(admin.profileImage ? toProxyUrl(admin.profileImage) : '');
    }
  }, [admin]);

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    const uploadToast = toast.loading('Syncing with media storage...');

    try {
      const result = await productService.uploadImage(file, 'admin/profiles');
      setProfileImage(result.url);
      setProfileImageKey(result.key);
      toast.success('Media synced successfully', { id: uploadToast });
    } catch (error) {
      toast.error('Failed to sync media', { id: uploadToast });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Identity cannot be empty');
      return;
    }

    const updateToast = toast.loading('Updating credentials...');
    let s3Url = admin?.profileImage || '';
    
    if (profileImageKey) {
      const bucket = 'hokz-media-storage';
      const region = 'eu-north-1';
      s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${profileImageKey}`;
    }

    try {
      await dispatch(updateProfile({
        fullName: fullName.trim(),
        profileImage: s3Url || undefined,
      })).unwrap();

      // Force refresh the admin data to update header and sidebar
      await dispatch(getMe()).unwrap();

      toast.success('Security manifest updated!', { id: updateToast });
      setIsEditing(false);
      setProfileImageKey('');
    } catch (error) {
      toast.error('Failed to update credentials', { id: updateToast });
    }
  };

  const handleCancel = () => {
    if (admin) {
      setFullName(admin.fullName);
      setProfileImage(admin.profileImage ? toProxyUrl(admin.profileImage) : '');
      setProfileImageKey('');
    }
    setIsEditing(false);
  };

  if (isRefreshing || !admin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-[24px] bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
           <Loader2 size={28} className="animate-spin text-emerald-500" />
        </div>
        <p className="text-[1rem] font-bold text-gray-900 tracking-tight">Authenticating Identity...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="flex min-h-[70vh] items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* ── Profile Architecture ── */}
          <div className="relative overflow-hidden rounded-[40px] border border-gray-100 bg-white p-10 lg:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.04)]">
            {/* Background Aesthetics */}
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-50/40 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-50/40 blur-3xl" />

            <div className="relative z-10 space-y-12">
              {/* Header Interface */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="text-center sm:text-left">
                  <h1 className="text-[2.5rem] font-bold text-gray-900 tracking-tighter leading-none">Account</h1>
                  <p className="mt-2 text-[1rem] font-bold text-gray-400 uppercase tracking-widest">
                    Security & Identity Manifest
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-3 rounded-[20px] bg-emerald-500 px-7 py-4 text-[0.9rem] font-bold text-white hover:bg-emerald-600 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                  >
                    <Edit size={18} strokeWidth={3} />
                    Modify Profile
                  </button>
                )}
              </div>

              {/* Identity Manifestation */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-emerald-100 opacity-30 blur-2xl group-hover:opacity-60 transition-opacity" />
                  
                  <div 
                    className={`relative h-44 w-44 overflow-hidden rounded-full border-[8px] border-white bg-gray-50 shadow-2xl transition-all flex items-center justify-center ${isEditing ? 'cursor-pointer ring-8 ring-emerald-50 hover:ring-emerald-100' : ''}`}
                    onClick={handleImageClick}
                  >
                    {isUploadingImage ? (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50/90 backdrop-blur-sm">
                        <Loader2 size={44} className="animate-spin text-emerald-500" />
                      </div>
                    ) : profileImage ? (
                      <div className="h-full w-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={profileImage} 
                          alt={fullName} 
                          className="min-h-full min-w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-[5rem] font-bold text-emerald-600">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {isEditing && !isUploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity backdrop-blur-[4px]">
                        <Camera size={44} className="text-white drop-shadow-2xl" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
                {isEditing && <p className="text-[0.7rem] font-bold text-emerald-600 uppercase tracking-widest">Update Visual Identity</p>}
              </div>

              {/* Data Terminal */}
              <div className="grid grid-cols-1 gap-8">
                {/* Name Control */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 px-1 text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest">
                    <User size={16} className="text-emerald-500" strokeWidth={3} />
                    Legal Identity
                  </label>
                  {isEditing ? (
                    <input
                      type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-16 rounded-[22px] border-none bg-gray-50 px-6 text-[1.1rem] font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                  ) : (
                    <div className="h-16 flex items-center rounded-[22px] border border-gray-100 bg-gray-50/50 px-6">
                      <p className="text-[1.1rem] font-bold text-gray-900">{admin.fullName}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Communication Interface */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 px-1 text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest">
                      <Mail size={16} className="text-blue-500" strokeWidth={3} />
                      Communication
                    </label>
                    <div className="h-16 flex items-center rounded-[22px] border border-gray-50 bg-gray-50/30 px-6 opacity-60">
                      <p className="text-[1rem] font-bold text-gray-500 truncate">{admin.email}</p>
                    </div>
                  </div>

                  {/* Permission Tier */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 px-1 text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest">
                      <Shield size={16} className="text-purple-500" strokeWidth={3} />
                      Authorization Tier
                    </label>
                    <div className="h-16 flex items-center rounded-[22px] border border-gray-50 bg-gray-50/30 px-6 opacity-60">
                      <p className="text-[0.9rem] font-bold text-gray-500 uppercase tracking-tighter">{admin.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal Operations */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={handleCancel} disabled={loading}
                    className="flex-1 h-16 flex items-center justify-center gap-3 rounded-[22px] border border-gray-100 bg-white font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <X size={20} strokeWidth={3} />
                    Abort
                  </button>
                  <button
                    onClick={handleSave} disabled={loading || isUploadingImage}
                    className="flex-[2] h-16 flex items-center justify-center gap-3 rounded-[22px] bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} strokeWidth={3} />}
                    Sync Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
