'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  UserX,
  ShieldOff,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchAllUsers, fetchUserStats, toggleUserStatus } from '@/store/slices/userSlice';
import type { IUser } from '@/types/user';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const toProxyUrl = (urlOrKey: string): string => {
  if (!urlOrKey) return '';
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${API_BASE}/api/admin/upload/image?key=${encodeURIComponent(key)}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Avatar ───────────────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: IUser }) {
  const [err, setErr] = useState(false);
  const proxyUrl = user.profileImage ? toProxyUrl(user.profileImage) : '';

  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-[14px] border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 shadow-sm">
      {proxyUrl && !err ? (
        <img
          src={proxyUrl}
          alt={user.name}
          className="h-full w-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="text-[1rem] font-bold text-[#10b981]">{user.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

// ─── Row variants ─────────────────────────────────────────────────────────────

const rowVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
  exit:    { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, stats, isLoading, statsLoading, toggling, error } =
    useAppSelector((s: RootState) => s.users);

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchUserStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'active')  result = result.filter(u => u.isActive);
    if (statusFilter === 'blocked') result = result.filter(u => !u.isActive);
    return result;
  }, [users, search, statusFilter]);

  const handleToggle = async (user: IUser) => {
    const nextState = user.isActive ? 'blocked' : 'unblocked';
    try {
      await dispatch(toggleUserStatus(user._id)).unwrap();
      toast.success(`${user.name} has been ${nextState}`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-8">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">User Directory</h1>
            <p className="text-[0.95rem] font-medium text-gray-500 mt-1">
              Maintain and monitor your restaurant's registered customers
            </p>
          </div>
        </motion.div>

        {/* ── Stat Highlights ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {([
            { label: 'Total Base',   value: stats.total,   Icon: UsersIcon,  color: 'emerald' },
            { label: 'Active Now',   value: stats.active,  Icon: UserCheck,  color: 'blue'    },
            { label: 'Blocked',      value: stats.blocked, Icon: ShieldOff,  color: 'red'     },
          ] as const).map(({ label, value, Icon, color }) => (
            <div key={label} className="group relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-7 shadow-sm transition-all hover:shadow-md">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                  {statsLoading ? (
                    <div className="mt-2 h-9 w-16 animate-pulse rounded-xl bg-gray-50" />
                  ) : (
                    <p className="mt-1 text-[2rem] font-bold text-gray-900 leading-none">{value}</p>
                  )}
                </div>
                <div className={`rounded-2xl p-4 ${
                  color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-3 rounded-[28px] border border-gray-100 shadow-sm"
        >
          <div className="relative flex-1">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-14 rounded-[22px] border-none bg-gray-50 pl-14 pr-6 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div className="flex bg-gray-100/50 p-1.5 rounded-[22px] gap-1 shrink-0">
            {(['all', 'active', 'blocked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-[18px] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Table Container ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/30">
                  <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">User Identity</th>
                  <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 hidden md:table-cell">Account Details</th>
                  <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 hidden lg:table-cell">Membership</th>
                  <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Security Status</th>
                  <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-8 py-4"><div className="h-16 animate-pulse rounded-2xl bg-gray-50" /></td></tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mb-5 border border-gray-100">
                            <UsersIcon size={40} className="text-gray-200" />
                          </div>
                          <p className="text-[1.1rem] font-bold text-gray-900">No matching users</p>
                          <p className="text-[0.9rem] font-medium text-gray-500 mt-1">Try refining your search terms or filters</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, i) => (
                      <motion.tr
                        key={user._id} custom={i} variants={rowVariants} initial="hidden" animate="visible" exit="exit"
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Identity */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <UserAvatar user={user} />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight truncate">{user.name}</p>
                              <p className="text-[0.7rem] font-bold text-gray-400 truncate mt-1">UID: {user._id.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email Details */}
                        <td className="hidden px-6 py-5 md:table-cell">
                          <p className="text-[0.95rem] font-bold text-gray-600 truncate">{user.email}</p>
                        </td>

                        {/* Joined Date */}
                        <td className="hidden px-6 py-5 lg:table-cell">
                          <p className="text-[0.95rem] font-bold text-gray-400">{formatDate(user.createdAt)}</p>
                        </td>

                        {/* Security Badge */}
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider border shadow-sm ${
                            user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                            {user.isActive ? 'Access Granted' : 'Access Restricted'}
                          </span>
                        </td>

                        {/* Access Control */}
                        <td className="px-8 py-5">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleToggle(user)}
                              disabled={toggling === user._id}
                              className={`flex items-center justify-center gap-2 rounded-2xl h-[46px] px-5 text-[0.8rem] font-bold transition-all active:scale-95 border ${
                                user.isActive
                                  ? 'bg-white border-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100'
                                  : 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600 shadow-sm'
                              }`}
                            >
                              {toggling === user._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : user.isActive ? (
                                <ShieldOff size={18} strokeWidth={2.5} />
                              ) : (
                                <ShieldCheck size={18} strokeWidth={2.5} />
                              )}
                              <span>{user.isActive ? 'Restrict Access' : 'Restore Access'}</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {!isLoading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-8 text-[0.85rem] font-bold text-gray-400 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100/50">
            <span>Showing records 1 - {filteredUsers.length}</span>
            <span className="uppercase tracking-widest">Total Population: {users.length}</span>
          </div>
        )}
      </div>
    </>
  );
}
