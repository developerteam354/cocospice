interface BadgeProps {
  variant: 'green' | 'orange' | 'amber' | 'red' | 'slate';
  children: React.ReactNode;
}

const styles: Record<BadgeProps['variant'], string> = {
  green:  'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20',
  orange: 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20',
  amber:  'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20',
  red:    'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20',
  slate:  'bg-gray-800 text-white border-gray-900 shadow-md shadow-gray-800/20',
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.05em] transition-all duration-300 ${styles[variant]}`}>
      <span className="relative flex h-1.5 w-1.5 mr-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-20 ${variant === 'slate' ? 'bg-gray-400' : styles[variant].split(' ')[1].replace('text', 'bg')}`}></span>
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${variant === 'slate' ? 'bg-gray-400' : styles[variant].split(' ')[1].replace('text', 'bg')}`}></span>
      </span>
      {children}
    </span>
  );
}
