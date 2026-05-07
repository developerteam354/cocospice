import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'red' | 'slate' | 'blue' | 'amber';
  loading?: boolean;
}

const colorMap = {
  indigo: { bg: 'bg-indigo-600', border: 'border-indigo-700', icon: 'text-white shadow-lg shadow-indigo-500/30' },
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-600', icon: 'text-white shadow-lg shadow-emerald-500/30' },
  red: { bg: 'bg-red-500', border: 'border-red-600', icon: 'text-white shadow-lg shadow-red-500/30' },
  slate: { bg: 'bg-gray-800', border: 'border-gray-900', icon: 'text-white shadow-lg shadow-gray-800/30' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-700', icon: 'text-white shadow-lg shadow-blue-500/30' },
  amber: { bg: 'bg-amber-500', border: 'border-amber-600', icon: 'text-white shadow-lg shadow-amber-500/30' },
};


export default function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  const c = colorMap[color] || colorMap.slate;
  return (
    <div className={`rounded-[24px] border ${c.border} bg-white p-5 flex items-center gap-5 shadow-sm transition-all hover:shadow-md`}>
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${c.border} ${c.bg} ${c.icon}`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <div>

        <p className="text-[0.8rem] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        {loading ? (
          <div className="mt-2 h-7 w-16 animate-pulse rounded bg-gray-100" />
        ) : (
          <p className="text-[1.6rem] font-bold text-gray-900 leading-tight mt-0.5">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
